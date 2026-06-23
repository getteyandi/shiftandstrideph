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
 * @property int $event_category_id
 * @property string $status
 * @property Carbon|null $approved_at
 * @property Carbon|null $completed_at
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property-read User $user
 * @property-read EventCategory $eventCategory
 * @property-read Collection<int, RunSubmission> $runSubmissions
 *
 * @mixin Builder<Registration>
 */
#[Fillable(['user_id', 'event_category_id', 'status', 'approved_at', 'completed_at'])]
class Registration extends Model
{
    /**
     * Get the user who owns the registration.
     *
     * @return BelongsTo<User, $this>
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the event category selected for the registration.
     *
     * @return BelongsTo<EventCategory, $this>
     */
    public function eventCategory(): BelongsTo
    {
        return $this->belongsTo(EventCategory::class);
    }

    /**
     * Get the run submissions linked to the registration.
     *
     * @return BelongsToMany<RunSubmission, $this>
     */
    public function runSubmissions(): BelongsToMany
    {
        return $this->belongsToMany(RunSubmission::class, 'registration_submission');
    }

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'approved_at' => 'datetime',
            'completed_at' => 'datetime',
        ];
    }
}
