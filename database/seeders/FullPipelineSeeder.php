<?php

namespace Database\Seeders;

use App\Models\Event;
use App\Models\EventCategory;
use App\Models\Registration;
use App\Models\RunSubmission;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

/**
 * Seeds a complete, coherent dataset that exercises every feature in the app:
 * users in each status, events in each lifecycle, registrations (pending /
 * approved / completed / rejected), run submissions for the verification queue,
 * leaderboard-worthy progress, and generated images for avatars / banners /
 * run proofs.
 *
 *   Admin login:  admin@example.com  / password
 *   Runner login: runner@example.com / password
 */
class FullPipelineSeeder extends Seeder
{
    /** @var array<int, array{0:int,1:int,2:int}> */
    private array $palette = [
        [166, 226, 18], [34, 211, 238], [255, 61, 174], [124, 92, 255],
        [251, 146, 60], [52, 211, 153], [244, 114, 182], [56, 189, 248],
    ];

    public function run(): void
    {
        $this->reset();

        $users = $this->seedUsers();
        [$events, $cats] = $this->seedEvents();
        $registrations = $this->seedRegistrations($users, $cats);
        $this->seedRunSubmissions($users, $registrations);
        $this->seedShipments($users);
        $this->seedGroups($users, $events);
        $this->seedNotifications($users);
    }

    /* ------------------------------------------------------- notifications */

    /**
     * A handful of in-app notifications so the bell is populated on first login.
     *
     * @param  array<string,User>  $users
     */
    private function seedNotifications(array $users): void
    {
        $rows = [
            // Admin queue.
            ['admin', 'New team awaiting approval', 'Paolo Reyes created a team for New Year Dash 2026.', '/admin/registrations', 'registration', false, 1],
            ['admin', 'New registration to review', 'Bea Torres joined Unity Run Challenge.', '/admin/registrations', 'registration', false, 3],
            // Runner-facing.
            ['runner', 'Registration approved', 'Your registration for New Year Dash 2026 was approved. You can start submitting runs!', '/events', 'approval', false, 2],
            ['runner', 'Run approved', '5.20 km has been credited to your event progress.', '/my-runs', 'approval', true, 26],
            ['maria', 'Team approved', 'Your team "Cebu Striders" was approved. Start logging runs!', '/events', 'approval', false, 5],
            ['paolo', 'Team invitation', 'Maria Santos invited you to join "Cebu Striders".', '/events', 'invite', false, 4],
        ];

        foreach ($rows as [$key, $title, $body, $url, $category, $read, $hoursAgo]) {
            $user = $users[$key] ?? null;
            if (! $user) {
                continue;
            }

            \DB::table('notifications')->insert([
                'id' => (string) \Illuminate\Support\Str::uuid(),
                'type' => \App\Notifications\AppNotification::class,
                'notifiable_type' => \App\Models\User::class,
                'notifiable_id' => $user->id,
                'data' => json_encode(compact('title', 'body', 'url', 'category')),
                'read_at' => $read ? now()->subHours($hoursAgo) : null,
                'created_at' => now()->subHours($hoursAgo),
                'updated_at' => now()->subHours($hoursAgo),
            ]);
        }
    }

    /* ---------------------------------------------------------------- groups */

