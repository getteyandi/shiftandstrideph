<?php

namespace Database\Seeders;

use App\Models\Event;
use App\Models\EventCategory;
use App\Models\Registration;
use App\Models\RunSubmission;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

/**
 * Seeds the runners (users + registrations) and their logged activities for the
 * non-Unity events, so each event's leaderboard / Top 3 Finishers populates.
 *
 *   - database/data/event-rosters.csv    — one row per runner registration
 *     (Event, TargetKM, name, birthday, email, city, gender, status).
 *   - database/data/event-activities.csv — one row per logged run for the
 *     events that have an activity export (My Hero My Father, Pride Run 2026,
 *     Hero Driver 2026), joined to the runner by email.
 *
 * "Unity Run 2026" is intentionally excluded here — it has its own
 * UnityRun2026Seeder + UnityRun2026ActivitySeeder. This seeder depends on the
 * events/categories created by EventCatalogSeeder, so it must run after it.
 *
 * As with the Unity activity seeder, each registration's progress
 * (completed_km / activity_count / last_activity_at / completion) is recomputed
 * from its approved submissions using the same cap logic the app applies on
 * approval (min(sum, target) for a fixed goal, uncapped otherwise).
 *
 * Idempotent: users are keyed on email, registrations on user + category, and
 * submissions are cleared and rebuilt for the touched registrations.
 */
class EventRosterSeeder extends Seeder
{
    use WithoutModelEvents;

    private const ROSTER = 'database/data/event-rosters.csv';

    private const ACTIVITIES = 'database/data/event-activities.csv';

    /** @var array<string, Registration> keyed by "email|Event Name" */
    private array $registrationsByRunner = [];

    public function run(): void
    {
        $rosterPath = base_path(self::ROSTER);

        if (! is_file($rosterPath)) {
            $this->command?->error("Roster CSV not found at {$rosterPath} — nothing to seed.");

            return;
        }

        // Published events (excluding Unity) keyed by name, with their categories.
        $events = Event::query()
            ->where('is_published', true)
            ->where('slug', '!=', 'unity-run-2026')
            ->with('categories')
            ->get()
            ->keyBy('name');

        $runners = $this->seedRoster($rosterPath, $events);

        $activityPath = base_path(self::ACTIVITIES);
        $activities = is_file($activityPath) ? $this->seedActivities($activityPath) : 0;

        $this->command?->info(
            "Event rosters: seeded {$runners} registrations across {$events->count()} events; "
            ."{$activities} run submissions credited."
        );
    }

    /**
     * Create users + registrations from the roster. Returns the number of
     * registrations seeded.
     *
     * @param  \Illuminate\Support\Collection<string, Event>  $events
     */
    private function seedRoster(string $path, $events): int
    {
        $handle = fopen($path, 'r');
        $header = fgetcsv($handle);
        $idx = array_flip(array_map(static fn ($h) => trim((string) $h), $header ?: []));

        $count = 0;
        $bibSeq = [];

        while (($row = fgetcsv($handle)) !== false) {
            if (count(array_filter($row, static fn ($v) => trim((string) $v) !== '')) === 0) {
                continue;
            }

            $get = static function (string $c) use ($row, $idx): string {
                return isset($idx[$c]) ? trim((string) ($row[$idx[$c]] ?? '')) : '';
            };

            $eventName = $get('Event');
            $email = Str::lower($get('Email'));
            $event = $events->get($eventName);

            if ($event === null || $email === '') {
                continue;
            }

            $category = $this->category($event, (float) $get('TargetKM'));

            if ($category === null) {
                continue;
            }

            $birthday = $this->date($get('Birthday'));
            $user = $this->upsertUser($get, $email, $birthday);

            // Sequential bib per event, e.g. PRIDE-001.
            $bibSeq[$event->id] = ($bibSeq[$event->id] ?? 0) + 1;
            $bib = strtoupper(Str::slug($event->name)).sprintf('-%03d', $bibSeq[$event->id]);

            $joined = $this->date($get('DateJoined'));

            $registration = Registration::updateOrCreate(
                ['user_id' => $user->id, 'event_category_id' => $category->id],
                [
                    'bib_number' => $bib,
                    // Recomputed from activities below; "approved" so it is
                    // eligible for the leaderboard even before recompute.
                    'status' => 'approved',
                    'completed_km' => 0,
                    'activity_count' => 0,
                    'last_activity_at' => null,
                    'approved_at' => $joined,
                    'completed_at' => null,
                    'created_at' => $joined ?? now(),
                ]
            );

            $this->registrationsByRunner[$email.'|'.$eventName] = $registration;
            $count++;
        }

        fclose($handle);

        return $count;
    }

