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

    /** Real runner contact details (name + email) exported separately. */
    private const CONTACTS = 'database/data/unity-run-2026-contacts.csv';

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

    /**
     * Normalised full name => real email, loaded from the contacts export.
     *
     * @var array<string, string>
     */
    private array $contacts = [];

    /**
     * Emails already assigned during this run, so two runners never collide on
     * the unique users.email column (e.g. relatives sharing one address).
     *
     * @var array<string, true>
     */
    private array $usedEmails = [];

    public function run(): void
    {
        $path = base_path(self::CSV);

        if (! is_file($path)) {
            $this->command?->error("CSV not found at {$path} — nothing to seed.");

            return;
        }

        $event = $this->event();
        $categoryModels = $this->categoryModels($event);
        $this->contacts = $this->loadContacts();

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

        // Track how emails were resolved so the summary can flag manual follow-ups.
        $matchedEmails = 0;
        $noContact = [];
        $duplicateEmail = [];

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

            // Prefer the runner's real email from the contacts export; fall back
            // to a unique placeholder when there's no match or it's already taken.
            $realEmail = $this->contacts[$this->nameKey($firstName, $lastName)] ?? null;

            if ($realEmail !== null && ! $this->emailTaken($realEmail, $runnerCode)) {
                $email = $realEmail;
                $matchedEmails++;
            } else {
                $email = $this->defaultEmail($firstName, $lastName, $birthday, $runnerCode);
                if ($realEmail !== null) {
                    $duplicateEmail[] = "{$firstName} {$lastName} → {$realEmail}";
                } else {
                    $noContact[] = trim("{$firstName} {$lastName}");
                }
            }

            $this->usedEmails[$email] = true;

            $user = User::updateOrCreate(
                ['runner_code' => $runnerCode],
                [
                    'first_name' => $firstName,
                    'last_name' => $lastName,
                    'email' => $email,
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
        $this->command?->info("Emails: {$matchedEmails} matched from contacts, ".(count($noContact) + count($duplicateEmail)).' given a placeholder.');

        if ($noContact !== []) {
            $this->command?->warn('No contact email found (placeholder used): '.implode('; ', $noContact));
        }

        if ($duplicateEmail !== []) {
            $this->command?->warn('Contact email already used by another runner (placeholder used): '.implode('; ', $duplicateEmail));
        }
    }

    /**
     * Load the contacts export into a "normalised full name => email" map.
     * Only syntactically valid emails are kept; the first valid entry for a
     * given name wins (later duplicate/invalid rows are ignored).
     *
     * @return array<string, string>
     */
    private function loadContacts(): array
    {
        $path = base_path(self::CONTACTS);

        if (! is_file($path)) {
            $this->command?->warn('Contacts file not found — every runner will get a placeholder email.');

            return [];
        }

        $handle = fopen($path, 'r');
        $header = fgetcsv($handle);

        if ($header === false) {
            fclose($handle);

            return [];
        }

        $idx = array_flip(array_map(static fn ($h) => trim((string) $h), $header));
        $map = [];

        while (($row = fgetcsv($handle)) !== false) {
            $get = static function (string $column) use ($row, $idx): string {
                return isset($idx[$column]) ? trim((string) ($row[$idx[$column]] ?? '')) : '';
            };

            $email = Str::lower($get('Email Address'));
            $key = $this->nameKey($get('First Name'), $get('Last Name'));

            if ($key === '' || ! $this->looksLikeEmail($email)) {
                continue;
            }

            // First valid email for a name wins.
            $map[$key] ??= $email;
        }

        fclose($handle);

        return $map;
    }

    /** Normalised match key: ASCII, letters/digits only, lowercased full name. */
    private function nameKey(string $first, string $last): string
    {
        $ascii = Str::ascii(trim($first).' '.trim($last));

        return Str::lower((string) preg_replace('/[^A-Za-z0-9]/', '', $ascii));
    }

    /** A permissive check that a string is shaped like an email address. */
    private function looksLikeEmail(string $email): bool
    {
        return (bool) preg_match('/^[^@\s]+@[^@\s]+\.[^@\s]+$/', $email);
    }

    /**
     * Whether an email is already claimed — either earlier in this run or by a
     * different user already in the database (the same runner keeping its own
     * email on re-seed does not count).
     */
    private function emailTaken(string $email, string $runnerCode): bool
    {
        if (isset($this->usedEmails[$email])) {
            return true;
        }

        return User::where('email', $email)
            ->where(fn ($q) => $q->whereNull('runner_code')->orWhere('runner_code', '!=', $runnerCode))
            ->exists();
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
     * Placeholder email for runners with no usable contact address:
     * first initial + surname + birth MMDD @default.com (e.g. Frank Pauchano,
     * born 9 April => fpauchano0409@default.com). Falls back to the runner code
     * for the local part when the name/birthday is missing, and appends the
     * runner code if the address is somehow already taken.
     */
    private function defaultEmail(string $firstName, string $lastName, ?Carbon $birthday, string $runnerCode): string
    {
        $initial = Str::lower(Str::substr(Str::ascii(trim($firstName)), 0, 1));
        $surname = Str::lower((string) preg_replace('/[^A-Za-z]/', '', Str::ascii(trim($lastName))));
        $mmdd = $birthday?->format('md') ?? '';

        $local = "{$initial}{$surname}{$mmdd}";

        if ($local === '') {
            $local = Str::lower(Str::slug($runnerCode));
        }

        $email = "{$local}@default.com";

        if ($this->emailTaken($email, $runnerCode)) {
            $email = "{$local}-".Str::lower(Str::slug($runnerCode)).'@default.com';
        }

        return $email;
    }

    /**
     * Per-runner default password: first initial + surname + birth year, all
     * lowercase and stripped to letters/digits (e.g. "B. Idnay", 2003 =>
     * "bidnay2003"). Falls back gracefully when a name or birthday is missing.
     */
    private function password(string $firstName, string $lastName, ?Carbon $birthday): string
    {
        $initial = Str::lower(Str::substr(Str::ascii(trim($firstName)), 0, 1));
        $surname = Str::lower((string) preg_replace('/[^A-Za-z]/', '', Str::ascii(trim($lastName))));
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
