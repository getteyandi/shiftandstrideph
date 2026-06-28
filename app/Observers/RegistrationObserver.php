<?php

namespace App\Observers;

use App\Models\Registration;
use App\Services\CertificateService;
use Illuminate\Support\Facades\Log;

class RegistrationObserver
{
    public function __construct(private CertificateService $certificates)
    {
    }

    /**
     * Issue a finisher certificate the moment a registration is completed.
     * Failures never block the run-approval flow that triggered completion.
     */
    public function updated(Registration $registration): void
    {
        if ($registration->wasChanged('status') && $registration->status === 'completed') {
            try {
                $this->certificates->generate($registration);
            } catch (\Throwable $e) {
                Log::error('Certificate generation failed', [
                    'registration_id' => $registration->id,
                    'error' => $e->getMessage(),
                ]);
            }
        }
    }
}