    /**
     * Create run submissions from the activity export and recompute each
     * touched registration's progress. Returns the number of submissions.
     */
    private function seedActivities(string $path): int
    {
        // Clear existing submissions for the registrations we manage so a
        // re-seed never stacks duplicates.
        $regIds = array_map(static fn (Registration $r) => $r->id, $this->registrationsByRunner);

        if ($regIds !== []) {
            RunSubmission::whereIn('registration_id', $regIds)->delete();
        }

        $reviewerId = User::where('role', 'admin')->value('id');

        $handle = fopen($path, 'r');
        $header = fgetcsv($handle);
        $idx = array_flip(array_map(static fn ($h) => trim((string) $h), $header ?: []));

        /** @var array<int, list<array{distance: float, date: ?Carbon, status: string}>> $byReg */
        $byReg = [];
        $registrations = [];

        while (($row = fgetcsv($handle)) !== false) {
            if (count(array_filter($row, static fn ($v) => trim((string) $v) !== '')) === 0) {
                continue;
            }

            $get = static function (string $c) use ($row, $idx): string {
                return isset($idx[$c]) ? trim((string) ($row[$idx[$c]] ?? '')) : '';
            };

            $key = Str::lower($get('Email')).'|'.$get('Event');
            $registration = $this->registrationsByRunner[$key] ?? null;

            if ($registration === null) {
                continue;
            }

            $registrations[$registration->id] = $registration;
            $byReg[$registration->id][] = [
                'distance' => is_numeric($get('KM')) ? round((float) $get('KM'), 2) : 0.0,
                'date' => $this->date($get('ActivityDate')),
                'status' => in_array($get('Status'), ['approved', 'pending', 'rejected'], true)
                    ? $get('Status')
                    : 'pending',
            ];
        }

        fclose($handle);

        $total = 0;

        foreach ($byReg as $regId => $activities) {
            $registration = $registrations[$regId];
            $target = (float) ($registration->eventCategory->target_km ?? 0);

            $submissions = [];
            $approvedTotal = 0.0;
            $approvedCount = 0;
            $lastActivity = null;
            $completedAt = null;

            foreach ($activities as $a) {
                $date = $a['date'];
                $status = $a['status'];
                $reviewedAt = in_array($status, ['approved', 'rejected'], true) ? $date : null;

                $submissions[] = [
                    'user_id' => $registration->user_id,
                    'registration_id' => $registration->id,
                    'distance' => number_format($a['distance'], 2, '.', ''),
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
                $approvedTotal += $a['distance'];

                if ($target > 0 && $completedAt === null && $approvedTotal >= $target) {
                    $completedAt = $date;
                }
            }

            RunSubmission::insert($submissions);

            $completedKm = $target > 0 ? min($approvedTotal, $target) : $approvedTotal;
            $isComplete = $target > 0 && $completedKm >= $target;

            $registration->update([
                'completed_km' => number_format($completedKm, 2, '.', ''),
                'activity_count' => $approvedCount,
                'last_activity_at' => $lastActivity,
                'status' => $isComplete ? 'completed' : 'approved',
                'completed_at' => $isComplete ? ($completedAt ?? $lastActivity) : null,
            ]);

            $total += count($submissions);
        }

        return $total;
    }

    /**
     * Create a new user or update an existing one (matched by email) without
     * clobbering the login credentials of users seeded elsewhere.
     */
    private function upsertUser(callable $get, string $email, ?Carbon $birthday): User
    {
        $user = User::firstOrNew(['email' => $email]);
        $isNew = ! $user->exists;

        $user->fill([
            'first_name' => $get('FirstName'),
            'last_name' => $get('LastName'),
            'birthday' => $birthday,
            'gender' => in_array($get('Gender'), ['Male', 'Female'], true) ? $get('Gender') : null,
            'city' => $get('City') !== '' ? $get('City') : null,
        ]);

        if ($isNew) {
            $user->status = 'active';
            $user->verified = true;
            $user->role = 'participant';
            $user->email_verified_at = now();
            $user->password = Hash::make($this->password($get('FirstName'), $get('LastName'), $birthday));
        }

        $user->save();

        return $user;
    }

    /** The event's category whose target distance matches (0 = open). */
    private function category(Event $event, float $target): ?EventCategory
    {
        return $event->categories->first(
            fn (EventCategory $c) => abs((float) $c->target_km - $target) < 0.01
        );
    }

    /**
     * Per-runner default password: first initial + surname + birth year
     * (e.g. "Roy Delariarte", 1977 => "rdelariarte1977").
     */
    private function password(string $firstName, string $lastName, ?Carbon $birthday): string
    {
        $initial = Str::lower(Str::substr(Str::ascii(trim($firstName)), 0, 1));
        $surname = Str::lower((string) preg_replace('/[^A-Za-z]/', '', Str::ascii(trim($lastName))));
        $year = $birthday?->year ?? '';
        $password = "{$initial}{$surname}{$year}";

        return $password !== '' ? $password : 'shiftandstride';
    }

    /** Parse a Y-m-d date, returning null for blank/unparseable/out-of-range. */
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
