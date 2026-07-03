<?php

namespace App\Http\Controllers\Auth;

use App\Concerns\PasswordValidationRules;
use App\Http\Controllers\Controller;
use App\Models\RegistrationOtp;
use App\Models\User;
use App\Support\Emails;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Str;
use Illuminate\Validation\Rules\Password;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;

/**
 * Email-verified, multi-step registration.
 *
 * Step 1 (sendOtp): the runner submits their details. Nothing is created yet —
 * we stash the (hashed) details plus a hashed one-time code and email the code.
 * Step 2 (verifyOtp): the runner enters the code. Only when it matches do we
 * create the account (status "pending") and send them to the login page to wait
 * for admin approval. The user is never logged in by registering.
 *
 * Security: the code is 6 random digits, stored only as a hash, valid for a
 * short window, capped at a handful of attempts, and both sending and verifying
 * are rate-limited per email and per IP. No account exists until the email is
 * proven, which blocks drive-by/repeat sign-up abuse.
 */
class RegisterController extends Controller
{
    use PasswordValidationRules;

    private const OTP_TTL_MINUTES = 10;

    private const MAX_ATTEMPTS = 5;

    private const RESEND_COOLDOWN_SECONDS = 60;

    /** Show the (multi-step) registration screen. */
    public function create()
    {
        return Inertia::render('auth/register', [
            'passwordRules' => Password::defaults()->toPasswordRulesString(),
            'otpLength' => 6,
            'otpTtlMinutes' => self::OTP_TTL_MINUTES,
        ]);
    }

    /** Step 1 — validate details and email a fresh verification code. */
    public function sendOtp(Request $request)
    {
        $validated = $request->validate([
            'first_name' => ['required', 'string', 'max:255'],
            'last_name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', 'unique:users,email'],
            'password' => $this->passwordRules(),
        ]);

        $email = Str::lower($validated['email']);

        $this->throttleSend($request, $email);

        $code = $this->generateCode();

        RegistrationOtp::updateOrCreate(
            ['email' => $email],
            [
                'first_name' => $validated['first_name'],
                'last_name' => $validated['last_name'],
                'password' => Hash::make($validated['password']),
                'otp_hash' => Hash::make($code),
                'attempts' => 0,
                'expires_at' => now()->addMinutes(self::OTP_TTL_MINUTES),
            ],
        );

        $this->emailCode($email, $validated['first_name'], $code);

