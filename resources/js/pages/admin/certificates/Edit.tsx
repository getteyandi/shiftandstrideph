import { Head, useForm } from '@inertiajs/react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, Download, Eye, ImageIcon, Save } from 'lucide-react';
import { Link } from '@inertiajs/react';

import AppLayout from '@/layouts/app-layout';

interface TemplateData {
    title: string;
    body: string;
    accent_color: string;
    orientation: 'landscape' | 'portrait';
    signatory_name: string | null;
    signatory_title: string | null;
    background_url: string | null;
    logo_url: string | null;
    signature_url: string | null;
    is_event_specific: boolean;
}
interface Props {
    event: { id: number; name: string };
    tokens: string[];
    template: TemplateData;
}

const SWATCHES = ['#a6e212', '#22d3ee', '#ff8a3d', '#c084fc', '#f43f5e', '#facc15'];

export default function Edit({ event, tokens, template }: Props) {
    const bodyRef = useRef<HTMLTextAreaElement>(null);

    const { data, setData, post, processing, errors } = useForm({
        title: template.title ?? '',
        body: template.body ?? '',
        accent_color: template.accent_color ?? '#a6e212',
        orientation: template.orientation ?? 'landscape',
        signatory_name: template.signatory_name ?? '',
        signatory_title: template.signatory_title ?? '',
        background: null as File | null,
        logo: null as File | null,
        signature: null as File | null,
    });

    // Debounced live preview — text fields drive the iframe via query params.
    const [previewKey, setPreviewKey] = useState(0);
    const previewSrc = useMemo(() => {
        const q = new URLSearchParams({
            title: data.title,
            body: data.body,
            accent_color: data.accent_color,
            orientation: data.orientation,
            signatory_name: data.signatory_name,
            signatory_title: data.signatory_title,
            v: String(previewKey),
        });
        return `/admin/events/${event.id}/certificate/preview?${q.toString()}`;
    }, [data, previewKey, event.id]);

    const [debouncedSrc, setDebouncedSrc] = useState(previewSrc);
    useEffect(() => {
        const t = setTimeout(() => setDebouncedSrc(previewSrc), 400);
        return () => clearTimeout(t);
    }, [previewSrc]);

    const insertToken = (token: string) => {
        const el = bodyRef.current;
        const tag = `{{${token}}}`;
        if (!el) {
            setData('body', `${data.body}${tag}`);
            return;
        }
        const start = el.selectionStart;
        const end = el.selectionEnd;
        const next = data.body.slice(0, start) + tag + data.body.slice(end);
        setData('body', next);
        requestAnimationFrame(() => {
            el.focus();
            el.selectionStart = el.selectionEnd = start + tag.length;
        });
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(`/admin/events/${event.id}/certificate`, {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => setPreviewKey((k) => k + 1),
        });
    };

    return (
        <div>
            <Head title={`Certificate · ${event.name}`} />

            <div className="space-y-6">
                <div>
                    <Link
                        href="/admin/events"
                        className="inline-flex items-center gap-2 text-sm font-semibold text-muted-2 transition hover:text-lime-deep"
                    >
                        <ArrowLeft size={16} />
                        Back to events
                    </Link>
                    <h1 className="mt-2 font-display text-[clamp(26px,4vw,40px)] font-extrabold uppercase italic leading-[.95] text-ink">
                        Certificate Design
                    </h1>
                    <p className="mt-1 text-sm text-muted-2">
                        {event.name} ·{' '}
                        {data.title && data.body
                            ? template.is_event_specific
                                ? 'Custom design for this event'
                                : 'Editing from the default — saving creates a design for this event'
                            : ''}
                    </p>
                </div>

                <div className="flex flex-col-reverse gap-6">
                    {/* form */}
                    <form
                        onSubmit={submit}
                        className="space-y-5 rounded-[20px] border border-line bg-card p-6"
                    >
                        <Field label="Title" error={errors.title}>
                            <input
                                value={data.title}
                                onChange={(e) => setData('title', e.target.value)}
                                className="w-full rounded-xl border border-line bg-card px-4 py-2.5 text-ink outline-none transition focus:border-lime"
                            />
                        </Field>

                        <Field label="Body" error={errors.body}>
                            <textarea
                                ref={bodyRef}
                                rows={3}
                                value={data.body}
                                onChange={(e) => setData('body', e.target.value)}
                                className="w-full rounded-xl border border-line bg-card px-4 py-2.5 text-ink outline-none transition focus:border-lime"
                            />
                            <div className="mt-2 flex flex-wrap items-center gap-1.5">
                                <span className="text-[11px] font-semibold text-muted">
                                    Insert:
                                </span>
                                {tokens.map((t) => (
                                    <button
                                        key={t}
                                        type="button"
                                        onClick={() => insertToken(t)}
                                        className="rounded-md border border-line bg-[#f7f9f1] px-2 py-0.5 font-mono text-[11px] text-muted-2 transition hover:border-lime hover:text-lime-deep"
                                    >
                                        {`{{${t}}}`}
                                    </button>
                                ))}
                            </div>
                        </Field>

                        <div className="grid gap-5 sm:grid-cols-2">
                            <Field label="Accent color" error={errors.accent_color}>
                                <div className="flex flex-wrap items-center gap-2">
                                    {SWATCHES.map((c) => (
                                        <button
                                            key={c}
                                            type="button"
                                            onClick={() =>
                                                setData('accent_color', c)
                                            }
                                            aria-label={c}
                                            style={{ background: c }}
                                            className={`h-7 w-7 rounded-full transition ${
                                                data.accent_color.toLowerCase() ===
                                                c
                                                    ? 'outline outline-2 outline-offset-2 outline-lime-deep'
                                                    : ''
                                            }`}
                                        />
                                    ))}
                                    <input
                                        type="color"
                                        value={data.accent_color}
                                        onChange={(e) =>
                                            setData('accent_color', e.target.value)
                                        }
                                        className="h-7 w-9 cursor-pointer rounded border border-line bg-card"
                                    />
                                </div>
                            </Field>

                            <Field label="Orientation">
                                <div className="flex gap-2">
                                    {(['landscape', 'portrait'] as const).map(
                                        (o) => (
                                            <button
                                                key={o}
                                                type="button"
                                                onClick={() =>
                                                    setData('orientation', o)
                                                }
                                                className={`flex-1 rounded-xl border px-3 py-2 text-sm font-bold capitalize transition ${
                                                    data.orientation === o
                                                        ? 'border-lime bg-[#F7FCEB] text-ink'
                                                        : 'border-line text-muted hover:border-lime'
                                                }`}
                                            >
                                                {o}
                                            </button>
                                        ),
                                    )}
                                </div>
                            </Field>
                        </div>

                        <div className="grid gap-5 sm:grid-cols-2">
                            <Field label="Signatory name">
                                <input
                                    value={data.signatory_name}
                                    onChange={(e) =>
                                        setData('signatory_name', e.target.value)
                                    }
                                    placeholder="Race Director"
                                    className="w-full rounded-xl border border-line bg-card px-4 py-2.5 text-ink outline-none transition focus:border-lime"
                                />
                            </Field>
                            <Field label="Signatory title">
                                <input
                                    value={data.signatory_title}
                                    onChange={(e) =>
                                        setData('signatory_title', e.target.value)
                                    }
                                    placeholder="Shift & Stride PH"
                                    className="w-full rounded-xl border border-line bg-card px-4 py-2.5 text-ink outline-none transition focus:border-lime"
                                />
                            </Field>
                        </div>

                        <div className="grid gap-3 sm:grid-cols-3">
                            <FileField
                                label="Background"
                                current={template.background_url}
                                onPick={(f) => setData('background', f)}
                                file={data.background}
                            />
                            <FileField
                                label="Logo"
                                current={template.logo_url}
                                onPick={(f) => setData('logo', f)}
                                file={data.logo}
                            />
                            <FileField
                                label="Signature"
                                current={template.signature_url}
                                onPick={(f) => setData('signature', f)}
                                file={data.signature}
                            />
                        </div>
                        <p className="text-[11px] text-muted">
                            Text and color update the preview instantly. New
                            images appear after you save.
                        </p>

                        <div className="flex flex-wrap items-center gap-3 pt-1">
                            <button
                                type="submit"
                                disabled={processing}
                                className="inline-flex items-center gap-2 rounded-xl bg-ink px-5 py-2.5 text-sm font-bold text-lime transition hover:bg-lime hover:text-ink disabled:opacity-50"
                            >
                                <Save size={16} />
                                Save design
                            </button>
                            <a
                                href={`/admin/events/${event.id}/certificate/test`}
                                className="inline-flex items-center gap-2 rounded-xl border border-line px-5 py-2.5 text-sm font-bold text-ink transition hover:border-lime"
                            >
                                <Download size={16} />
                                Download sample PDF
                            </a>
                        </div>
                    </form>

                    {/* live preview — full width */}
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[.14em] text-lime-deep">
                            <Eye size={14} />
                            Live preview · sample data
                        </div>
                        <div className="overflow-hidden rounded-[18px] border border-line bg-[#12150d]">
                            <iframe
                                key={debouncedSrc}
                                src={debouncedSrc}
                                title="Certificate preview"
                                className="w-full"
                                style={{
                                    border: 0,
                                    height:
                                        data.orientation === 'portrait'
                                            ? 900
                                            : 640,
                                }}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function Field({
    label,
    error,
    children,
}: {
    label: string;
    error?: string;
    children: React.ReactNode;
}) {
    return (
        <div>
            <label className="mb-1.5 block text-sm font-bold text-ink">
                {label}
            </label>
            {children}
            {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
        </div>
    );
}

function FileField({
    label,
    current,
    file,
    onPick,
}: {
    label: string;
    current: string | null;
    file: File | null;
    onPick: (f: File | null) => void;
}) {
    return (
        <label className="cursor-pointer">
            <span className="mb-1.5 block text-sm font-bold text-ink">
                {label}
            </span>
            <div className="flex h-20 items-center justify-center overflow-hidden rounded-xl border border-dashed border-line bg-[#f7f9f1] text-center text-xs text-muted transition hover:border-lime">
                {file ? (
                    <span className="px-2 font-semibold text-lime-deep">
                        {file.name}
                    </span>
                ) : current ? (
                    <img
                        src={current}
                        alt=""
                        className="h-full w-full object-contain p-2"
                    />
                ) : (
                    <span className="inline-flex items-center gap-1.5">
                        <ImageIcon size={15} />
                        Upload
                    </span>
                )}
            </div>
            <input
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={(e) => onPick(e.target.files?.[0] ?? null)}
            />
        </label>
    );
}

Edit.layout = (page: React.ReactNode) => (
    <AppLayout active="events">{page}</AppLayout>
);
