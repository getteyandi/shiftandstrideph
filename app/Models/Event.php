<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property string $title
 * @property string $slug
 * @property string $description
 * @property string $banner
 * @property Carbon $start_date
 * @property Carbon $end_date
 * @property string $status
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property-read Collection<int, EventCategory> $categories
 *
 * @mixin Builder<Event>
 */
#[Fillable([
    'name',
    'slug',
    'description',
    'banner',
    'location',
    'registration_start',
    'registration_end',
    'start_date',
    'end_date',
    'status',
    'is_published',
    'is_highlighted',
    'preset',
])]
class Event extends Model
{
    /**
     * Get the categories offered by the event.
     *
     * @return HasMany<EventCategory, $this>
     */
    public function categories(): HasMany
    {
        return $this->hasMany(EventCategory::class);
    }

    /**
     * Teams for a group-preset event.
     *
     * @return HasMany<EventGroup, $this>
     */
    public function groups(): HasMany
    {
        return $this->hasMany(EventGroup::class);
    }

    /**
     * Statuses that represent a finished/history event: viewable but locked
     * (no editing, no new registrations).
     */
    public const HISTORY_STATUSES = ['closed', 'completed'];

    /**
     * Whether the event is in a read-only "history" state.
     */
    public function isHistory(): bool
    {
        return in_array($this->status, self::HISTORY_STATUSES, true);
    }

    /**
     * Close registration once the quota is filled (event becomes history).
     *
     * Quota = sum of every category's registration_limit. If any category is
     * unlimited (null limit) the event has no fixed capacity and is skipped.
     */
    public function closeIfQuotaReached(): void
    {
        if ($this->isHistory()) {
            return;
        }

        $this->loadMissing('categories');

        if (
            $this->categories->isEmpty() ||
            $this->categories->contains(
                fn (EventCategory $category) => is_null($category->registration_limit)
            )
        ) {
            return;
        }

        $quota = (int) $this->categories->sum('registration_limit');

        $registered = Registration::query()
            ->whereIn('event_category_id', $this->categories->pluck('id'))
            ->whereIn('status', ['pending', 'approved', 'completed'])
            ->count();

        if ($quota > 0 && $registered >= $quota) {
            $this->update(['status' => 'closed']);
        }
    }

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'registration_start' => 'datetime',
            'registration_end' => 'datetime',
            'start_date' => 'datetime',
            'end_date' => 'datetime',
            'is_published' => 'boolean',
            'is_highlighted' => 'boolean',
        ];
    }
}
