<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int $user_id
 * @property string $tracking_id
 * @property string $item
 * @property string|null $courier
 * @property string|null $notes
 * @property string $status
 * @property Carbon|null $shipped_at
 * @property Carbon|null $delivered_at
 */
#[Fillable([
    'user_id',
    'tracking_id',
    'item',
    'courier',
    'notes',
    'status',
    'shipped_at',
    'delivered_at',
])]
class Shipment extends Model
{
    protected function casts(): array
    {
        return [
            'shipped_at' => 'datetime',
            'delivered_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
