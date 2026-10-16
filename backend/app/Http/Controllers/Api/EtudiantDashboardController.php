<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Devoir;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class EtudiantDashboardController extends Controller
{
    public function dashboard()
    {
        $etudiant = Auth::user()->etudiant;

        return response()->json([
            'absences' => $etudiant->absences()->where('statut', 'absent')->count(),
            'modules' => $etudiant->classe->filiere->modules()->count(),
            'emploi_temps' => true,
        ]);
    }

    public function monProfil()
    {
        $etudiant = Auth::user()->etudiant->load(['filiere', 'classe']);
        return response()->json($etudiant);
    }

    public function mesModules()
    {
        $etudiant = Auth::user()->etudiant;
        
        // Get modules for the student's specific class
        // OR modules for the filiere without a specific class (legacy)
        $modules = \App\Models\Module::where(function ($query) use ($etudiant) {
                $query->where('classe_id', $etudiant->classe_id)
                      ->orWhereNull('classe_id');
            })
            ->where('filiere_id', $etudiant->classe->filiere_id)
            ->with('professeur')
            ->get();
            
        return response()->json($modules);
    }

    public function mesNotes()
    {
        $etudiant = Auth::user()->etudiant;
        $notes = $etudiant->notes()
            ->where('published', true)
            ->with(['module', 'examen'])
            ->get();
        return response()->json($notes);
    }

    public function monEmploiTemps()
    {
        $user = Auth::user();
        
        if (!$user->etudiant) {
            return response()->json(['error' => 'Profil étudiant non trouvé'], 404);
        }

        $etudiant = $user->etudiant;

        if (!$etudiant->classe) {
            return response()->json(['error' => 'Classe non trouvée'], 404);
        }

        $emplois = $etudiant->classe->emploisTemps()
            ->with(['module', 'professeur'])
            ->orderByRaw("FIELD(jour, 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi')")
            ->orderBy('heure_debut')
            ->get();

        return response()->json($emplois);
    }

    public function mesDevoirs()
    {
        $etudiant = Auth::user()->etudiant;
        
        // Get devoirs specifically for the student's class
        // OR devoirs without a specific class (legacy, visible to all in filiere)
        $devoirs = Devoir::where(function ($query) use ($etudiant) {
                $query->where('classe_id', $etudiant->classe_id)
                      ->orWhereNull('classe_id');
            })
            ->whereHas('module', function ($query) use ($etudiant) {
                $query->where('filiere_id', $etudiant->classe->filiere_id);
            })
            ->with(['module', 'professeur', 'classe'])
            ->orderBy('date_limite', 'asc')
            ->get();
        
        // Add submission status for each devoir
        $etudiantId = $etudiant->id;
        $devoirs->each(function ($devoir) use ($etudiantId) {
            $devoir->soumis = $devoir->soumissions()
                ->where('etudiant_id', $etudiantId)
                ->exists();
        });
            
        return response()->json($devoirs);
    }

    public function mesCours()
    {
        $etudiant = Auth::user()->etudiant;
        
        // Get courses specifically for the student's class
        // OR courses for the filiere without a specific class (legacy)
        $cours = \App\Models\Cour::where(function ($query) use ($etudiant) {
                $query->where('classe_id', $etudiant->classe_id)
                      ->orWhereNull('classe_id');
            })
            ->whereHas('module', function ($query) use ($etudiant) {
                $query->where('filiere_id', $etudiant->classe->filiere_id);
            })
            ->with(['module', 'professeur', 'classe'])
            ->get();
            
        return response()->json($cours);
    }
}