        return back();
    }

    /** Re-send a code for an in-progress sign-up (same email). */
    public function resendOtp(Request $request)
    {
        $validated = $request->validate([
            'email' => ['required', 'email', 'max:255'],
        ]);

        $email = Str::lower($validated['email']);

        $pending = RegistrationOtp::where('email', $email)->first();

        // Don't reveal whether a pending sign-up exists; behave the same either
        // way apart from actually sending when there's something to send.
        if (! $pending) {
            throw ValidationException::withMessages([
                'otp' => 'Your session has expired. Please start again.',
            ]);
        }

        $this->throttleSend($request, $email);

        $code = $this->generateCode();

        $pending->update([
            'otp_hash' => Hash::make($code),
            'attempts' => 0,
            'expires_at' => now()->addMinutes(self::OTP_TTL_MINUTES),
        ]);

        $this->emailCode($email, $pending->first_name, $code);

        return back();
    }

    /** Step 2 — verify the code and create the pending account. */
    public function verifyOtp(Request $request)
    {
        $validated = $request->validate([
            'email' => ['required', 'email', 'max:255'],
            'otp' => ['required', 'string'],
        ]);

        // Cap brute-force attempts per IP across all emails.
        $ipKey = 'reg-verify:'.$request->ip();
        if (RateLimiter::tooManyAttempts($ipKey, 20)) {
            throw ValidationException::withMessages([
                'otp' => 'Too many attempts. Please try again in a few minutes.',
            ]);
        }
        RateLimiter::hit($ipKey, 600);

        $email = Str::lower($validated['email']);
        $code = preg_replace('/\D/', '', $validated['otp']);

        $pending = RegistrationOtp::where('email', $email)->first();

        if (! $pending || $pending->isExpired()) {
            $pending?->delete();

            throw ValidationException::withMessages([
                'otp' => 'This code has expired. Please request a new one.',
            ]);
        }

        if ($pending->attempts >= self::MAX_ATTEMPTS) {
            $pending->delete();

            throw ValidationException::withMessages([
                'otp' => 'Too many incorrect attempts. Please start again.',
            ]);
        }

        if (! Hash::check($code, $pending->otp_hash)) {
            $pending->increment('attempts');
            $remaining = max(0, self::MAX_ATTEMPTS - $pending->attempts);

            throw ValidationException::withMessages([
                'otp' => $remaining > 0
                    ? "That code is incorrect. {$remaining} attempt(s) remaining."
                    : 'Too many incorrect attempts. Please start again.',
            ]);
        }

        $user = $this->createAccount($pending);

        RateLimiter::clear($ipKey);

        $this->sendSignupEmails($user);

        return redirect()->route('login')->with(
            'status',
            'Your account has been created and is pending admin approval. '
                .'We\'ll email you as soon as it\'s approved.',
        );
    }

    /**
     * Turn a verified pending row into a real (pending-approval) account.
     * Guards against the email being taken between step 1 and step 2.
     */
    private function createAccount(RegistrationOtp $pending): User
    {
        return DB::transaction(function () use ($pending) {
            if (User::where('email', $pending->email)->exists()) {
                $pending->delete();

                throw ValidationException::withMessages([
                    'email' => 'An account with this email already exists. Please log in.',
                ]);
            }

            $user = User::create([
                'first_name' => $pending->first_name,
                'last_name' => $pending->last_name,
                'email' => $pending->email,
                'status' => 'pending',
                // The password is already hashed; the model's "hashed" cast
                // detects this and leaves it untouched.
                'password' => $pending->password,
            ]);

            // The email is proven at this point (they entered the code we sent),
            // so mark it verified. Set directly since it isn't mass-assignable.
            $user->forceFill(['email_verified_at' => now()])->save();

            $pending->delete();

            return $user;
        });
    }

    /** Email the runner a "pending review" note and alert every admin. */
    private function sendSignupEmails(User $user): void
    {
        try {
            $user->notify(Emails::accountRegistered());

            $admins = User::where('role', 'admin')->get();
            Notification::send($admins, Emails::adminNewUser($user));
        } catch (\Throwable $e) {
            report($e);
        }
    }

    /** Deliver the one-time code to an (as yet accountless) email address. */
    private function emailCode(string $email, string $firstName, string $code): void
    {
        try {
            Notification::route('mail', $email)->notify(
                Emails::registrationOtp($firstName, $code, self::OTP_TTL_MINUTES),
            );
        } catch (\Throwable $e) {
            report($e);

            throw ValidationException::withMessages([
                'email' => 'We couldn\'t send the verification email. Please try again shortly.',
            ]);
        }
    }

    /** Enforce a per-email cooldown and per-email/per-IP hourly ceilings. */
    private function throttleSend(Request $request, string $email): void
    {
        $cooldownKey = 'reg-otp-cooldown:'.$email;
        if (RateLimiter::tooManyAttempts($cooldownKey, 1)) {
            $seconds = RateLimiter::availableIn($cooldownKey);

            throw ValidationException::withMessages([
                'email' => "Please wait {$seconds} second(s) before requesting another code.",
            ]);
        }

        $emailHourKey = 'reg-otp-email:'.$email;
        $ipHourKey = 'reg-otp-ip:'.$request->ip();

        if (RateLimiter::tooManyAttempts($emailHourKey, 5) || RateLimiter::tooManyAttempts($ipHourKey, 15)) {
            throw ValidationException::withMessages([
                'email' => 'Too many verification requests. Please try again later.',
            ]);
        }

        RateLimiter::hit($cooldownKey, self::RESEND_COOLDOWN_SECONDS);
        RateLimiter::hit($emailHourKey, 3600);
        RateLimiter::hit($ipHourKey, 3600);
    }

    private function generateCode(): string
    {
        return str_pad((string) random_int(0, 999999), 6, '0', STR_PAD_LEFT);
    }
}
