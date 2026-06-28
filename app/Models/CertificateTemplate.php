<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * The admin-editable design for finisher certificates. A row with a null
 * event_id is the global default used when an event has no template of its own.
 */
#[Fillable([
    'event_id',
    'title',
    'body',
    'accent_color',
    'orientation',
    'background_path',
    'logo_path',
    'signature_path',
    'signatory_name',
    'signatory_title',
    'is_active',
])]
class CertificateTemplate extends Model
{
    protected function casts(): array
    {
        return ['is_active' => 'boolean'];
    }

    /** Active template for an event, falling back to the global default. */
    public static function resolveFor(?int $eventId): ?self
    {
        return ($eventId
            ? self::where('event_id', $eventId)->where('is_active', true)->first()
            : null)
            ?? self::whereNull('event_id')->where('is_active', true)->first();
    }

    public function event(): BelongsTo
    {
        return $this->belongsTo(Event::class);
    }
}
