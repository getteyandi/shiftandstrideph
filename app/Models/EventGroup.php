<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * A team within a group-preset event. "solo" holds 1, "duo" holds 2,
 * "group" has no limit.
 */
#[Fillable(['event_id', 'name', 'type', 'status', 'created_by'])]
class EventGroup extends Model
{
    /** null = unlimited. */
    public const CAPACITY = ['solo' => 1, 'duo' => 2, 'group' => null];

    /** Maximum members, or null when the team is unlimited ("group"). */
    public function maxMembers(): ?int
    {
        return array_key_exists($this->type, self::CAPACITY)
            ? self::CAPACITY[$this->type]
            : null;
    }

    /** Whether another runner can still be added to the team. */
    public function hasOpenSlot(): bool
    {
        $max = $this->maxMembers();

        return $max === null || $this->usedSlots() < $max;
    }

    /** Members + outstanding invites count toward the team's capacity. */
    public function usedSlots(): int
    {
        return $this->registrations()->count()
            + $this->invitations()->where('status', 'pending')->count();
    }

    public function isCaptain(?int $userId): bool
    {
        return $userId !== null && $this->created_by === $userId;
    }

    public function event(): BelongsTo
    {
        return $this->belongsTo(Event::class);
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function registrations(): HasMany
    {
        return $this->hasMany(Registration::class, 'group_id');
    }

    public function invitations(): HasMany
    {
        return $this->hasMany(GroupInvitation::class, 'group_id');
    }
}
