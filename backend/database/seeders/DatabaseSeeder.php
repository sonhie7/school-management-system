<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            RolePermissionSeeder::class,
            FiliereSeeder::class,
            ClasseSeeder::class,
            AdminSeeder::class,
            ProfesseurSeeder::class,
            EtudiantSeeder::class,
            ModuleSeeder::class,
        ]);
    }
}
