<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\CertificateTemplate;
use App\Models\Event;
use App\Services\CertificateService;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class AdminCertificateTemplateController extends Controller
{
    public function edit(Event $event)
    {
        $template = CertificateTemplate::resolveFor($event->id)
            ?? new CertificateTemplate([
                'title' => 'Certificate of Completion',
                'body' => 'has successfully completed the {{category}} category of the {{event_name}} virtual run on {{completed_date}}.',
                'accent_color' => '#a6e212',
                'orientation' => 'landscape',
            ]);

        return Inertia::render('admin/certificates/Edit', [
            'event' => ['id' => $event->id, 'name' => $event->name],
            'tokens' => CertificateService::TOKENS,
            'template' => [
                'title' => $template->title,
                'body' => $template->body,
                'accent_color' => $template->accent_color,
                'orientation' => $template->orientation,
                'signatory_name' => $template->signatory_name,
                'signatory_title' => $template->signatory_title,
                'background_url' => $template->background_path ? "/storage/{$template->background_path}" : null,
                'logo_url' => $template->logo_path ? "/storage/{$template->logo_path}" : null,
                'signature_url' => $template->signature_path ? "/storage/{$template->signature_path}" : null,
                'is_event_specific' => (bool) $template->event_id,
            ],
        ]);
    }

    public function update(Request $request, Event $event, CertificateService $certificates)
    {
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'body' => ['required', 'string', 'max:1000'],
            'accent_color' => ['required', 'regex:/^#[0-9a-fA-F]{6}$/'],
            'orientation' => ['required', 'in:landscape,portrait'],
            'signatory_name' => ['nullable', 'string', 'max:255'],
            'signatory_title' => ['nullable', 'string', 'max:255'],
            'background' => ['nullable', 'image', 'max:5120'],
            'logo' => ['nullable', 'image', 'max:5120'],
            'signature' => ['nullable', 'image', 'max:5120'],
        ]);

        // Always work on this event's own template (created from the default).
        $template = CertificateTemplate::firstOrNew(['event_id' => $event->id]);

        $template->fill([
            'title' => $validated['title'],
            'body' => $validated['body'],
            'accent_color' => $validated['accent_color'],
            'orientation' => $validated['orientation'],
            'signatory_name' => $validated['signatory_name'] ?? null,
            'signatory_title' => $validated['signatory_title'] ?? null,
            'is_active' => true,
        ]);

        foreach (['background', 'logo', 'signature'] as $field) {
            if ($request->hasFile($field)) {
                $column = "{$field}_path";
                if ($template->{$column}) {
                    Storage::disk('public')->delete($template->{$column});
                }
                $template->{$column} = $request->file($field)
                    ->store('certificates/assets', 'public');
            }
        }

        $template->save();

        $this->toast('Certificate design saved.');

        return back();
    }

    /** Live HTML preview reflecting the in-progress form (text fields via query). */
    public function preview(Request $request, Event $event, CertificateService $certificates)
    {
        $saved = CertificateTemplate::resolveFor($event->id) ?? new CertificateTemplate();

        $template = new CertificateTemplate([
            'title' => $request->query('title', $saved->title ?: 'Certificate of Completion'),
            'body' => $request->query('body', $saved->body ?: ''),
            'accent_color' => $request->query('accent_color', $saved->accent_color ?: '#a6e212'),
            'orientation' => $request->query('orientation', $saved->orientation ?: 'landscape'),
            'signatory_name' => $request->query('signatory_name', $saved->signatory_name),
            'signatory_title' => $request->query('signatory_title', $saved->signatory_title),
        ]);
        // Keep saved image assets in the preview.
        $template->background_path = $saved->background_path;
        $template->logo_path = $saved->logo_path;
        $template->signature_path = $saved->signature_path;

        $html = $certificates->renderHtml($template, $certificates->sampleData(), forPdf: false);

        return response($html)->header('Content-Type', 'text/html');
    }

    /** Generate a sample PDF so the admin can proof the real output. */
    public function test(Event $event, CertificateService $certificates)
    {
        $template = CertificateTemplate::resolveFor($event->id);
        abort_unless($template, 404);

        $html = $certificates->renderHtml($template, $certificates->sampleData(), forPdf: true);

        $pdf = Pdf::loadHTML($html)
            ->setPaper('a4', $template->orientation === 'portrait' ? 'portrait' : 'landscape');

        return $pdf->download('certificate-sample.pdf');
    }
}
