<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int $user_id
 * @property string $distance
 * @property string $photo
 * @property string|null $notes
 * @property string $status
 * @property string|null $rejection_reason
 * @property int|null $reviewed_by
 * @property Carbon|null $reviewed_at
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property-read User $user
 * @property-read Collection<int, Registration> $registrations
 *
 * @mixin Builder<RunSubmission>
 */
#[Fillable(['user_id', 'registration_id', 'distance', 'photo', 'notes', 'status', 'rejection_reason', 'reviewed_by', 'reviewed_at'])]
class RunSubmission extends Model
{
    /**
     * Get the user who owns the run submission.
     *
     * @return BelongsTo<User, $this>
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * The specific registration (event/category) this run counts toward.
     *
     * @return BelongsTo<Registration, $this>
     */
    public function registration(): BelongsTo
    {
        return $this->belongsTo(Registration::class);
    }

    /**
     * Get the registrations linked to the run submission.
     *
     * @return BelongsToMany<Registration, $this>
     */
    public function registrations(): BelongsToMany
    {
        return $this->belongsToMany(Registration::class, 'registration_submission');
    }

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'distance' => 'decimal:2',
            'reviewed_at' => 'datetime',
        ];
    }
}
