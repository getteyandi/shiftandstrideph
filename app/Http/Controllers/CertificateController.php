<?php

namespace App\Http\Controllers;

use App\Models\Certificate;
use App\Models\Registration;
use App\Services\CertificateService;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class CertificateController extends Controller
{
    /** Download a runner's certificate, generating it on first request. */
    public function download(Registration $registration, CertificateService $certificates)
    {
        $user = Auth::user();
        abort_unless(
            $registration->user_id === $user->id || $user->role === 'admin',
            403,
        );
        abort_unless($registration->status === 'completed', 404);

        $certificate = $registration->certificate;

        if (! $certificate
            || ! $certificate->file_path
            || ! Storage::disk('public')->exists($certificate->file_path)) {
            $certificate = $certificates->generate($registration, force: true);
        }

        abort_unless($certificate && $certificate->file_path, 404);

        return Storage::disk('public')->download(
            $certificate->file_path,
            "certificate-{$certificate->serial_no}.pdf",
        );
    }

    /** Public authenticity check by serial number. */
    public function verify(string $serial)
    {
        $certificate = Certificate::where('serial_no', $serial)
            ->with(['user', 'event'])
            ->first();

        return Inertia::render('certificates/Verify', [
            'serial' => $serial,
            'certificate' => $certificate ? [
                'serial_no' => $certificate->serial_no,
                'runner_name' => $certificate->user?->full_name,
                'event_name' => $certificate->event?->name,
                'issued_at' => $certificate->issued_at?->format('F j, Y'),
            ] : null,
        ]);
    }
}
