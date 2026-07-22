<?php

namespace Database\Seeders;

use App\Models\Event;
use App\Models\Registration;
use App\Models\RunSubmission;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;

/**
 * Seeds every runner's logged run for the "Unity Run 2026" event from the
 * official activity export (database/data/unity-run-2026-activities.csv).
 *
 * Each CSV row becomes one App\Models\RunSubmission credited to the runner's
 * Unity Run registration, and each registration's progress
 * (completed_km / activity_count / last_activity_at / completion) is then
 * RECOMPUTED from its own approved submissions — so the totals match exactly
 * how the app credits distance when an admin approves a run
 * (see App\Http\Controllers\Admin\AdminRunSubmissionController::approve).
 *
 * This activity export is a fuller, more recent snapshot than the per-runner
 * totals in UnityRun2026Seeder, so the recomputed figures here intentionally
 * supersede the completed_km/activity_count that seeder set. It therefore MUST
 * run after UnityRun2026Seeder (which creates the users and registrations).
 *
 * The seeder is idempotent: it clears and rebuilds the submissions for the
 * event's registrations on every run instead of duplicating them.
 *
 * Notes on the source file vs. the schema (migrations are intentionally NOT
 * changed to accommodate these):
 *   - The export lists runners by display name; the RunnerCode column is
 *     resolved at export time (see the generation notes in the CSV) so the
 *     seeder can join reliably on users.runner_code.
 *   - The export has no proof photo/link, so photo and proof_link are null
 *     (both are nullable columns).
 *   - "Activity Date" is the day the run happened; it is used for the
 *     submission's created_at and, for approved/rejected runs, reviewed_at.
 *   - Only "Unity Run 2026" rows are exported/seeded. The source also contained
 *     rows for other events (My Hero My Father, Pride Run 2026, Hero Driver
 *     2026) which have no seeded event/registration to credit and are excluded.
 */
class UnityRun2026ActivitySeeder extends Seeder
{
    use WithoutModelEvents;

    private const CSV = 'database/data/unity-run-2026-activities.csv';

    private const EVENT_SLUG = 'unity-run-2026';

    public function run(): void
    {
        $path = base_path(self::CSV);

        if (! is_file($path)) {
            $this->command?->error("Activity CSV not found at {$path} — nothing to seed.");

            return;
        }

        $event = Event::where('slug', self::EVENT_SLUG)->first();

        if ($event === null) {
            $this->command?->error('Unity Run 2026 event not found — run UnityRun2026Seeder first.');

            return;
        }

        // registration keyed by runner_code, plus its category target (0 = open).
        [$registrations, $targets] = $this->registrationsByRunnerCode($event);

        // A stand-in reviewer for approved/rejected runs (falls back to null).
        $reviewerId = User::where('role', 'admin')->value('id');

        // Rebuild from scratch so re-seeding never stacks duplicate submissions.
        RunSubmission::whereIn('registration_id', array_map(
            static fn (Registration $r) => $r->id,
            $registrations
        ))->delete();

        // Group every activity row under its runner code.
        $rows = $this->groupedRows($path);

        $seeded = 0;
        $skippedRows = 0;
        $unknownRunners = [];

        foreach ($rows as $runnerCode => $activities) {
            $registration = $registrations[$runnerCode] ?? null;

            if ($registration === null) {
                $unknownRunners[$runnerCode] = ($activities[0]['name'] ?? $runnerCode);
                $skippedRows += count($activities);

                continue;
            }

            $target = $targets[$runnerCode] ?? 0.0;

            $submissions = [];
            $approvedTotal = 0.0;   // uncapped running total of approved distance
            $approvedCount = 0;
            $lastActivity = null;   // latest activity date across all statuses
            $completedAt = null;    // date the capped total first reached target

            foreach ($activities as $a) {
                $distance = $a['km'];
                $date = $a['date'];
                $status = $a['status'];

                $reviewedAt = in_array($status, ['approved', 'rejected'], true) ? $date : null;

                $submissions[] = [
                    'user_id' => $registration->user_id,
                    'registration_id' => $registration->id,
                    'distance' => number_format($distance, 2, '.', ''),
                    'photo' => null,
                    'proof_link' => null,
                    'notes' => null,
                    'status' => $status,
                    'rejection_reason' => null,
                    'reviewed_by' => $reviewedAt !== null ? $reviewerId : null,
                    'reviewed_at' => $reviewedAt,
                    'created_at' => $date ?? now(),
                    'updated_at' => $date ?? now(),
                ];

                if ($date !== null && ($lastActivity === null || $date->greaterThan($lastActivity))) {
                    $lastActivity = $date;
                }

                if ($status !== 'approved') {
                    continue;
                }

                $approvedCount++;
                $approvedTotal += $distance;

                // Record the moment a capped goal is reached (first crossing).
                if ($target > 0 && $completedAt === null && $approvedTotal >= $target) {
                    $completedAt = $date;
                }
            }

            RunSubmission::insert($submissions);

            // Mirror the app's crediting: capped at target for ranking goals,
            // uncapped ("Open KM") otherwise.
            $completedKm = $target > 0 ? min($approvedTotal, $target) : $approvedTotal;
            $isComplete = $target > 0 && $completedKm >= $target;

            $registration->update([
                'completed_km' => number_format($completedKm, 2, '.', ''),
                'activity_count' => $approvedCount,
                'last_activity_at' => $lastActivity,
                'status' => $isComplete ? 'completed' : 'approved',
                'completed_at' => $isComplete ? ($completedAt ?? $lastActivity) : null,
            ]);

            $seeded += count($submissions);
        }

        $this->command?->info(
            "Unity Run 2026 activities: seeded {$seeded} run submissions across "
            .count($rows).' runners.'
        );

        if ($skippedRows > 0) {
            $this->command?->warn(
                "{$skippedRows} rows skipped for runners with no Unity Run registration: "
                .implode(', ', $unknownRunners)
            );
        }
    }

