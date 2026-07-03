<?php

namespace Database\Seeders;

use App\Models\Event;
use App\Models\EventCategory;
use App\Models\Registration;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

/**
 * Seeds the "Unity Run 2026" event and its runners from the official export
 * (database/data/unity-run-2026-runners.csv).
 *
 * The seeder is idempotent — re-running it updates the same users/registrations
 * (keyed on runner code and user+category) instead of duplicating them.
 *
 * Notes on the source file vs. the schema (migrations are intentionally NOT
 * changed to accommodate these):
 *   - The CSV has no email column, but users.email is required + unique, so a
 *     deterministic placeholder address is generated per runner code.
 *   - The "Open KM" category has no TargetKM, but event_categories.target_km is
 *     a non-null decimal — it is stored as 0, which the app treats as an open,
 *     uncapped goal (progress never auto-completes), matching "Ongoing" rows.
 *   - The CSV has no per-registration activity count, so it is set to 1 when the
 *     runner has verified distance and 0 otherwise (the minimum truthful value).
 *   - Unparseable/absurd dates (e.g. "6/18/22026") are stored as null.
 */
class UnityRun2026Seeder extends Seeder
{
    use WithoutModelEvents;

    private const CSV = 'database/data/unity-run-2026-runners.csv';

    /**
     * Category name (as it appears in the CSV) => fixed target distance.
     * "Open KM" has no fixed goal, so 0 (open / uncapped).
     *
     * @var array<string, array{target: float, ranking: bool, order: int}>
     */
    private array $categories = [
        'Open KM' => ['target' => 0, 'ranking' => false, 'order' => 1],
        '200KM' => ['target' => 200, 'ranking' => true, 'order' => 2],
        '300KM' => ['target' => 300, 'ranking' => true, 'order' => 3],
    ];

    public function run(): void
    {
        $path = base_path(self::CSV);

        if (! is_file($path)) {
            $this->command?->error("CSV not found at {$path} — nothing to seed.");

            return;
        }

        $event = $this->event();
        $categoryModels = $this->categoryModels($event);

        $handle = fopen($path, 'r');
        $header = fgetcsv($handle);

        if ($header === false) {
            fclose($handle);
            $this->command?->error('CSV is empty — nothing to seed.');

            return;
        }

        $idx = array_flip(array_map(static fn ($h) => trim((string) $h), $header));

        $seeded = 0;
        $skipped = 0;

        while (($row = fgetcsv($handle)) !== false) {
            // Skip fully blank lines.
            if (count(array_filter($row, static fn ($v) => trim((string) $v) !== '')) === 0) {
                continue;
            }

            $get = static function (string $column) use ($row, $idx): string {
                return isset($idx[$column]) ? trim((string) ($row[$idx[$column]] ?? '')) : '';
            };

            $runnerCode = $get('RunnerCode');
            $categoryName = $get('Category');

            // A runner needs an identity and a category we recognise.
            if ($runnerCode === '' || ! isset($categoryModels[$categoryName])) {
                $skipped++;

                continue;
            }

            $bib = $get('BibNo');

            $firstName = $get('FirstName') !== '' ? $get('FirstName') : $get('FullName');
            $lastName = $get('LastName');
            $birthday = $this->date($get('Birthday'));

            $user = User::updateOrCreate(
                ['runner_code' => $runnerCode],
                [
                    'first_name' => $firstName,
                    'last_name' => $lastName,
                    'email' => $this->email($runnerCode, $bib),
                    'status' => 'active',
                    'verified' => true,
                    'profile_photo' => $get('ProfilePhoto') !== '' ? $get('ProfilePhoto') : null,
                    'birthday' => $birthday,
                    'gender' => in_array($get('Gender'), ['Male', 'Female'], true) ? $get('Gender') : null,
                    'province' => $get('Province') !== '' ? $get('Province') : null,
                    'city' => $get('City') !== '' ? $get('City') : null,
                    'island' => in_array($get('Island'), ['Luzon', 'Visayas', 'Mindanao'], true) ? $get('Island') : null,
                    'role' => 'participant',
                    'email_verified_at' => now(),
                    'password' => Hash::make($this->password($firstName, $lastName, $birthday)),
                ]
            );

            $rawKm = $get('TotalVerifiedKM');
            $completedKm = is_numeric($rawKm) ? round((float) $rawKm, 2) : 0.0;

            $status = strtolower($get('CompletionStatus')) === 'completed'
                ? 'completed'
                : 'approved';

            $registeredAt = $this->date($get('RegistrationDate'));

            Registration::updateOrCreate(
                [
                    'user_id' => $user->id,
                    'event_category_id' => $categoryModels[$categoryName]->id,
                ],
                [
                    'bib_number' => $bib !== '' ? $bib : (string) $user->id,
                    'status' => $status,
                    'completed_km' => $completedKm,
                    'activity_count' => $completedKm > 0 ? 1 : 0,
                    'last_activity_at' => $this->date($get('LastActivityDate')),
                    'approved_at' => $registeredAt,
                    'completed_at' => $this->date($get('CompletionDate')),
                    'created_at' => $registeredAt ?? now(),
                ]
            );

            $seeded++;
        }

        fclose($handle);

        $this->command?->info("Unity Run 2026: seeded {$seeded} runners ({$skipped} rows skipped).");
    }

