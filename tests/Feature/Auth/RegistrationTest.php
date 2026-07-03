<?php

use App\Models\RegistrationOtp;
use App\Models\User;
use App\Notifications\SystemNotification;
use Illuminate\Notifications\AnonymousNotifiable;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Notification;

/** Pull the 6-digit code out of the OTP notification that was sent. */
function captureOtpCode(): string
{
    $notification = Notification::sent(
        new AnonymousNotifiable,
        SystemNotification::class,
    )->first();

    expect($notification)->not->toBeNull();

    foreach ($notification->lines as $line) {
        if (preg_match('/(\d{6})/', $line, $m)) {
            return $m[1];
        }
    }

    throw new RuntimeException('No OTP code found in the sent notification.');
}

test('registration screen can be rendered', function () {
    $this->get(route('register'))->assertOk();
});

test('requesting a code stashes a pending registration without creating a user', function () {
    Notification::fake();

    $this->post(route('register.otp'), [
        'first_name' => 'Test',
        'last_name' => 'Runner',
        'email' => 'runner@example.com',
        'password' => 'password',
        'password_confirmation' => 'password',
    ])->assertSessionHasNoErrors();

    expect(RegistrationOtp::where('email', 'runner@example.com')->exists())->toBeTrue();
    expect(User::where('email', 'runner@example.com')->exists())->toBeFalse();

    Notification::assertSentOnDemand(SystemNotification::class);
});

test('a valid code creates a pending account and redirects to login without logging in', function () {
    Notification::fake();

    $this->post(route('register.otp'), [
        'first_name' => 'Test',
        'last_name' => 'Runner',
        'email' => 'runner@example.com',
        'password' => 'password',
        'password_confirmation' => 'password',
    ]);

    $code = captureOtpCode();

    $response = $this->post(route('register.verify'), [
        'email' => 'runner@example.com',
        'otp' => $code,
    ]);

    $response->assertRedirect(route('login'));
    $this->assertGuest();

    $user = User::where('email', 'runner@example.com')->first();
    expect($user)->not->toBeNull();
    expect($user->status)->toBe('pending');
    expect($user->email_verified_at)->not->toBeNull();
    expect(Hash::check('password', $user->password))->toBeTrue();

    // The pending row is consumed.
    expect(RegistrationOtp::where('email', 'runner@example.com')->exists())->toBeFalse();
});

test('an incorrect code does not create an account and counts against attempts', function () {
    Notification::fake();

    $this->post(route('register.otp'), [
        'first_name' => 'Test',
        'last_name' => 'Runner',
        'email' => 'runner@example.com',
        'password' => 'password',
        'password_confirmation' => 'password',
    ]);

    $this->from(route('register'))->post(route('register.verify'), [
        'email' => 'runner@example.com',
        'otp' => '000000',
    ])->assertSessionHasErrors('otp');

    expect(User::where('email', 'runner@example.com')->exists())->toBeFalse();
    expect(RegistrationOtp::where('email', 'runner@example.com')->first()->attempts)->toBe(1);
});

test('registration is rejected for an email that already exists', function () {
    User::factory()->create(['email' => 'taken@example.com']);

    $this->post(route('register.otp'), [
        'first_name' => 'Test',
        'last_name' => 'Runner',
        'email' => 'taken@example.com',
        'password' => 'password',
        'password_confirmation' => 'password',
    ])->assertSessionHasErrors('email');

    expect(RegistrationOtp::where('email', 'taken@example.com')->exists())->toBeFalse();
});
