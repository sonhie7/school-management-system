<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminSeeder extends Seeder
{
    public function run(): void
    {
        $admin = User::create([
            'name' => 'Administrateur',
            'email' => 'admin@school.com',
            'password' => Hash::make('admin123'),
            'role' => 'admin',
        ]);
        $admin->assignRole('admin');
    }
}
