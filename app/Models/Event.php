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
#[Fillable(['title', 'slug', 'description', 'banner', 'start_date', 'end_date', 'status'])]
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
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'start_date' => 'datetime',
            'end_date' => 'datetime',
        ];
    }
}
