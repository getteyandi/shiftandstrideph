<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Carbon;

/**
 * A pending sign-up awaiting email verification via a one-time code.
 *
 * @property int $id
 * @property string $email
 * @property string $first_name
 * @property string $last_name
 * @property string $password already-hashed
 * @property string $otp_hash hash of the 6-digit code
 * @property int $attempts
 * @property Carbon $expires_at
 */
class RegistrationOtp extends Model
{
    protected $fillable = [
        'email',
        'first_name',
        'last_name',
        'password',
        'otp_hash',
        'attempts',
        'expires_at',
    ];

    protected $hidden = [
        'password',
        'otp_hash',
    ];

    protected function casts(): array
    {
        return [
            'expires_at' => 'datetime',
            'attempts' => 'integer',
        ];
    }

    public function isExpired(): bool
    {
        return $this->expires_at->isPast();
    }
}
