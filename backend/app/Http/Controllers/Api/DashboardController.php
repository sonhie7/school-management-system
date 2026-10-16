<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Absence;
use App\Models\Classe;
use App\Models\Etudiant;
use App\Models\Filiere;
use App\Models\Module;
use App\Models\Professeur;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function stats()
    {
        $today = now()->toDateString();

        return response()->json([
            'etudiants' => Etudiant::count(),
            'professeurs' => Professeur::count(),
            'modules' => Module::count(),
            'classes' => Classe::count(),
            'absences_today' => Absence::where('date', $today)->where('statut', 'absent')->count(),
            'etudiants_par_filiere' => Filiere::withCount('etudiants')->limit(10)->get(),
        ]);
    }
}
