<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Module;
use Illuminate\Http\Request;

class ModuleController extends Controller
{
    public function index()
    {
        return response()->json(Module::with(['filiere', 'classe', 'professeur'])->get());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nom' => 'required|string|max:255',
            'code' => 'required|string|unique:modules',
            'filiere_id' => 'required|exists:filieres,id',
            'classe_id' => 'nullable|exists:classes,id',
            'volume_horaire' => 'required|integer',
            'coefficient' => 'required|numeric|min:0',
            'professeur_id' => 'required|exists:professeurs,id',
        ]);

        $module = Module::create($validated);
        return response()->json($module->load(['filiere', 'classe', 'professeur']), 201);
    }

    public function show(Module $module)
    {
        return response()->json($module->load(['filiere', 'classe', 'professeur']));
    }

    public function update(Request $request, Module $module)
    {
        $validated = $request->validate([
            'nom' => 'required|string|max:255',
            'code' => 'required|string|unique:modules,code,' . $module->id,
            'filiere_id' => 'required|exists:filieres,id',
            'classe_id' => 'nullable|exists:classes,id',
            'volume_horaire' => 'required|integer',
            'coefficient' => 'required|numeric|min:0',
            'professeur_id' => 'required|exists:professeurs,id',
        ]);

        $module->update($validated);
        return response()->json($module->load(['filiere', 'classe', 'professeur']));
    }

    public function destroy(Module $module)
    {
        $module->delete();
        return response()->json(['message' => 'Module supprimé']);
    }

    /**
     * Retourne le professeur assigné à ce module
     */
    public function getProfesseurs(Module $module)
    {
        $professeur = $module->professeur;
        
        if (!$professeur) {
            return response()->json([]);
        }

        return response()->json([$professeur]);
    }
}
