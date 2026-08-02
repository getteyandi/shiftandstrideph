<?php

namespace App\Console\Commands;

use App\Models\Event;
use App\Models\Registration;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class CompleteEndedEvents extends Command
{
    /**
     * @var string
     */
    protected $signature = 'events:complete-ended';

    /**
     * @var string
     */
    protected $description = 'Complete open-KM registrations and close events whose end date has passed.';

    /**
     * Finalise every active event that is now past its end date.
     *
     * Open-KM categories (target 0 km) have no per-run finish line, so their
     * runners are only credited as finishers once the event officially ends —
     * this command is what makes their completion follow the event's end date.
     * Marking a registration completed fires the certificate observer, so
     * finishers still receive their certificate. The event itself is then moved
     * to the terminal "completed" state so no further runs can be submitted.
     */
    public function handle(): int
    {
        $now = now();

        $events = Event::query()
            ->with('categories')
            ->where('is_published', true)
            ->whereIn('status', ['open', 'upcoming'])
            ->where('end_date', '<', $now)
            ->get();

        if ($events->isEmpty()) {
            $this->info('No ended events to finalise.');

            return self::SUCCESS;
        }

        $completedRunners = 0;

        foreach ($events as $event) {
            DB::transaction(function () use ($event, &$completedRunners) {

                // Only open-KM categories (no distance goal) complete on end.
                $openCategoryIds = $event->categories
                    ->filter(fn ($category) => (float) $category->target_km <= 0)
                    ->pluck('id');

                if ($openCategoryIds->isNotEmpty()) {
                    $registrations = Registration::query()
                        ->whereIn('event_category_id', $openCategoryIds)
                        ->where('status', 'approved')
                        ->get();

                    foreach ($registrations as $registration) {
                        // Per-model update so the certificate observer fires.
                        $registration->update([
                            'status' => 'completed',
                            'completed_at' => $event->end_date,
                        ]);
                        $completedRunners++;
                    }
                }

                // Only auto-close pure open-KM events (e.g. Unity Run) on their
                // end date. Mixed events with distance-goal categories are left
                // for the admin, since those finish per-runner at their goal.
                $allOpenKm = $event->categories->isNotEmpty()
                    && $event->categories->every(
                        fn ($category) => (float) $category->target_km <= 0
                    );

                if ($allOpenKm) {
                    $event->update(['status' => 'completed']);
                }
            });

            $this->info("Finalised event #{$event->id} ({$event->name}).");
        }

        $this->info(
            "Done. {$events->count()} event(s) completed, {$completedRunners} open-KM runner(s) finished."
        );

        return self::SUCCESS;
    }
}
