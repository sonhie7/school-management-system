<?php

namespace Database\Seeders;

use App\Models\Filiere;
use Illuminate\Database\Seeder;

class FiliereSeeder extends Seeder
{
    public function run(): void
    {
        $filieres = [
            ['nom' => 'Génie Informatique', 'code' => 'GI', 'description' => 'Développement logiciel et réseaux'],
            ['nom' => 'Génie Civil', 'code' => 'GC', 'description' => 'Construction et bâtiment'],
            ['nom' => 'Génie Électrique', 'code' => 'GE', 'description' => 'Électronique et énergie'],
            ['nom' => 'Gestion des Entreprises', 'code' => 'GENT', 'description' => 'Management et finance'],
            ['nom' => 'Sciences Mathématiques', 'code' => 'SM', 'description' => 'Mathématiques appliquées'],
        ];

        foreach ($filieres as $filiere) {
            Filiere::create($filiere);
        }
    }
}
