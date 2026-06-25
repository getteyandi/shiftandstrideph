<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 *
 * // Relationships
 * @property int $user_id
 * @property int $event_category_id
 *
 * // Registration
 * @property string $bib_number
 * @property string $status
 *
 * // Progress
 * @property float $completed_km
 * @property int $activity_count
 * @property Carbon|null $last_activity_at
 *
 * // Lifecycle
 * @property Carbon|null $approved_at
 * @property Carbon|null $completed_at
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 *
 * // Relationships
 * @property-read User $user
 * @property-read EventCategory $eventCategory
 * @property-read Collection<int, RunSubmission> $runSubmissions
 *
 * @mixin Builder<Registration>
 */
#[Fillable([
    'user_id',
    'event_category_id',

    'bib_number',

    'status',

    'completed_km',
    'activity_count',
    'last_activity_at',

    'approved_at',
    'completed_at',
])]
class Registration extends Model
{
    /**
     * Registration owner.
     *
     * @return BelongsTo<User, $this>
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Selected event category.
     *
     * @return BelongsTo<EventCategory, $this>
     */
    public function eventCategory(): BelongsTo
    {
        return $this->belongsTo(EventCategory::class);
    }

    /**
     * Run submissions credited to this registration.
     *
     * Assumes run_submissions.registration_id exists.
     *
     * @return HasMany<RunSubmission, $this>
     */
    public function runSubmissions(): HasMany
    {
        return $this->hasMany(RunSubmission::class);
    }

    /**
     * Attribute casting.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'completed_km' => 'decimal:2',

            'activity_count' => 'integer',

            'last_activity_at' => 'datetime',

            'approved_at' => 'datetime',

            'completed_at' => 'datetime',
        ];
    }
}
