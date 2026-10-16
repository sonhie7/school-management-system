<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Cour;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;

class CourController extends Controller
{
    public function index()
    {
        $professeur = Auth::user()->professeur;
        $cours = Cour::where('professeur_id', $professeur->id)
            ->with(['module', 'professeur', 'classe'])
            ->get();
        return response()->json($cours);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'titre' => 'required|string|max:255',
            'module_id' => 'required|exists:modules,id',
            'classe_id' => 'required|exists:classes,id',
            'fichier' => 'required|file|mimes:pdf,doc,docx,ppt,pptx|max:10240',
        ]);

        $professeur = Auth::user()->professeur;
        
        // Vérifier que le professeur enseigne ce module
        $module = \App\Models\Module::find($validated['module_id']);
        if (!$module || $module->professeur_id !== $professeur->id) {
            return response()->json(['message' => 'Vous n\'enseignez pas ce module'], 403);
        }
        
        // Vérifier que la classe est dans la filière du module
        $classe = \App\Models\Classe::find($validated['classe_id']);
        if (!$classe || $classe->filiere_id !== $module->filiere_id) {
            return response()->json(['message' => 'Cette classe ne suit pas ce module'], 403);
        }
        
        $file = $request->file('fichier');
        $filename = time() . '_' . $file->getClientOriginalName();
        $file->storeAs('public/cours', $filename);

        $cour = Cour::create([
            'titre' => $validated['titre'],
            'module_id' => $validated['module_id'],
            'classe_id' => $validated['classe_id'],
            'professeur_id' => $professeur->id,
            'fichier' => $filename,
            'type_fichier' => $file->getClientOriginalExtension(),
        ]);

        return response()->json($cour->load(['module', 'professeur', 'classe']), 201);
    }

    public function destroy(Cour $cour)
    {
        $professeur = Auth::user()->professeur;
        
        if ($cour->professeur_id !== $professeur->id) {
            return response()->json(['message' => 'Non autorisé'], 403);
        }
        
        Storage::delete('public/cours/' . $cour->fichier);
        $cour->delete();
        return response()->json(['message' => 'Cours supprimé']);
    }

    public function download(Cour $cour)
    {
        $user = Auth::user();
        
        // Vérifier que l'utilisateur a accès à ce cours
        if ($user->isProfesseur() && $cour->professeur_id !== $user->professeur->id) {
            return response()->json(['message' => 'Non autorisé'], 403);
        }
        
        if ($user->isEtudiant()) {
            $etudiant = $user->etudiant;
            // Only allow if the course's classe matches the student's classe
            if ($cour->classe_id && $cour->classe_id !== $etudiant->classe_id) {
                return response()->json(['message' => 'Ce cours n\'est pas destiné à votre classe'], 403);
            }
            // If no classe_id is set, fall back to filiere check (legacy courses)
            if (!$cour->classe_id) {
                $moduleIds = $etudiant->classe->filiere->modules()->pluck('id');
                if (!$moduleIds->contains($cour->module_id)) {
                    return response()->json(['message' => 'Non autorisé'], 403);
                }
            }
        }
        
        return Storage::download('public/cours/' . $cour->fichier, $cour->titre . '.' . $cour->type_fichier);
    }
}
