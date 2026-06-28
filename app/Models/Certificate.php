<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * A single issued finisher certificate (one per completed registration).
 */
#[Fillable([
    'registration_id',
    'user_id',
    'event_id',
    'certificate_template_id',
    'serial_no',
    'file_path',
    'issued_at',
])]
class Certificate extends Model
{
    protected function casts(): array
    {
        return ['issued_at' => 'datetime'];
    }

    public function registration(): BelongsTo
    {
        return $this->belongsTo(Registration::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function event(): BelongsTo
    {
        return $this->belongsTo(Event::class);
    }

    public function template(): BelongsTo
    {
        return $this->belongsTo(CertificateTemplate::class, 'certificate_template_id');
    }
}
