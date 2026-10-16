<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Classe;
use App\Models\Module;
use App\Models\Professeur;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ProfesseurDashboardController extends Controller
{
    // ========== MÉTHODES EXISTANTES ==========

    public function dashboard()
    {
        $professeur = Auth::user()->professeur;

        return response()->json([
            'modules' => $professeur->modules()->count(),
            'classes' => $professeur->modules()->with('filiere.classes')->get()->pluck('filiere.classes')->flatten()->unique('id')->count(),
            'etudiants' => $professeur->modules()->withCount('notes')->get()->sum('notes_count'),
        ]);
    }

    public function mesModules()
    {
        $professeur = Auth::user()->professeur;
        return response()->json($professeur->modules()->with('filiere')->get());
    }

    public function mesClasses()
    {
        $professeur = Auth::user()->professeur;
        $modules = $professeur->modules()->with('filiere')->get();
        $classes = Classe::whereIn('filiere_id', $modules->pluck('filiere_id'))->with('filiere')->get();
        return response()->json($classes);
    }

    public function etudiantsParClasse(Classe $classe)
    {
        $professeur = Auth::user()->professeur;
        
        // Vérifier que le professeur enseigne dans cette classe
        // (via les modules de la filière de la classe)
        $professeurFiliereIds = $professeur->modules()->pluck('filiere_id')->unique();
        if (!$professeurFiliereIds->contains($classe->filiere_id)) {
            return response()->json(['message' => 'Vous n\'enseignez pas dans cette classe'], 403);
        }
        
        return response()->json($classe->etudiants()->with('filiere')->get());
    }

    // ========== NOUVELLES MÉTHODES (ou alias) ==========

    /**
     * Alias de mesModules pour compatibilité
     */
    public function mesModulesUniques()
    {
        return $this->mesModules();
    }

    /**
     * Alias de mesClasses pour compatibilité
     */
    public function mesClassesUniques()
    {
        return $this->mesClasses();
    }

    /**
     * Récupérer les étudiants pour les notes
     */
    public function etudiantsPourNotes(Classe $classe, Module $module)
    {
        $user = Auth::user();
        $professeur = $user->professeur;

        if (!$professeur) {
            return response()->json(['error' => 'Profil professeur non trouvé'], 404);
        }

        // Vérifier que le professeur enseigne ce module
        if ($module->professeur_id !== $professeur->id) {
            return response()->json([
                'error' => 'Vous n\'enseignez pas ce module',
                'votre_id' => $professeur->id,
                'module_professeur_id' => $module->professeur_id,
            ], 403);
        }

        // Vérifier que la classe est dans la filière du module
        if ($classe->filiere_id !== $module->filiere_id) {
            return response()->json(['error' => 'Cette classe ne suit pas ce module'], 403);
        }

        // Récupérer les étudiants
        $etudiants = $classe->etudiants()
            ->with('user')
            ->get()
            ->map(function ($etudiant) use ($module) {
                $note = $etudiant->notes()
                    ->where('module_id', $module->id)
                    ->first();

                return [
                    'id' => $etudiant->id,
                    'user_id' => $etudiant->user_id,
                    'nom' => $etudiant->nom,
                    'prenom' => $etudiant->prenom,
                    'matricule' => $etudiant->matricule,
                    'note' => $note ? $note->note : null,
                    'note_id' => $note ? $note->id : null,
                ];
            });

        return response()->json([
            'classe' => $classe,
            'module' => $module,
            'etudiants' => $etudiants,
        ]);
    }
}