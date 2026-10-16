<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Absence;
use App\Models\Classe;
use App\Models\Etudiant;
use App\Models\Module;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class AbsenceController extends Controller
{
    public function getEtudiantsParClasse(Classe $classe, Module $module)
    {
        $professeur = Auth::user()->professeur;
        
        // Vérifier que le professeur enseigne ce module
        if ($module->professeur_id !== $professeur->id) {
            return response()->json(['message' => 'Vous n\'enseignez pas ce module'], 403);
        }
        
        // Vérifier que la classe est dans la filière du module
        if ($classe->filiere_id !== $module->filiere_id) {
            return response()->json(['message' => 'Cette classe ne suit pas ce module'], 403);
        }
        
        $etudiants = Etudiant::where('classe_id', $classe->id)
            ->with(['absences' => function($q) use ($module) {
                $q->where('module_id', $module->id)->where('date', now()->toDateString());
            }])
            ->get();

        return response()->json($etudiants);
    }

    public function storeAbsences(Request $request)
    {
        $validated = $request->validate([
            'classe_id' => 'required|exists:classes,id',
            'module_id' => 'required|exists:modules,id',
            'date' => 'required|date',
            'absences' => 'required|array',
            'absences.*.etudiant_id' => 'required|exists:etudiants,id',
            'absences.*.statut' => 'required|in:present,absent',
        ]);

        $professeur = Auth::user()->professeur;

        foreach ($validated['absences'] as $absenceData) {
            Absence::updateOrCreate(
                [
                    'etudiant_id' => $absenceData['etudiant_id'],
                    'module_id' => $validated['module_id'],
                    'date' => $validated['date'],
                ],
                [
                    'statut' => $absenceData['statut'],
                    'professeur_id' => $professeur->id,
                ]
            );
        }

        return response()->json(['message' => 'Absences enregistrées avec succès']);
    }

    public function getAbsencesEtudiant()
    {
        $etudiant = Auth::user()->etudiant;
        $absences = Absence::where('etudiant_id', $etudiant->id)
            ->with(['module', 'professeur'])
            ->orderBy('date', 'desc')
            ->get();

        return response()->json($absences);
    }
}
