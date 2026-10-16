<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['Les identifiants sont incorrects.'],
            ]);
        }

        $token = $user->createToken('auth-token')->plainTextToken;

        $profile = null;
        if ($user->isEtudiant()) {
            $profile = $user->etudiant()->with(['filiere', 'classe'])->first();
        } elseif ($user->isProfesseur()) {
            $profile = $user->professeur()->with('modules')->first();
        }

        return response()->json([
            'token' => $token,
            'user' => $user,
            'profile' => $profile,
            'role' => $user->role,
        ]);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();
        return response()->json(['message' => 'Déconnecté avec succès']);
    }

    public function me(Request $request)
    {
        $user = $request->user();
        $profile = null;

        if ($user->isEtudiant()) {
            $profile = $user->etudiant()->with(['filiere', 'classe'])->first();
        } elseif ($user->isProfesseur()) {
            $profile = $user->professeur()->with('modules')->first();
        }

        return response()->json([
            'user' => $user,
            'profile' => $profile,
        ]);
    }
}
