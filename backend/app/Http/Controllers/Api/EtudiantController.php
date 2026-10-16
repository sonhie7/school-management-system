<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Etudiant;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class EtudiantController extends Controller
{
    public function index()
    {
        $etudiants = Etudiant::with(['filiere', 'classe', 'user'])->get();
        return response()->json($etudiants);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'cin' => 'required|string|unique:etudiants',
            'nom' => 'required|string|max:255',
            'prenom' => 'required|string|max:255',
            'sexe' => 'required|in:M,F',
            'date_naissance' => 'required|date',
            'telephone' => 'required|string',
            'email' => 'required|email|unique:etudiants',
            'adresse' => 'required|string',
            'filiere_id' => 'required|exists:filieres,id',
            'classe_id' => 'required|exists:classes,id',
            'niveau' => 'required|string',
            'date_inscription' => 'required|date',
        ]);

        $tempPassword = $validated['cin'];

        $user = User::create([
            'name' => $validated['prenom'] . ' ' . $validated['nom'],
            'email' => $validated['email'],
            'password' => Hash::make($tempPassword),
            'role' => 'etudiant',
        ]);
        $user->assignRole('etudiant');

        $validated['user_id'] = $user->id;
        $etudiant = Etudiant::create($validated);

        return response()->json([
            'etudiant' => $etudiant->load(['filiere', 'classe']),
            'temp_password' => $tempPassword,
        ], 201);
    }

    public function show(Etudiant $etudiant)
    {
        return response()->json($etudiant->load(['filiere', 'classe', 'user']));
    }

    public function update(Request $request, Etudiant $etudiant)
    {
        $validated = $request->validate([
            'cin' => 'required|string|unique:etudiants,cin,' . $etudiant->id,
            'nom' => 'required|string|max:255',
            'prenom' => 'required|string|max:255',
            'sexe' => 'required|in:M,F',
            'date_naissance' => 'required|date',
            'telephone' => 'required|string',
            'email' => 'required|email|unique:etudiants,email,' . $etudiant->id,
            'adresse' => 'required|string',
            'filiere_id' => 'required|exists:filieres,id',
            'classe_id' => 'required|exists:classes,id',
            'niveau' => 'required|string',
        ]);

        $etudiant->update($validated);

        $etudiant->user->update([
            'name' => $validated['prenom'] . ' ' . $validated['nom'],
            'email' => $validated['email'],
        ]);

        return response()->json($etudiant->load(['filiere', 'classe']));
    }

    public function destroy(Etudiant $etudiant)
    {
        $etudiant->user->delete();
        $etudiant->delete();
        return response()->json(['message' => 'Étudiant supprimé']);
    }
}
