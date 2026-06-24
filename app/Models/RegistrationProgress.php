<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class RegistrationProgress extends Model
{
    protected $fillable = [
        'registration_id',
        'completed_km',
    ];

    protected $casts = [
        'completed_km' => 'decimal:2',
    ];

    public function registration()
    {
        return $this->belongsTo(
            Registration::class
        );
    }
}
