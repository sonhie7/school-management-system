<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Classe;
use Illuminate\Http\Request;

class ClasseController extends Controller
{
    public function index()
    {
        return response()->json(Classe::with('filiere')->get());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nom' => 'required|string',
            'niveau' => 'required|string',
            'filiere_id' => 'required|exists:filieres,id',
        ]);

        $classe = Classe::create($validated);
        return response()->json($classe->load('filiere'), 201);
    }

    public function show(Classe $classe)
    {
        return response()->json($classe->load(['filiere', 'etudiants']));
    }

    public function update(Request $request, Classe $classe)
    {
        $validated = $request->validate([
            'nom' => 'required|string',
            'niveau' => 'required|string',
            'filiere_id' => 'required|exists:filieres,id',
        ]);

        $classe->update($validated);
        return response()->json($classe->load('filiere'));
    }

    public function destroy(Classe $classe)
    {
        $classe->delete();
        return response()->json(['message' => 'Classe supprimée']);
    }
}