    /** Create (or reuse) the Unity Run 2026 event. */
    private function event(): Event
    {
        return Event::updateOrCreate(
            ['slug' => 'unity-run-2026'],
            [
                'name' => 'Unity Run 2026',
                'description' => 'A nationwide virtual run — log your kilometers anytime, '
                    .'anywhere and complete your chosen distance before the event ends.',
                'location' => 'Nationwide, Philippines',
                'registration_start' => Carbon::create(2026, 5, 1),
                'registration_end' => Carbon::create(2026, 6, 30),
                'start_date' => Carbon::create(2026, 5, 15),
                'end_date' => Carbon::create(2026, 8, 31),
                'status' => 'open',
                'is_published' => true,
                'is_highlighted' => false,
                'preset' => 'solo',
            ]
        );
    }

    /**
     * Create (or reuse) the event's categories.
     *
     * @return array<string, EventCategory>
     */
    private function categoryModels(Event $event): array
    {
        $models = [];

        foreach ($this->categories as $name => $meta) {
            $models[$name] = EventCategory::updateOrCreate(
                ['event_id' => $event->id, 'name' => $name],
                [
                    'target_km' => $meta['target'],
                    'sort_order' => $meta['order'],
                    'registration_limit' => null,
                    'ranking_enabled' => $meta['ranking'],
                ]
            );
        }

        return $models;
    }

    /**
     * Deterministic placeholder email (the CSV carries no email address).
     * Keyed on the runner code so re-seeding is stable and collision-free.
     */
    private function email(string $runnerCode, string $bib): string
    {
        $local = Str::slug($runnerCode !== '' ? $runnerCode : $bib);

        return "{$local}@runners.unityrun2026.seed";
    }

    /**
     * Per-runner default password: first initial + surname + birth year, all
     * lowercase and stripped to letters/digits (e.g. "B. Idnay", 2003 =>
     * "bidnay2003"). Falls back gracefully when a name or birthday is missing.
     */
    private function password(string $firstName, string $lastName, ?Carbon $birthday): string
    {
        $initial = Str::lower(Str::substr(Str::ascii(trim($firstName)), 0, 1));
        $surname = Str::lower((string) preg_replace('/[^a-z]/', '', Str::ascii(trim($lastName))));
        $year = $birthday?->year ?? '';

        $password = "{$initial}{$surname}{$year}";

        // Guarantee a usable password even for pathological rows.
        return $password !== '' ? $password : 'unityrun2026';
    }

    /**
     * Parse a US-format (M/D/YYYY) date, returning null for blank, unparseable,
     * or out-of-range values so bad source rows never poison the database.
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

        if ($date->year < 1900 || $date->year > 2100) {
            return null;
        }

        return $date;
    }
}
