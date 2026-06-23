<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int $event_id
 * @property string $name
 * @property string $target_km
 * @property bool $ranking_enabled
 * @property int|null $badge_id
 * @property string|null $certificate_template
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property-read Event $event
 *
 * @mixin Builder<EventCategory>
 */
#[Fillable(['event_id', 'name', 'target_km', 'ranking_enabled', 'badge_id', 'certificate_template'])]
class EventCategory extends Model
{
    /**
     * Get the event that owns the category.
     *
     * @return BelongsTo<Event, $this>
     */
    public function event(): BelongsTo
    {
        return $this->belongsTo(Event::class);
    }

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'target_km' => 'decimal:2',
            'ranking_enabled' => 'boolean',
        ];
    }
}
