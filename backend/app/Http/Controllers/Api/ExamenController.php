<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Examen;
use Illuminate\Http\Request;

class ExamenController extends Controller
{
    public function index()
    {
        return response()->json(Examen::with(['module.filiere', 'module.professeur', 'classe'])->get());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'module_id' => 'required|exists:modules,id',
            'classe_id' => 'nullable|exists:classes,id',
            'type' => 'required|in:controle,examen_final,rattrapage',
            'date' => 'required|date',
            'heure' => 'required',
            'salle' => 'required|string',
        ]);

        $examen = Examen::create($validated);
        return response()->json($examen->load(['module', 'classe']), 201);
    }

    public function show(Examen $examen)
    {
        return response()->json($examen->load(['module', 'classe']));
    }

    public function update(Request $request, Examen $examen)
    {
        $validated = $request->validate([
            'module_id' => 'required|exists:modules,id',
            'classe_id' => 'nullable|exists:classes,id',
            'type' => 'required|in:controle,examen_final,rattrapage',
            'date' => 'required|date',
            'heure' => 'required',
            'salle' => 'required|string',
        ]);

        $examen->update($validated);
        return response()->json($examen->load(['module', 'classe']));
    }

    public function destroy(Examen $examen)
    {
        $examen->delete();
        return response()->json(['message' => 'Examen supprimé']);
    }
}
