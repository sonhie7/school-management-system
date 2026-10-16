<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Devoir;
use App\Models\Soumission;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;

class SoumissionController extends Controller
{
    /**
     * List all submissions for a specific devoir (professor only)
     */
    public function index(Devoir $devoir)
    {
        $professeur = Auth::user()->professeur;

        if ($devoir->professeur_id !== $professeur->id) {
            return response()->json(['message' => 'Non autorisé'], 403);
        }

        $soumissions = $devoir->soumissions()
            ->with('etudiant')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($soumissions);
    }

    /**
     * Student submits a file for a devoir
     */
    public function store(Request $request, Devoir $devoir)
    {
        $etudiant = Auth::user()->etudiant;

        // Check if deadline has passed
        if (now()->gt($devoir->date_limite)) {
            return response()->json(['message' => 'La date limite est dépassée'], 403);
        }

        // Check if student already submitted
        $existing = Soumission::where('devoir_id', $devoir->id)
            ->where('etudiant_id', $etudiant->id)
            ->first();

        if ($existing) {
            return response()->json(['message' => 'Vous avez déjà soumis ce devoir'], 403);
        }

        $validated = $request->validate([
            'fichier' => 'required|file|mimes:pdf,doc,docx,zip,rar|max:10240',
            'commentaire' => 'nullable|string',
        ]);

        $file = $request->file('fichier');
        $filename = time() . '_' . $etudiant->id . '_' . $file->getClientOriginalName();
        $file->storeAs('public/soumissions', $filename);

        $soumission = Soumission::create([
            'devoir_id' => $devoir->id,
            'etudiant_id' => $etudiant->id,
            'fichier' => $filename,
            'commentaire' => $validated['commentaire'] ?? null,
        ]);

        return response()->json($soumission->load('etudiant'), 201);
    }

    /**
     * Download a submission file (professor only)
     */
    public function download(Soumission $soumission)
    {
        $professeur = Auth::user()->professeur;

        if ($soumission->devoir->professeur_id !== $professeur->id) {
            return response()->json(['message' => 'Non autorisé'], 403);
        }

        $path = storage_path('app/public/soumissions/' . $soumission->fichier);

        if (!file_exists($path)) {
            return response()->json(['message' => 'Fichier non trouvé'], 404);
        }

        return response()->download($path);
    }
}
