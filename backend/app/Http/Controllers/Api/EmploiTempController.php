<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Classe;
use App\Models\EmploiTemp;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;

class EmploiTempController extends Controller
{
    public function index()
    {
        return response()->json(EmploiTemp::with(['classe', 'module', 'professeur'])->get());
    }

    public function byClasse(Classe $classe)
    {
        $emplois = EmploiTemp::with(['module', 'professeur'])
            ->where('classe_id', $classe->id)
            ->orderBy('jour')
            ->orderBy('heure_debut')
            ->get();
        return response()->json($emplois);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'classe_id' => 'required|exists:classes,id',
            'jour' => 'required|in:Lundi,Mardi,Mercredi,Jeudi,Vendredi,Samedi',
            'heure_debut' => 'required',
            'heure_fin' => 'required',
            'module_id' => 'required|exists:modules,id',
            'professeur_id' => 'required|exists:professeurs,id',
            'salle' => 'required|string',
        ]);

        $emploi = EmploiTemp::create($validated);
        return response()->json($emploi->load(['classe', 'module', 'professeur']), 201);
    }

    public function update(Request $request, EmploiTemp $emploiTemp)
    {
        $validated = $request->validate([
            'classe_id' => 'required|exists:classes,id',
            'jour' => 'required|in:Lundi,Mardi,Mercredi,Jeudi,Vendredi,Samedi',
            'heure_debut' => 'required',
            'heure_fin' => 'required',
            'module_id' => 'required|exists:modules,id',
            'professeur_id' => 'required|exists:professeurs,id',
            'salle' => 'required|string',
        ]);

        $emploiTemp->update($validated);
        return response()->json($emploiTemp->load(['classe', 'module', 'professeur']));
    }

    public function destroy(EmploiTemp $emploiTemp)
    {
        $emploiTemp->delete();
        return response()->json(['message' => 'Séance supprimée']);
    }

    public function exportPdf(Classe $classe)
    {
        $emplois = EmploiTemp::with(['module', 'professeur'])
            ->where('classe_id', $classe->id)
            ->orderBy('jour')
            ->orderBy('heure_debut')
            ->get();

        $pdf = Pdf::loadView('pdf.emploi-temps', [
            'classe' => $classe,
            'emplois' => $emplois,
        ]);

        return $pdf->download('emploi-temps-' . $classe->nom . '.pdf');
    }
}