    /**
     * @param  array<string,User>  $users
     * @param  array<string,Event>  $events
     */
    private function seedGroups(array $users, array $events): void
    {
        $event = $events['New Year Dash 2026'];
        $catIds = $event->categories->pluck('id');

        $regByEmail = \App\Models\Registration::whereIn('event_category_id', $catIds)
            ->with('user')
            ->get()
            ->keyBy(fn ($r) => $r->user->email);

        $assign = function (string $email, \App\Models\EventGroup $group, ?string $regStatus = null) use ($regByEmail) {
            $reg = $regByEmail->get($email);
            $reg?->update(array_filter([
                'group_id' => $group->id,
                'status' => $regStatus,
            ]));
        };

        // Approved team (captain = runner).
        $trailblazers = \App\Models\EventGroup::create([
            'event_id' => $event->id,
            'name' => 'Trailblazers',
            'type' => 'group',
            'status' => 'approved',
            'created_by' => $users['runner']->id,
        ]);
        $assign('runner@example.com', $trailblazers);
        $assign('carlo@example.com', $trailblazers);
        $assign('andrea@example.com', $trailblazers);

        // Approved duo (captain = maria).
        $striders = \App\Models\EventGroup::create([
            'event_id' => $event->id,
            'name' => 'Cebu Striders',
            'type' => 'duo',
            'status' => 'approved',
            'created_by' => $users['maria']->id,
        ]);
        $assign('maria@example.com', $striders);
        $assign('bea@example.com', $striders);

        // Pending team awaiting admin approval (captain only so far).
        $pacers = \App\Models\EventGroup::create([
            'event_id' => $event->id,
            'name' => 'Coastal Pacers',
            'type' => 'duo',
            'status' => 'pending',
            'created_by' => $users['paolo']->id,
        ]);
        $assign('paolo@example.com', $pacers, 'pending');
    }

    /* ------------------------------------------------------------- shipments */

    /** @param array<string,User> $users */
    private function seedShipments(array $users): void
    {
        $rows = [
            ['runner', 'Finisher Kit', 'J&T Express', 'delivered'],
            ['runner', 'Pre-Run Kit', 'LBC', 'shipped'],
            ['maria', 'Finisher Kit', 'J&T Express', 'shipped'],
            ['paolo', 'Pre-Run Kit', 'J&T Express', 'preparing'],
            ['andrea', 'Finisher Kit', 'LBC', 'delivered'],
            ['bea', 'Pre-Run Kit', null, 'preparing'],
        ];

        $seq = 100000;

        foreach ($rows as [$key, $item, $courier, $status]) {
            \App\Models\Shipment::create([
                'user_id' => $users[$key]->id,
                'tracking_id' => 'SSP-' . strtoupper(substr(md5($item . $key), 0, 8)),
                'item' => $item,
                'courier' => $courier,
                'status' => $status,
                'shipped_at' => in_array($status, ['shipped', 'delivered'], true)
                    ? now()->subDays(rand(2, 6))
                    : null,
                'delivered_at' => $status === 'delivered'
                    ? now()->subDays(rand(0, 1))
                    : null,
                'created_at' => now()->subDays(rand(6, 10)),
            ]);
            $seq++;
        }
    }

    /* ---------------------------------------------------------------- reset */

    private function reset(): void
    {
        Schema::disableForeignKeyConstraints();
        foreach (
            [
                'notifications',
                'shipments',
                'registration_submission',
                'run_submissions',
                'registrations',
                'event_groups',
                'event_categories',
                'events',
                'users',
            ] as $table
        ) {
            DB::table($table)->truncate();
        }
        Schema::enableForeignKeyConstraints();
    }

    /* ---------------------------------------------------------------- users */

