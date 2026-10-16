<?php

namespace Database\Seeders;

use App\Models\Classe;
use App\Models\Filiere;
use Illuminate\Database\Seeder;

class ClasseSeeder extends Seeder
{
    public function run(): void
    {
        $filieres = Filiere::all();
        foreach ($filieres as $filiere) {
            for ($i = 1; $i <= 3; $i++) {
                Classe::create([
                    'nom' => $filiere->code . '-' . $i,
                    'niveau' => 'Niveau ' . $i,
                    'filiere_id' => $filiere->id,
                ]);
            }
        }
    }
}
