<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // User::factory(10)->create();

        // User::factory()->create([
        //     'first_name' => 'Test',
        //     'last_name' => 'User',
        //     'email' => 'test@example.com',
        //     'status' => 'active',
        // ]);

        $this->call(
            [
                // FullPipelineSeeder::class,
                EventCatalogSeeder::class,
                EventRosterSeeder::class,
                UnityRun2026Seeder::class,
                UnityRun2026ActivitySeeder::class,
            ],
            User::updateOrCreate(
                ['email' => 'admin@example.com'],
                [
                    'first_name' => 'SASPH',
                    'last_name' => 'Admin',
                    'status' => 'active',
                    'role' => 'admin',
                    'verified' => true,
                    'email_verified_at' => now(),
                    'password' => Hash::make('password'),
                ],
            )
        );
    }
}