    /** @return array<string, User> */
    private function seedUsers(): array
    {
        $rows = [
            ['admin', 'SASPH', 'Admin', 'admin@example.com', 'active', 'admin', 'Davao del Sur', 'Davao City', 'Male', 'Mindanao'],
            ['runner', 'Juan', 'Dela Cruz', 'runner@example.com', 'active', 'participant', 'Davao del Sur', 'Davao City', 'Male', 'Mindanao'],
            ['maria', 'Maria', 'Santos', 'maria@example.com', 'active', 'participant', 'Cebu', 'Cebu City', 'Female', 'Visayas'],
            ['paolo', 'Paolo', 'Reyes', 'paolo@example.com', 'active', 'participant', 'Metro Manila', 'Quezon City', 'Male', 'Luzon'],
            ['andrea', 'Andrea', 'Lim', 'andrea@example.com', 'active', 'participant', 'Davao del Sur', 'Davao City', 'Female', 'Mindanao'],
            ['miguel', 'Miguel', 'Cruz', 'miguel@example.com', 'active', 'participant', 'Iloilo', 'Iloilo City', 'Male', 'Visayas'],
            ['bea', 'Bea', 'Torres', 'bea@example.com', 'active', 'participant', 'Benguet', 'Baguio City', 'Female', 'Luzon'],
            ['carlo', 'Carlo', 'Mendoza', 'carlo@example.com', 'active', 'participant', 'Misamis Oriental', 'Cagayan de Oro', 'Male', 'Mindanao'],
            ['sofia', 'Sofia', 'Ramos', 'pending1@example.com', 'pending', 'participant', 'Pampanga', 'San Fernando', 'Female', 'Luzon'],
            ['liam', 'Liam', 'Garcia', 'pending2@example.com', 'pending', 'participant', 'Laguna', 'Calamba', 'Male', 'Luzon'],
            ['noah', 'Noah', 'Villanueva', 'suspended@example.com', 'suspended', 'participant', 'Cavite', 'Dasmariñas', 'Male', 'Luzon'],
        ];

        $users = [];
        $code = 1;

        foreach ($rows as $i => $r) {
            [$key, $first, $last, $email, $status, $role] = $r;
            [$province, $city, $gender, $island] = [$r[6], $r[7], $r[8], $r[9]];

            $isParticipant = $role === 'participant';
            $complete = $isParticipant && $status !== 'pending';

            $users[$key] = User::create([
                'first_name' => $first,
                'last_name' => $last,
                'email' => $email,
                'status' => $status,
                'role' => $role,
                'runner_code' => $isParticipant ? sprintf('SSP-%06d', $code++) : null,
                'verified' => $complete,
                // Pending users intentionally have an incomplete profile so the
                // onboarding flow can be demoed; everyone else is fully set.
                'profile_photo' => $complete
                    ? $this->image('profile-photos', 400, 400, $this->palette[$i % count($this->palette)], strtoupper($first[0] . $last[0]))
                    : null,
                'birthday' => $complete ? now()->subYears(20 + $i)->subDays($i * 30) : null,
                'gender' => $complete ? $gender : null,
                'province' => $complete ? $province : null,
                'city' => $complete ? $city : null,
                'island' => $complete ? $island : null,
                'address' => $complete
                    ? sprintf('%d Rizal St., Brgy. Centro, %s, %s', 100 + $i, $city, $province)
                    : null,
                'email_verified_at' => now(),
                'password' => Hash::make('password'),
            ]);
        }

        return $users;
    }

    /* --------------------------------------------------------------- events */

