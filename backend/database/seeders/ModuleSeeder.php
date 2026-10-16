<?php

namespace Database\Seeders;

use App\Models\Filiere;
use App\Models\Module;
use App\Models\Professeur;
use Illuminate\Database\Seeder;

class ModuleSeeder extends Seeder
{
    public function run(): void
    {
        $filieres = Filiere::all();
        $professeurs = Professeur::all();

        $modulesData = [
            'Génie Informatique' => [
                ['nom' => 'Programmation Web', 'code' => 'PW101', 'volume_horaire' => 60, 'coefficient' => 3.0],
                ['nom' => 'Base de Données', 'code' => 'BD102', 'volume_horaire' => 45, 'coefficient' => 2.5],
                ['nom' => 'Réseaux', 'code' => 'RS103', 'volume_horaire' => 50, 'coefficient' => 2.0],
            ],
            'Génie Civil' => [
                ['nom' => 'Résistance des Matériaux', 'code' => 'RM201', 'volume_horaire' => 55, 'coefficient' => 3.0],
                ['nom' => 'Béton Armé', 'code' => 'BA202', 'volume_horaire' => 50, 'coefficient' => 2.5],
            ],
            'Génie Électrique' => [
                ['nom' => 'Électromagnétisme', 'code' => 'EM301', 'volume_horaire' => 45, 'coefficient' => 2.5],
                ['nom' => 'Électronique', 'code' => 'EL302', 'volume_horaire' => 40, 'coefficient' => 2.0],
            ],
            'Gestion des Entreprises' => [
                ['nom' => 'Comptabilité', 'code' => 'CP401', 'volume_horaire' => 50, 'coefficient' => 2.5],
                ['nom' => 'Marketing', 'code' => 'MK402', 'volume_horaire' => 40, 'coefficient' => 2.0],
            ],
            'Sciences Mathématiques' => [
                ['nom' => 'Analyse', 'code' => 'AN501', 'volume_horaire' => 60, 'coefficient' => 3.0],
                ['nom' => 'Algèbre', 'code' => 'AL502', 'volume_horaire' => 50, 'coefficient' => 2.5],
            ],
        ];

        foreach ($filieres as $filiere) {
            if (isset($modulesData[$filiere->nom])) {
                foreach ($modulesData[$filiere->nom] as $moduleData) {
                    Module::create([
                        'nom' => $moduleData['nom'],
                        'code' => $moduleData['code'],
                        'filiere_id' => $filiere->id,
                        'volume_horaire' => $moduleData['volume_horaire'],
                        'coefficient' => $moduleData['coefficient'],
                        'professeur_id' => $professeurs->random()->id,
                    ]);
                }
            }
        }
    }
}
