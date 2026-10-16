<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Filiere;
use Illuminate\Http\Request;

class FiliereController extends Controller
{
    public function index()
    {
        return response()->json(Filiere::all());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nom' => 'required|string|unique:filieres',
            'code' => 'required|string|unique:filieres',
            'description' => 'nullable|string',
        ]);

        $filiere = Filiere::create($validated);
        return response()->json($filiere, 201);
    }

    public function show(Filiere $filiere)
    {
        return response()->json($filiere->load(['classes', 'etudiants', 'modules']));
    }

    public function update(Request $request, Filiere $filiere)
    {
        $validated = $request->validate([
            'nom' => 'required|string|unique:filieres,nom,' . $filiere->id,
            'code' => 'required|string|unique:filieres,code,' . $filiere->id,
            'description' => 'nullable|string',
        ]);

        $filiere->update($validated);
        return response()->json($filiere);
    }

    public function destroy(Filiere $filiere)
    {
        $filiere->delete();
        return response()->json(['message' => 'Filière supprimée']);
    }
}
