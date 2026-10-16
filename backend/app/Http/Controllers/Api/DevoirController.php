<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Devoir;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;

class DevoirController extends Controller
{
    public function index()
    {
        $professeur = Auth::user()->professeur;
        $devoirs = Devoir::with(['module', 'professeur', 'classe', 'soumissions'])
            ->where('professeur_id', $professeur->id)
            ->get();
        return response()->json($devoirs);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'titre' => 'required|string',
            'description' => 'required|string',
            'type' => 'required|in:TP,Projet,Devoir_maison',
            'module_id' => 'required|exists:modules,id',
            'classe_id' => 'nullable|exists:classes,id',
            'date_limite' => 'required|date',
            'fichier' => 'nullable|file|mimes:pdf,doc,docx|max:10240',
        ]);

        $professeur = Auth::user()->professeur;
        $filename = null;

        if ($request->hasFile('fichier')) {
            $file = $request->file('fichier');
            $filename = time() . '_' . $file->getClientOriginalName();
            $file->storeAs('public/devoirs', $filename);
        }

        $devoir = Devoir::create([
            'titre' => $validated['titre'],
            'description' => $validated['description'],
            'type' => $validated['type'],
            'module_id' => $validated['module_id'],
            'classe_id' => $validated['classe_id'] ?? null,
            'professeur_id' => $professeur->id,
            'date_limite' => $validated['date_limite'],
            'fichier' => $filename,
        ]);

        return response()->json($devoir->load(['module', 'professeur']), 201);
    }

    public function show(Devoir $devoir)
    {
        $professeur = Auth::user()->professeur;
        
        if ($devoir->professeur_id !== $professeur->id) {
            return response()->json(['message' => 'Non autorisé'], 403);
        }
        
        return response()->json($devoir->load(['module', 'professeur', 'classe', 'soumissions.etudiant']));
    }

    public function update(Request $request, Devoir $devoir)
    {
        $professeur = Auth::user()->professeur;
        
        if ($devoir->professeur_id !== $professeur->id) {
            return response()->json(['message' => 'Non autorisé'], 403);
        }

        $validated = $request->validate([
            'titre' => 'required|string',
            'description' => 'required|string',
            'type' => 'required|in:TP,Projet,Devoir_maison',
            'module_id' => 'required|exists:modules,id',
            'classe_id' => 'nullable|exists:classes,id',
            'date_limite' => 'required|date',
            'fichier' => 'nullable|file|mimes:pdf,doc,docx|max:10240',
        ]);

        $filename = $devoir->fichier;

        if ($request->hasFile('fichier')) {
            // Delete old file
            if ($devoir->fichier) {
                Storage::delete('public/devoirs/' . $devoir->fichier);
            }
            $file = $request->file('fichier');
            $filename = time() . '_' . $file->getClientOriginalName();
            $file->storeAs('public/devoirs', $filename);
        }

        $devoir->update([
            'titre' => $validated['titre'],
            'description' => $validated['description'],
            'type' => $validated['type'],
            'module_id' => $validated['module_id'],
            'classe_id' => $validated['classe_id'] ?? null,
            'date_limite' => $validated['date_limite'],
            'fichier' => $filename,
        ]);

        return response()->json($devoir->load(['module', 'professeur', 'classe']));
    }

    public function download(Devoir $devoir)
    {
        $path = storage_path('app/public/devoirs/' . $devoir->fichier);

        if (!file_exists($path)) {
            return response()->json(['message' => 'Fichier non trouvé'], 404);
        }

        return response()->download($path);
    }

    public function destroy(Devoir $devoir)
    {
        $professeur = Auth::user()->professeur;
        
        if ($devoir->professeur_id !== $professeur->id) {
            return response()->json(['message' => 'Non autorisé'], 403);
        }
        
        if ($devoir->fichier) {
            Storage::delete('public/devoirs/' . $devoir->fichier);
        }
        $devoir->delete();
        return response()->json(['message' => 'Devoir supprimé']);
    }
}
