<?php

namespace Database\Seeders;

use App\Models\Event;
use App\Models\EventCategory;
use Illuminate\Database\Seeder;

class EventCategorySeeder extends Seeder
{
    public function run(): void
    {
        $dvm = Event::where('title', 'Davao Virtual Marathon 2026')->first();

        EventCategory::insert([
            [
                'event_id' => $dvm->id,
                'name' => '5KM',
                'target_km' => 5,
                'ranking_enabled' => false,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'event_id' => $dvm->id,
                'name' => '10KM',
                'target_km' => 10,
                'ranking_enabled' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'event_id' => $dvm->id,
                'name' => '21KM',
                'target_km' => 21,
                'ranking_enabled' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'event_id' => $dvm->id,
                'name' => '42KM',
                'target_km' => 42,
                'ranking_enabled' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);

        $unity = Event::where('title', 'Unity Run 2026')->first();

        EventCategory::insert([
            [
                'event_id' => $unity->id,
                'name' => '100KM',
                'target_km' => 100,
                'ranking_enabled' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'event_id' => $unity->id,
                'name' => '300KM',
                'target_km' => 300,
                'ranking_enabled' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'event_id' => $unity->id,
                'name' => '500KM',
                'target_km' => 500,
                'ranking_enabled' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }
}