    /** @return array{0: array<string,Event>, 1: array<string,EventCategory>} */
    private function seedEvents(): array
    {
        $blueprints = [
            [
                'name' => 'Davao Virtual Marathon 2026',
                'location' => 'Davao City, Philippines',
                'status' => 'open', 'published' => true, 'highlighted' => true,
                'preset' => 'community',
                'reg_start' => now()->subDays(14), 'reg_end' => now()->addDays(20),
                'start' => now()->subDays(7), 'end' => now()->addDays(90),
                'cats' => [['5 KM', 5, null], ['10 KM', 10, null], ['21 KM', 21, null], ['42 KM', 42, null]],
            ],
            [
                'name' => 'Unity Run Challenge',
                'location' => 'Nationwide',
                'status' => 'open', 'published' => true,
                'reg_start' => now()->subDays(10), 'reg_end' => now()->addDays(45),
                'start' => now()->subDays(5), 'end' => now()->addDays(120),
                'cats' => [['100 KM', 100, null], ['300 KM', 300, null], ['500 KM', 500, null]],
            ],
            [
                'name' => 'New Year Dash 2026',
                'location' => 'Metro Manila',
                'status' => 'open', 'published' => true, 'preset' => 'group',
                'reg_start' => now()->subDays(2), 'reg_end' => now()->addDays(30),
                'start' => now()->addDays(40), 'end' => now()->addDays(70),
                'cats' => [['5 KM', 5, null], ['10 KM', 10, null]],
            ],
            [
                'name' => "Father's Day Run 2026",
                'location' => 'Cebu City',
                'status' => 'completed', 'published' => true,
                'reg_start' => now()->subDays(80), 'reg_end' => now()->subDays(50),
                'start' => now()->subDays(45), 'end' => now()->subDays(10),
                'cats' => [['5 KM', 5, null], ['10 KM', 10, null], ['21 KM', 21, null]],
            ],
            [
                'name' => 'Summer Sprint 2025',
                'location' => 'Iloilo City',
                'status' => 'closed', 'published' => true,
                'reg_start' => now()->subDays(60), 'reg_end' => now()->subDays(40),
                'start' => now()->subDays(35), 'end' => now()->subDays(5),
                'cats' => [['5 KM', 5, 3], ['10 KM', 10, 3]],
            ],
            [
                'name' => 'Coastal Dash 2026',
                'location' => 'Batangas',
                'status' => 'open', 'published' => true, 'preset' => 'solo',
                'reg_start' => now()->subDays(3), 'reg_end' => now()->addDays(25),
                'start' => now()->subDays(1), 'end' => now()->addDays(40),
                'cats' => [['5 KM', 5, null], ['10 KM', 10, null]],
            ],
            [
                'name' => 'Holiday Fun Run (Draft)',
                'location' => 'Baguio City',
                'status' => 'upcoming', 'published' => false,
                'reg_start' => now()->addDays(20), 'reg_end' => now()->addDays(50),
                'start' => now()->addDays(60), 'end' => now()->addDays(75),
                'cats' => [['5 KM', 5, null]],
            ],
        ];

        $events = [];
        $cats = [];

        foreach ($blueprints as $b) {
            $event = Event::create([
                'name' => $b['name'],
                'slug' => Str::slug($b['name']),
                'description' => "Run anytime, anywhere and complete your chosen distance before {$b['name']} ends. Log your runs, climb the leaderboard, and earn your finish.",
                'banner' => $b['published']
                    ? $this->image('events', 1200, 500, [18, 21, 13], strtoupper($b['name']))
                    : null,
                'location' => $b['location'],
                'registration_start' => $b['reg_start'],
                'registration_end' => $b['reg_end'],
                'start_date' => $b['start'],
                'end_date' => $b['end'],
                'status' => $b['status'],
                'is_published' => $b['published'],
                'is_highlighted' => $b['highlighted'] ?? false,
                'preset' => $b['preset'] ?? 'solo',
            ]);
            $events[$b['name']] = $event;

            foreach ($b['cats'] as $i => [$cname, $target, $limit]) {
                $cats["{$b['name']}|{$cname}"] = EventCategory::create([
                    'event_id' => $event->id,
                    'name' => $cname,
                    'target_km' => $target,
                    'sort_order' => $i + 1,
                    'registration_limit' => $limit,
                    'ranking_enabled' => $target >= 10,
                ]);
            }
        }

        return [$events, $cats];
    }

    /* -------------------------------------------------------- registrations */

