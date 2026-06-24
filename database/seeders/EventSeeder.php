<?php

namespace Database\Seeders;

use App\Models\Event;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class EventSeeder extends Seeder
{
    public function run(): void
    {
        $events = [
            [
                'title' => 'Davao Virtual Marathon 2026',
                'description' => 'Run anywhere, anytime and complete your chosen category.',
            ],
            [
                'title' => 'Unity Run 2026',
                'description' => 'Promoting health and community through virtual running.',
            ],
            [
                'title' => 'Summer Heat Challenge',
                'description' => 'Beat the heat and reach your running goals.',
            ],
            [
                'title' => 'One Infinite Love Run',
                'description' => 'Run with purpose and make every kilometer count.',
            ],
            [
                'title' => 'Shift & Stride Anniversary Run',
                'description' => 'Celebrate the community through a virtual running challenge.',
            ],
        ];

        foreach ($events as $event) {
            Event::create([
                'title' => $event['title'],
                'slug' => Str::slug($event['title']),
                'description' => $event['description'],
                'banner' => null,
                'start_date' => now(),
                'end_date' => now()->addMonths(2),
                'status' => 'active',
            ]);
        }
    }
}
