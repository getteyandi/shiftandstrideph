<?php

namespace Database\Seeders;

use App\Models\EventCategory;
use App\Models\Registration;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class RegistrationSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $user = User::where('email', 'runner@example.com')->firstOrFail();

        $unity300 = EventCategory::where('name', '300 KM')->firstOrFail();

        $davao21 = EventCategory::where('name', '21 KM')->firstOrFail();

        $davao10 = EventCategory::where('name', '10 KM')->firstOrFail();

        Registration::create([
            'user_id' => $user->id,
            'event_category_id' => $unity300->id,
            'bib_number' => 'UR-300-0001',
            'status' => 'approved',
            'completed_km' => 212.5,
            'activity_count' => 28,
            'last_activity_at' => now()->subDay(),
            'approved_at' => now()->subDays(20),
        ]);

        Registration::create([
            'user_id' => $user->id,
            'event_category_id' => $davao21->id,
            'bib_number' => 'DVM21-0001',
            'status' => 'approved',
            'completed_km' => 16.4,
            'activity_count' => 5,
            'last_activity_at' => now()->subDays(2),
            'approved_at' => now()->subDays(12),
        ]);

        Registration::create([
            'user_id' => $user->id,
            'event_category_id' => $davao10->id,
            'bib_number' => 'DVM10-0001',
            'status' => 'completed',
            'completed_km' => 10,
            'activity_count' => 3,
            'last_activity_at' => now()->subDays(10),
            'approved_at' => now()->subDays(20),
            'completed_at' => now()->subDays(10),
        ]);
    }
}