    /**
     * @param  array<string,User>  $users
     * @param  array<string,EventCategory>  $cats
     * @return array<int, Registration>
     */
    private function seedRegistrations(array $users, array $cats): array
    {
        // [userKey, "Event|Category", status, completed_fraction, daysAgoActivity]
        $plan = [
            // Davao Virtual Marathon (open) — one category per runner
            ['runner', 'Davao Virtual Marathon 2026|42 KM', 'approved', 0.72, 0],
            ['maria', 'Davao Virtual Marathon 2026|21 KM', 'approved', 0.7, 2],
            ['paolo', 'Davao Virtual Marathon 2026|5 KM', 'completed', 1.0, 0],
            ['andrea', 'Davao Virtual Marathon 2026|21 KM', 'pending', 0, null],
            ['miguel', 'Davao Virtual Marathon 2026|10 KM', 'rejected', 0, null],
            ['bea', 'Davao Virtual Marathon 2026|5 KM', 'approved', 0.6, 3],

            // Unity Run Challenge (open)
            ['runner', 'Unity Run Challenge|300 KM', 'approved', 0.71, 1],
            ['maria', 'Unity Run Challenge|100 KM', 'completed', 1.0, 0],
            ['paolo', 'Unity Run Challenge|300 KM', 'approved', 0.27, 2],
            ['carlo', 'Unity Run Challenge|100 KM', 'approved', 0.4, 5],
            ['andrea', 'Unity Run Challenge|500 KM', 'pending', 0, null],

            // New Year Dash (group preset) — runners team up
            ['runner', 'New Year Dash 2026|5 KM', 'approved', 0.6, 1],
            ['carlo', 'New Year Dash 2026|10 KM', 'approved', 0.5, 2],
            ['andrea', 'New Year Dash 2026|5 KM', 'approved', 0.4, 1],
            ['maria', 'New Year Dash 2026|10 KM', 'approved', 0.7, 1],
            ['paolo', 'New Year Dash 2026|5 KM', 'approved', 0.5, 2],
            ['bea', 'New Year Dash 2026|10 KM', 'approved', 0.3, 3],

            // Coastal Dash (solo, open) — keeps a pending entry for the dashboard
            ['runner', 'Coastal Dash 2026|5 KM', 'pending', 0, null],

            // Father's Day Run (completed/past) — newest finishers + hall of fame
            ['runner', "Father's Day Run 2026|21 KM", 'completed', 1.0, 11],
            ['maria', "Father's Day Run 2026|10 KM", 'completed', 1.0, 12],
            ['paolo', "Father's Day Run 2026|5 KM", 'completed', 1.0, 13],
            ['andrea', "Father's Day Run 2026|10 KM", 'completed', 1.0, 14],
            ['bea', "Father's Day Run 2026|5 KM", 'completed', 1.0, 15],

            // Summer Sprint (closed/history) — participants for the view page
            ['runner', 'Summer Sprint 2025|5 KM', 'completed', 1.0, 7],
            ['maria', 'Summer Sprint 2025|5 KM', 'completed', 1.0, 8],
            ['paolo', 'Summer Sprint 2025|5 KM', 'completed', 1.0, 9],
            ['andrea', 'Summer Sprint 2025|10 KM', 'completed', 1.0, 10],
            ['miguel', 'Summer Sprint 2025|10 KM', 'approved', 0.6, 6],
            ['bea', 'Summer Sprint 2025|10 KM', 'completed', 1.0, 11],
        ];

        $registrations = [];
        $bib = 1000;

        foreach ($plan as [$userKey, $catKey, $status, $fraction, $daysAgo]) {
            $category = $cats[$catKey];

            $target = (float) $category->target_km;
            $completed = round($target * $fraction, 2);

            $registrations[] = Registration::create([
                'user_id' => $users[$userKey]->id,
                'event_category_id' => $category->id,
                'bib_number' => sprintf('%05d', ++$bib),
                'status' => $status,
                'rejection_reason' => $status === 'rejected'
                    ? 'Proof photo did not clearly show the distance. Please re-submit.'
                    : null,
                'completed_km' => $completed,
                'activity_count' => $status === 'pending' || $status === 'rejected'
                    ? 0
                    : max(1, (int) round($completed / 4)),
                'last_activity_at' => $daysAgo !== null ? now()->subDays($daysAgo) : null,
                'approved_at' => in_array($status, ['approved', 'completed'], true)
                    ? now()->subDays(($daysAgo ?? 5) + 5)
                    : null,
                'completed_at' => $status === 'completed'
                    ? ($daysAgo < 1
                        ? now()->subHours(rand(2, 20))
                        : now()->subDays($daysAgo))
                    : null,
            ]);
        }

        return $registrations;
    }

    /* ------------------------------------------------------- run submissions */

