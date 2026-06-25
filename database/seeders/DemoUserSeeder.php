<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DemoUserSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $user = User::create([
            'first_name' => 'Juan',
            'last_name' => 'Dela Cruz',
            'email' => 'runner@example.com',
            'status' => 'active',
            'runner_code' => 'SSP-000001',
            'verified' => true,
            'birthday' => '2002-04-15',
            'gender' => 'Male',
            'province' => 'Davao del Sur',
            'city' => 'Davao City',
            'email_verified_at' => now(),
            'password' => Hash::make('password'),
        ]);
    }
}
