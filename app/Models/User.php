<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Carbon;
use Laravel\Fortify\Contracts\PasskeyUser;
use Laravel\Fortify\PasskeyAuthenticatable;
use Laravel\Fortify\TwoFactorAuthenticatable;

/**
 * @property int $id
 *
 * // Identity
 * @property string $first_name
 * @property string $last_name
 * @property string $email
 *
 * // Account
 * @property string $status
 * @property bool $verified
 *
 * // Runner
 * @property string|null $runner_code
 * @property string|null $profile_photo
 *
 * // Personal
 * @property Carbon|null $birthday
 * @property string|null $gender
 * @property string|null $province
 * @property string|null $city
 *
 * // Authentication
 * @property Carbon|null $email_verified_at
 * @property string $password
 * @property string|null $remember_token
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 *
 * // Computed
 * @property-read string $full_name
 * @property-read string $initials
 * @property-read int|null $age
 *
 * // Relationships
 * @property-read Collection<int, Registration> $registrations
 * @property-read Collection<int, RunSubmission> $runSubmissions
 */
#[Fillable([
    'first_name',
    'last_name',
    'email',

    'status',

    'runner_code',
    'verified',
    'profile_photo',

    'birthday',
    'gender',
    'province',
    'city',
    'island',
    'address',
    'role',
    'password',
])]
#[Hidden([
    'password',
    'remember_token',
    'two_factor_secret',
    'two_factor_recovery_codes',
])]
class User extends Authenticatable implements PasskeyUser
{
    /** @use HasFactory<UserFactory> */
    use HasFactory;
    use Notifiable;
    use PasskeyAuthenticatable;
    use TwoFactorAuthenticatable;

    /**
     * Get the user's run submissions.
     */
    public function runSubmissions(): HasMany
    {
        return $this->hasMany(RunSubmission::class);
    }

    /**
     * Get the user's event registrations.
     */
    public function registrations(): HasMany
    {
        return $this->hasMany(Registration::class);
    }

    /**
     * Full name accessor.
     */
    public function getFullNameAttribute(): string
    {
        return "{$this->first_name} {$this->last_name}";
    }

    /**
     * Initials accessor.
     */
    public function getInitialsAttribute(): string
    {
        return strtoupper(
            substr($this->first_name, 0, 1)
                . substr($this->last_name, 0, 1)
        );
    }

    /**
     * Age accessor.
     */
    public function getAgeAttribute(): ?int
    {
        return $this->birthday?->age;
    }

    /**
     * Attribute casting.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'verified' => 'boolean',
            'birthday' => 'date',
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'two_factor_confirmed_at' => 'datetime',
        ];
    }
}
