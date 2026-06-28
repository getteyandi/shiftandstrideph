<?php

namespace App\Services;

use App\Models\Certificate;
use App\Models\CertificateTemplate;
use App\Models\Registration;
use App\Notifications\AppNotification;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Support\Facades\Storage;

class CertificateService
{
    /** The tokens an admin can drop into the title/body. */
    public const TOKENS = [
        'runner_name', 'event_name', 'category', 'distance',
        'completed_date', 'bib', 'rank', 'serial',
    ];

    /**
     * Generate (or regenerate) the certificate for a completed registration.
     */
    public function generate(Registration $registration, bool $force = false): ?Certificate
    {
        $registration->loadMissing('user', 'eventCategory.event');
        $event = $registration->eventCategory?->event;

        $template = CertificateTemplate::resolveFor($event?->id);
        if (! $template) {
            return null; // no design configured yet
        }

        $certificate = Certificate::firstOrNew(['registration_id' => $registration->id]);

        if ($certificate->exists && ! $force && $certificate->file_path
            && Storage::disk('public')->exists($certificate->file_path)) {
            return $certificate; // already issued
        }

        $certificate->fill([
            'user_id' => $registration->user_id,
            'event_id' => $event?->id,
            'certificate_template_id' => $template->id,
            'issued_at' => now(),
        ]);
        $certificate->serial_no ??= $this->serial();
        $certificate->save();

        $data = $this->dataFor($registration, $certificate->serial_no);
        $html = $this->renderHtml($template, $data, forPdf: true);

        $pdf = Pdf::loadHTML($html)
            ->setPaper('a4', $template->orientation === 'portrait' ? 'portrait' : 'landscape');

        $path = "certificates/{$certificate->serial_no}.pdf";
        Storage::disk('public')->put($path, $pdf->output());

        $certificate->update(['file_path' => $path]);

        $registration->user?->notify(new AppNotification(
            'Certificate ready 🎉',
            "Your finisher certificate for {$event?->name} is ready to download.",
            route('certificates.download', $registration),
            'approval',
        ));

        return $certificate;
    }

    /** Render the certificate Blade to HTML (used for both PDF and preview). */
    public function renderHtml(CertificateTemplate $template, array $data, bool $forPdf): string
    {
        return view('certificate', [
            'template' => $template,
            'data' => $data,
            'title' => $this->replaceTokens($template->title, $data, highlight: false, escape: false),
            'body' => $this->replaceTokens($template->body, $data, highlight: true, escape: true),
            'backgroundSrc' => $this->src($template->background_path, $forPdf),
            'logoSrc' => $this->src($template->logo_path, $forPdf),
            'signatureSrc' => $this->src($template->signature_path, $forPdf),
            'verifyUrl' => url('/verify/' . ($data['serial'] ?? '')),
        ])->render();
    }

    /** Token values for a real registration. */
    public function dataFor(Registration $registration, string $serial): array
    {
        $registration->loadMissing('user', 'eventCategory.event');
        $category = $registration->eventCategory;

        return [
            'runner_name' => $registration->user?->full_name ?? 'Runner',
            'event_name' => $category?->event?->name ?? 'Event',
            'category' => $category?->name ?? '',
            'distance' => $this->km($category?->target_km),
            'completed_date' => ($registration->completed_at ?? now())->format('M j, Y'),
            'bib' => $registration->bib_number ?? '',
            'rank' => $this->rankIn($registration),
            'serial' => $serial,
        ];
    }

    /** Placeholder values for the admin's live preview. */
    public function sampleData(): array
    {
        return [
            'runner_name' => 'Juan Dela Cruz',
            'event_name' => 'New Year Dash 2026',
            'category' => '21 KM',
            'distance' => '21 KM',
            'completed_date' => now()->format('M j, Y'),
            'bib' => '00142',
            'rank' => '3',
            'serial' => 'SSP-' . now()->year . '-000142',
        ];
    }

    private function replaceTokens(string $text, array $data, bool $highlight, bool $escape): string
    {
        return preg_replace_callback('/\{\{\s*(\w+)\s*\}\}/', function ($m) use ($data, $highlight, $escape) {
            $value = (string) ($data[$m[1]] ?? '');
            if ($escape) {
                $value = e($value);
            }

            return $highlight ? '<span class="hl">' . $value . '</span>' : $value;
        }, $text);
    }

    private function src(?string $path, bool $forPdf): ?string
    {
        if (! $path || ! Storage::disk('public')->exists($path)) {
            return null;
        }

        if (! $forPdf) {
            return '/storage/' . $path;
        }

        $mime = Storage::disk('public')->mimeType($path) ?: 'image/png';

        return 'data:' . $mime . ';base64,' . base64_encode(Storage::disk('public')->get($path));
    }

    private function km(null|int|float|string $value): string
    {
        $n = (float) $value;

        return rtrim(rtrim(number_format($n, 2), '0'), '.') . ' KM';
    }

    private function rankIn(Registration $registration): string
    {
        $catIds = $registration->eventCategory
            ? [$registration->event_category_id]
            : [];

        if (! $catIds) {
            return '—';
        }

        $order = Registration::whereIn('event_category_id', $catIds)
            ->whereIn('status', ['approved', 'completed'])
            ->orderByDesc('completed_km')
            ->pluck('user_id')
            ->values();

        $i = $order->search($registration->user_id);

        return $i === false ? '—' : (string) ($i + 1);
    }

    private function serial(): string
    {
        do {
            $serial = sprintf('SSP-%d-%06d', now()->year, random_int(1, 999999));
        } while (Certificate::where('serial_no', $serial)->exists());

        return $serial;
    }
}
