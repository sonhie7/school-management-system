<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class RolePermissionSeeder extends Seeder
{
    public function run(): void
    {
        $adminRole = Role::create(['name' => 'admin']);
        $professeurRole = Role::create(['name' => 'professeur']);
        $etudiantRole = Role::create(['name' => 'etudiant']);

        $permissions = [
            'manage_etudiants', 'manage_professeurs', 'manage_modules',
            'manage_classes', 'manage_emplois_temps', 'manage_examens',
            'manage_notes', 'manage_absences', 'manage_cours',
            'manage_devoirs', 'view_dashboard',
        ];

        foreach ($permissions as $permission) {
            Permission::create(['name' => $permission]);
        }

        $adminRole->givePermissionTo(Permission::all());
        $professeurRole->givePermissionTo([
            'manage_notes', 'manage_absences', 'manage_cours',
            'manage_devoirs', 'view_dashboard',
        ]);
        $etudiantRole->givePermissionTo(['view_dashboard']);
    }
}
