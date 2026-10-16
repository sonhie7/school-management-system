<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Professeur;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class ProfesseurController extends Controller
{
    public function index()
    {
        $professeurs = Professeur::with(['modules.filiere', 'user'])->get();
        return response()->json($professeurs);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nom' => 'required|string|max:255',
            'prenom' => 'required|string|max:255',
            'cin' => 'required|string|unique:professeurs',
            'telephone' => 'required|string',
            'email' => 'required|email|unique:professeurs',
            'departement' => 'required|string',
            'date_recrutement' => 'required|date',
        ]);

        $tempPassword = $validated['cin'];

        $user = User::create([
            'name' => $validated['prenom'] . ' ' . $validated['nom'],
            'email' => $validated['email'],
            'password' => Hash::make($tempPassword),
            'role' => 'professeur',
        ]);
        $user->assignRole('professeur');

        $validated['user_id'] = $user->id;
        $professeur = Professeur::create($validated);

        return response()->json([
            'professeur' => $professeur->load('modules'),
            'temp_password' => $tempPassword,
        ], 201);
    }

    public function show(Professeur $professeur)
    {
        return response()->json($professeur->load(['modules.filiere', 'user']));
    }

    public function update(Request $request, Professeur $professeur)
    {
        $validated = $request->validate([
            'nom' => 'required|string|max:255',
            'prenom' => 'required|string|max:255',
            'cin' => 'required|string|unique:professeurs,cin,' . $professeur->id,
            'telephone' => 'required|string',
            'email' => 'required|email|unique:professeurs,email,' . $professeur->id,
            'departement' => 'required|string',
            'date_recrutement' => 'required|date',
        ]);

        $professeur->update($validated);

        $professeur->user->update([
            'name' => $validated['prenom'] . ' ' . $validated['nom'],
            'email' => $validated['email'],
        ]);

        return response()->json($professeur->load('modules'));
    }

    public function destroy(Professeur $professeur)
    {
        $professeur->user->delete();
        $professeur->delete();
        return response()->json(['message' => 'Professeur supprimé']);
    }
}
