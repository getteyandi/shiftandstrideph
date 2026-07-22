<?php

namespace Database\Seeders;

use App\Models\Event;
use App\Models\EventCategory;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;
use Illuminate\Support\Str;

/**
 * Seeds the current events and their target-distance categories taken from the
 * "List of All Runners" export (Event Name + Target KM columns).
 *
 * Every event is published and marked "open" with an event window that spans
 * the current season, so a logged-in runner sees them on the Events page
 * (App\Http\Controllers\RegistrationController::index only lists events where
 * is_published = true and status is open/upcoming).
 *
 * "Unity Run 2026" is intentionally NOT created here — it already has its own
 * dedicated UnityRun2026Seeder (with the Open KM / 200KM / 300KM categories).
 *
 * The seeder is idempotent: events are keyed on slug and categories on
 * event + name, so re-running updates the same rows instead of duplicating.
 *
 * @var array<string, array{description: string, categories: list<array{name: string, target: float}>}>
 */
class EventCatalogSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Event name => its details and target-distance categories, exactly as they
     * appear in the export.
     *
     * @var array<string, array{description: string, categories: list<array{name: string, target: float}>}>
     */
    private array $events = [
        'My Hero, My Father' => [
            'description' => 'A Father\'s Day tribute run — log your kilometers anytime, '
                .'anywhere and finish the distance in honor of the heroes at home.',
            'categories' => [
                ['name' => '77KM', 'target' => 77],
            ],
        ],
        'Pride Run 2026' => [
            'description' => 'Run with pride — complete your distance anywhere in the country '
                .'and celebrate love, equality, and community.',
            'categories' => [
                ['name' => '49KM', 'target' => 49],
            ],
        ],
        'Hero Driver 2026' => [
            'description' => 'A salute to the everyday hero drivers — pick your distance and '
                .'log your kilometers before the event ends.',
            'categories' => [
                ['name' => '150KM', 'target' => 150],
                ['name' => '300KM', 'target' => 300],
            ],
        ],
        '18KM One Infinite Love' => [
            'description' => 'One Infinite Love — go the 18KM distance anytime, anywhere.',
            'categories' => [
                ['name' => '18KM', 'target' => 18],
            ],
        ],
        '8KM Labor Day Run' => [
            'description' => 'Celebrate Labor Day on the move — complete the 8KM distance '
                .'wherever you are.',
            'categories' => [
                ['name' => '8KM', 'target' => 8],
            ],
        ],
        'Summer Heat 100KM' => [
            'description' => 'Beat the summer heat — accumulate 100KM across the event period.',
            'categories' => [
                ['name' => '100KM', 'target' => 100],
            ],
        ],
    ];

    public function run(): void
    {
        // A shared, currently-open season window so every event is visible
        // under the default "active" filter on the Events page.
        $registrationStart = Carbon::create(2026, 4, 1);
        $registrationEnd = Carbon::create(2026, 9, 30);
        $startDate = Carbon::create(2026, 5, 1);
        $endDate = Carbon::create(2026, 9, 30);

        foreach ($this->events as $name => $details) {
            $event = Event::updateOrCreate(
                ['slug' => Str::slug($name)],
                [
                    'name' => $name,
                    'description' => $details['description'],
                    'location' => 'Nationwide, Philippines',
                    'registration_start' => $registrationStart,
                    'registration_end' => $registrationEnd,
                    'start_date' => $startDate,
                    'end_date' => $endDate,
                    'status' => 'open',
                    'is_published' => true,
                    'is_highlighted' => false,
                    'preset' => 'solo',
                ]
            );

            foreach ($details['categories'] as $index => $category) {
                EventCategory::updateOrCreate(
                    ['event_id' => $event->id, 'name' => $category['name']],
                    [
                        'target_km' => $category['target'],
                        'sort_order' => $index + 1,
                        'registration_limit' => null,
                        'ranking_enabled' => true,
                    ]
                );
            }
        }

        $this->command?->info(
            'Event catalog: seeded '.count($this->events).' current events with their target distances.'
        );
    }
}
