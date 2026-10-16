<?php

namespace Database\Seeders;

use App\Models\Classe;
use App\Models\Etudiant;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class EtudiantSeeder extends Seeder
{
    public function run(): void
    {
        $classes = Classe::all();
        $noms = ['El Amrani', 'Bennani', 'Fassi', 'Idrissi', 'Tazi', 'Lahcen', 'Moussaoui', 'Raji'];
        $prenoms = ['Youssef', 'Aya', 'Mehdi', 'Salma', 'Omar', 'Lina', 'Amine', 'Nadia'];

        foreach ($classes as $classe) {
            for ($i = 0; $i < 5; $i++) {
                $nom = $noms[array_rand($noms)];
                $prenom = $prenoms[array_rand($prenoms)];
                $cin = strtoupper(substr(str_shuffle('ABCDEFGHIJKLMNOPQRSTUVWXYZ'), 0, 2)) . rand(100000, 999999);

                $user = User::create([
                    'name' => $prenom . ' ' . $nom,
                    'email' => strtolower($prenom) . '.' . strtolower($nom) . rand(1, 999) . '@school.com',
                    'password' => Hash::make($cin),
                    'role' => 'etudiant',
                ]);
                $user->assignRole('etudiant');

                Etudiant::create([
                    'cin' => $cin,
                    'nom' => $nom,
                    'prenom' => $prenom,
                    'sexe' => rand(0, 1) ? 'M' : 'F',
                    'date_naissance' => now()->subYears(rand(18, 25))->format('Y-m-d'),
                    'telephone' => '06' . rand(10000000, 99999999),
                    'email' => $user->email,
                    'adresse' => 'Rue ' . rand(1, 100) . ', Casablanca',
                    'filiere_id' => $classe->filiere_id,
                    'classe_id' => $classe->id,
                    'niveau' => $classe->niveau,
                    'date_inscription' => now()->subMonths(rand(1, 12))->format('Y-m-d'),
                    'user_id' => $user->id,
                ]);
            }
        }
    }
}
