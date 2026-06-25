<?php

namespace Database\Seeders;

use App\Models\Event;
use App\Models\EventCategory;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class EventSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        /*
        |--------------------------------------------------------------------------
        | Event 1 - Davao Virtual Marathon
        |--------------------------------------------------------------------------
        */

        $davao = Event::create([
            'name' => 'Davao Virtual Marathon 2026',
            'slug' => Str::slug('Davao Virtual Marathon 2026'),
            'description' => 'Run anytime, anywhere and complete your chosen marathon distance before the event ends.',
            'banner' => null,
            'location' => 'Davao City, Philippines',
            'registration_start' => now()->subDays(14),
            'registration_end' => now()->addDays(20),
            'start_date' => now(),
            'end_date' => now()->addDays(90),
            'status' => 'open',
        ]);

        foreach (
            [
                ['name' => '5 KM', 'target_km' => 5, 'ranking_enabled' => false],
                ['name' => '10 KM', 'target_km' => 10, 'ranking_enabled' => true],
                ['name' => '21 KM', 'target_km' => 21, 'ranking_enabled' => true],
                ['name' => '42 KM', 'target_km' => 42, 'ranking_enabled' => true],
            ] as $index => $category
        ) {

            EventCategory::create([
                'event_id' => $davao->id,
                'name' => $category['name'],
                'target_km' => $category['target_km'],
                'sort_order' => $index + 1,
                'registration_limit' => null,
                'ranking_enabled' => $category['ranking_enabled'],
                'badge_id' => null,
                'certificate_template' => null,
            ]);
        }

        /*
        |--------------------------------------------------------------------------
        | Event 2 - Unity Run Challenge
        |--------------------------------------------------------------------------
        */

        $unity = Event::create([
            'name' => 'Unity Run Challenge',
            'slug' => Str::slug('Unity Run Challenge'),
            'description' => 'Accumulate kilometers throughout the event period and compete with runners nationwide.',
            'banner' => null,
            'location' => 'Nationwide',
            'registration_start' => now()->subDays(10),
            'registration_end' => now()->addDays(45),
            'start_date' => now(),
            'end_date' => now()->addDays(120),
            'status' => 'open',
        ]);

        foreach (
            [
                ['name' => '100 KM', 'target_km' => 100],
                ['name' => '300 KM', 'target_km' => 300],
                ['name' => '500 KM', 'target_km' => 500],
            ] as $index => $category
        ) {

            EventCategory::create([
                'event_id' => $unity->id,
                'name' => $category['name'],
                'target_km' => $category['target_km'],
                'sort_order' => $index + 1,
                'registration_limit' => null,
                'ranking_enabled' => true,
                'badge_id' => null,
                'certificate_template' => null,
            ]);
        }

        /*
        |--------------------------------------------------------------------------
        | Event 3 - Mindanao Trail Series
        |--------------------------------------------------------------------------
        */

        $trail = Event::create([
            'name' => 'Mindanao Trail Series',
            'slug' => Str::slug('Mindanao Trail Series'),
            'description' => 'Challenge yourself with scenic trail routes across Mindanao.',
            'banner' => null,
            'location' => 'Bukidnon, Philippines',
            'registration_start' => now()->addDays(10),
            'registration_end' => now()->addDays(45),
            'start_date' => now()->addDays(60),
            'end_date' => now()->addDays(150),
            'status' => 'upcoming',
        ]);

        foreach (
            [
                ['name' => '15 KM', 'target_km' => 15],
                ['name' => '30 KM', 'target_km' => 30],
                ['name' => '50 KM', 'target_km' => 50],
            ] as $index => $category
        ) {

            EventCategory::create([
                'event_id' => $trail->id,
                'name' => $category['name'],
                'target_km' => $category['target_km'],
                'sort_order' => $index + 1,
                'registration_limit' => 500,
                'ranking_enabled' => true,
                'badge_id' => null,
                'certificate_template' => null,
            ]);
        }
    }
}