    /**
     * @param  array<string,User>  $users
     * @param  array<int,Registration>  $registrations
     */
    private function seedRunSubmissions(array $users, array $registrations): void
    {
        $approvedRegs = collect($registrations)
            ->filter(fn (Registration $r) => in_array($r->status, ['approved', 'completed'], true))
            ->values();

        // Historical approved submissions tied to progress already credited.
        foreach ($approvedRegs->take(10) as $i => $reg) {
            $sub = RunSubmission::create([
                'user_id' => $reg->user_id,
                'distance' => max(2, round((float) $reg->completed_km / 3, 1)),
                'photo' => $this->image('run-submissions', 600, 600, [34, 42, 22], 'RUN ' . ($i + 1)),
                'notes' => 'Morning long run logged on my watch.',
                'status' => 'approved',
                'reviewed_by' => $users['admin']->id,
                'reviewed_at' => now()->subDays($i + 1),
            ]);
            $sub->registrations()->attach($reg->id);
        }

        // Pending submissions → admin verification queue (plenty for pagination).
        $pendingTargets = $approvedRegs->take(12);
        foreach ($pendingTargets as $i => $reg) {
            $sub = RunSubmission::create([
                'user_id' => $reg->user_id,
                'distance' => [3.2, 5, 7.5, 10, 4.4][$i % 5],
                'photo' => $this->image('run-submissions', 600, 600, [22, 30, 14], 'PENDING ' . ($i + 1)),
                'notes' => 'Please verify — treadmill session.',
                'status' => 'pending',
            ]);
            $sub->registrations()->attach($reg->id);
        }

        // A couple of rejected submissions with reasons.
        foreach ($approvedRegs->take(2) as $i => $reg) {
            $sub = RunSubmission::create([
                'user_id' => $reg->user_id,
                'distance' => 6.0,
                'photo' => $this->image('run-submissions', 600, 600, [60, 20, 30], 'REJECTED'),
                'notes' => 'Evening run.',
                'status' => 'rejected',
                'rejection_reason' => 'The timestamp on the photo is from a previous event window.',
                'reviewed_by' => $users['admin']->id,
                'reviewed_at' => now()->subDays($i + 1),
            ]);
            $sub->registrations()->attach($reg->id);
        }
    }

    /* ---------------------------------------------------------------- images */

    /**
     * Generate a simple PNG placeholder and return its public-disk path.
     *
     * @param  array{0:int,1:int,2:int}  $bg
     */
    private function image(string $folder, int $w, int $h, array $bg, string $text): ?string
    {
        if (! extension_loaded('gd')) {
            return null;
        }

        $img = imagecreatetruecolor($w, $h);
        imagefilledrectangle($img, 0, 0, $w, $h, imagecolorallocate($img, $bg[0], $bg[1], $bg[2]));

        // Subtle lime corner glow.
        $glow = imagecolorallocatealpha($img, 166, 226, 18, 110);
        imagefilledellipse($img, $w, 0, (int) ($w * 0.9), (int) ($h * 0.9), $glow);

        // Scale the built-in font up so the label is legible.
        $font = 5;
        $tw = imagefontwidth($font) * strlen($text);
        $th = imagefontheight($font);
        $tmp = imagecreatetruecolor($tw, $th);
        imagefilledrectangle($tmp, 0, 0, $tw, $th, imagecolorallocate($tmp, $bg[0], $bg[1], $bg[2]));
        imagestring($tmp, $font, 0, 0, $text, imagecolorallocate($tmp, 255, 255, 255));

        $scale = max(1, (int) floor(($w * 0.7) / max(1, $tw)));
        $dw = $tw * $scale;
        $dh = $th * $scale;
        imagecopyresized($img, $tmp, (int) (($w - $dw) / 2), (int) (($h - $dh) / 2), 0, 0, $dw, $dh, $tw, $th);
        imagedestroy($tmp);

        $path = "{$folder}/" . Str::uuid() . '.png';
        $full = storage_path("app/public/{$path}");
        if (! is_dir(dirname($full))) {
            mkdir(dirname($full), 0775, true);
        }
        imagepng($img, $full);
        imagedestroy($img);

        return $path;
    }
}
