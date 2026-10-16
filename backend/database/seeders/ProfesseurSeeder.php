<?php

namespace Database\Seeders;

use App\Models\Professeur;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class ProfesseurSeeder extends Seeder
{
    public function run(): void
    {
        $professeurs = [
            ['nom' => 'Alami', 'prenom' => 'Ahmed', 'cin' => 'AB123456', 'departement' => 'Informatique'],
            ['nom' => 'Benali', 'prenom' => 'Fatima', 'cin' => 'CD789012', 'departement' => 'Mathématiques'],
            ['nom' => 'Chaoui', 'prenom' => 'Karim', 'cin' => 'EF345678', 'departement' => 'Physique'],
            ['nom' => 'Driouch', 'prenom' => 'Sanaa', 'cin' => 'GH901234', 'departement' => 'Gestion'],
        ];

        foreach ($professeurs as $index => $prof) {
            $user = User::create([
                'name' => $prof['prenom'] . ' ' . $prof['nom'],
                'email' => 'prof' . ($index + 1) . '@school.com',
                'password' => Hash::make($prof['cin']),
                'role' => 'professeur',
            ]);
            $user->assignRole('professeur');

            Professeur::create([
                'nom' => $prof['nom'],
                'prenom' => $prof['prenom'],
                'cin' => $prof['cin'],
                'telephone' => '06' . rand(10000000, 99999999),
                'email' => $user->email,
                'departement' => $prof['departement'],
                'date_recrutement' => now()->subYears(rand(1, 10)),
                'user_id' => $user->id,
            ]);
        }
    }
}