    /**
     * Build the "runner_code => Registration" and "runner_code => target_km"
     * maps for the given event. When a runner has several categories in the
     * event, the earliest registration wins (its own category target applies).
     *
     * @return array{0: array<string, Registration>, 1: array<string, float>}
     */
    private function registrationsByRunnerCode(Event $event): array
    {
        $registrations = Registration::query()
            ->with(['user:id,runner_code', 'eventCategory:id,event_id,target_km'])
            ->whereHas('eventCategory', fn ($q) => $q->where('event_id', $event->id))
            ->orderBy('id')
            ->get();

        $byCode = [];
        $targets = [];

        foreach ($registrations as $registration) {
            $code = $registration->user?->runner_code;

            if ($code === null || $code === '' || isset($byCode[$code])) {
                continue;
            }

            $byCode[$code] = $registration;
            $targets[$code] = (float) ($registration->eventCategory?->target_km ?? 0);
        }

        return [$byCode, $targets];
    }

    /**
     * Read the activity CSV into a "runner_code => list of activities" map,
     * each activity being ['name', 'date', 'km', 'status'].
     *
     * @return array<string, list<array{name: string, date: ?Carbon, km: float, status: string}>>
     */
    private function groupedRows(string $path): array
    {
        $handle = fopen($path, 'r');
        $header = fgetcsv($handle);

        if ($header === false) {
            fclose($handle);

            return [];
        }

        $idx = array_flip(array_map(static fn ($h) => trim((string) $h), $header));
        $grouped = [];

        while (($row = fgetcsv($handle)) !== false) {
            if (count(array_filter($row, static fn ($v) => trim((string) $v) !== '')) === 0) {
                continue;
            }

            $get = static function (string $column) use ($row, $idx): string {
                return isset($idx[$column]) ? trim((string) ($row[$idx[$column]] ?? '')) : '';
            };

            $code = $get('RunnerCode');

            if ($code === '') {
                continue;
            }

            $status = in_array($get('Status'), ['approved', 'pending', 'rejected'], true)
                ? $get('Status')
                : 'pending';

            $grouped[$code][] = [
                'name' => $get('Name'),
                'date' => $this->date($get('ActivityDate')),
                'km' => is_numeric($get('KM')) ? round((float) $get('KM'), 2) : 0.0,
                'status' => $status,
            ];
        }

        fclose($handle);

        return $grouped;
    }

    /**
     * Parse an activity date, returning null for blank/unparseable/out-of-range
     * values so a bad source row never poisons the database.
     */
    private function date(string $value): ?Carbon
    {
        if ($value === '') {
            return null;
        }

        try {
            $date = Carbon::parse($value);
        } catch (\Throwable) {
            return null;
        }

        return ($date->year < 1900 || $date->year > 2100) ? null : $date;
    }
}
