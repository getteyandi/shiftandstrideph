import { Head, useForm } from '@inertiajs/react';
import { useRef, useState } from 'react';

import { Upload, Check, ImageIcon } from '@/lib/icons';
import { cn } from '@/lib/utils';
import AppLayout from '@/layouts/app-layout';
import SectionHeader from '@/components/SectionHeader';

interface Reg {
    id: number | string;
    event_name: string;
    category_name: string;
    bib_number: string;
    distance_done: number;
    target_km: number;
}
interface RecentSub {
    id: number | string;
    km: string | number;
    date: string;
    status: 'APPROVED' | 'PENDING' | 'REJECTED' | string;
    proof_thumb_url?: string;
}

interface SubmitRunProps {
    /** The runner's active (non-completed) registrations — toggle targets. */
    activeRegistrations: Reg[];
    recentSubmissions: RecentSub[];
    /** Pre-formatted run date for display (today). */
    runDate?: string;
}

const STATUS_PILL: Record<string, { bg: string; fg: string }> = {
    APPROVED: { bg: '#eef7d8', fg: '#5f8c00' },
    PENDING: { bg: '#fff3d6', fg: '#b07d00' },
    REJECTED: { bg: '#fde4e1', fg: '#c0392b' },
};

export default function SubmitRun({
    activeRegistrations,
    recentSubmissions,
    runDate = 'Jun 25, 2026',
}: SubmitRunProps) {
    const fileInput = useRef<HTMLInputElement>(null);
    const [preview, setPreview] = useState<string | null>(null);

    // One upload → many registrations (registration_submission pivot).
    const { data, setData, post, processing, recentlySuccessful } = useForm<{
        proof: File | null;
        distance: string;
        notes: string;
        registration_ids: (number | string)[];
    }>({
        proof: null,
        distance: '',
        notes: '',
        registration_ids: activeRegistrations.map((r) => r.id), // all on by default
    });

    function toggleReg(id: number | string) {
        setData(
            'registration_ids',
            data.registration_ids.includes(id)
                ? data.registration_ids.filter((x) => x !== id)
                : [...data.registration_ids, id],
        );
    }

    function onFile(file?: File) {
        if (!file) return;
        setData('proof', file);
        setPreview(URL.createObjectURL(file));
    }

    function submit() {
        post('/runs', { forceFormData: true, preserveScroll: true });
    }

    return (
        <AppLayout active="submit">
            <Head title="Submit Run" />

            <div className="animate-[floatup_.4s_ease_both]">
                <div className="mb-[22px]">
                    <div className="mb-1.5 text-[11px] font-bold tracking-[.28em] text-lime-deep uppercase">
                        Log Activity
                    </div>
                    <h1 className="m-0 font-display text-[clamp(30px,4.4vw,44px)] leading-[.92] font-extrabold uppercase italic">
                        Submit Your Run
                    </h1>
                </div>

                <div className="grid grid-cols-[repeat(auto-fit,minmax(320px,1fr))] items-start gap-6">
                    {/* form */}
                    <div className="rounded-[20px] border border-line bg-card p-6">
                        <div className="mb-2.5 text-[11px] font-bold tracking-[.16em] text-[#9aa18d] uppercase">
                            Proof Photo
                        </div>

                        <label className="group flex h-[190px] cursor-pointer flex-col items-center justify-center gap-2.5 overflow-hidden rounded-2xl border-2 border-dashed border-[#c8cfbb] bg-[#f8faf3] text-center transition-colors hover:border-lime hover:bg-[#f3f8e6]">
                            <input
                                ref={fileInput}
                                type="file"
                                accept="image/png,image/jpeg"
                                className="sr-only"
                                onChange={(e) => onFile(e.target.files?.[0])}
                            />
                            {preview ? (
                                <img
                                    src={preview}
                                    alt="Selected proof"
                                    className="h-full w-full object-cover"
                                />
                            ) : (
                                <>
                                    <div className="flex h-[54px] w-[54px] items-center justify-center rounded-[15px] bg-ink-900 text-lime">
                                        <Upload size={24} strokeWidth={2} />
                                    </div>
                                    <div>
                                        <div className="font-bold text-ink">
                                            Drop your watch / treadmill photo
                                        </div>
                                        <div className="mt-0.5 text-[12.5px] text-muted">
                                            PNG or JPG · proof of distance
                                        </div>
                                    </div>
                                </>
                            )}
                        </label>

                        <div className="mt-5 grid grid-cols-2 gap-3.5">
                            <div>
                                <div className="mb-[7px] text-[11px] font-bold tracking-[.16em] text-[#9aa18d] uppercase">
                                    Distance (KM)
                                </div>
                                <div className="relative">
                                    <input
                                        value={data.distance}
                                        onChange={(e) =>
                                            setData('distance', e.target.value)
                                        }
                                        placeholder="0.0"
                                        inputMode="decimal"
                                        className="w-full rounded-xl border-[1.5px] border-line-2 py-3 pr-[50px] pl-3.5 font-stat text-xl font-bold text-ink outline-none focus:border-lime"
                                    />
                                    <span className="absolute top-1/2 right-3.5 -translate-y-1/2 text-[13px] font-bold text-[#9aa18d]">
                                        KM
                                    </span>
                                </div>
                            </div>
                            <div>
                                <div className="mb-[7px] text-[11px] font-bold tracking-[.16em] text-[#9aa18d] uppercase">
                                    Run Date
                                </div>
                                <input
                                    value={runDate}
                                    readOnly
                                    className="w-full rounded-xl border-[1.5px] border-line-2 px-3.5 py-3 text-[15px] font-semibold text-[#3A4034] outline-none"
                                />
                            </div>
                        </div>

                        <div className="mt-4">
                            <div className="mb-[7px] text-[11px] font-bold tracking-[.16em] text-[#9aa18d] uppercase">
                                Notes{' '}
                                <span className="font-medium tracking-normal text-[#bcc2b0] normal-case">
                                    · optional
                                </span>
                            </div>
                            <textarea
                                value={data.notes}
                                onChange={(e) =>
                                    setData('notes', e.target.value)
                                }
                                placeholder="Morning run along the coastal road…"
                                rows={2}
                                className="w-full resize-y rounded-xl border-[1.5px] border-line-2 px-3.5 py-3 font-sans text-sm text-ink outline-none focus:border-lime"
                            />
                        </div>
                    </div>

                    {/* apply to + recent */}
                    <div className="flex flex-col gap-6">
                        <div className="rounded-[20px] border border-line bg-card p-6">
                            <div className="mb-[3px] font-bold text-ink">
                                Apply this run to
                            </div>
                            <div className="mb-4 text-[12.5px] text-muted">
                                One submission can count toward multiple active
                                registrations — no duplicate uploads.
                            </div>

                            <div className="flex flex-col gap-2.5">
                                {activeRegistrations.map((r) => {
                                    const on = data.registration_ids.includes(
                                        r.id,
                                    );
                                    return (
                                        <button
                                            key={r.id}
                                            type="button"
                                            onClick={() => toggleReg(r.id)}
                                            aria-pressed={on}
                                            className={cn(
                                                'flex w-full items-center gap-3.5 rounded-[14px] border-[1.5px] p-3.5 text-left transition-colors',
                                                on
                                                    ? 'border-lime bg-[#f6fbe8]'
                                                    : 'border-[#E4E8DD] bg-card',
                                            )}
                                        >
                                            <span
                                                className={cn(
                                                    'flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-[7px] border-2 text-ink-900',
                                                    on
                                                        ? 'border-lime bg-lime'
                                                        : 'border-[#cdd3c2] bg-card',
                                                )}
                                            >
                                                {on ? (
                                                    <Check
                                                        size={13}
                                                        strokeWidth={3.5}
                                                    />
                                                ) : null}
                                            </span>
                                            <span className="flex-1">
                                                <span className="block text-[14.5px] font-bold text-ink">
                                                    {r.event_name}
                                                </span>
                                                <span className="mt-px block text-[12.5px] text-muted">
                                                    {r.category_name} · Bib{' '}
                                                    {r.bib_number} ·{' '}
                                                    {r.distance_done}/
                                                    {r.target_km} KM
                                                </span>
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>

                            <button
                                type="button"
                                onClick={submit}
                                disabled={
                                    processing ||
                                    data.registration_ids.length === 0
                                }
                                className="mt-[18px] flex w-full items-center justify-center gap-2 rounded-[13px] bg-lime px-4 py-[15px] font-display text-[17px] font-extrabold tracking-[.03em] text-ink-900 uppercase italic transition-colors hover:bg-[#b8f032] disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {recentlySuccessful ? (
                                    <>
                                        <Check size={18} strokeWidth={3} />{' '}
                                        Submitted for review
                                    </>
                                ) : (
                                    'Submit for verification'
                                )}
                            </button>
                        </div>

                        <div className="rounded-[20px] border border-line bg-card p-[22px]">
                            <SectionHeader
                                title="Recent Submissions"
                                size="sm"
                            />
                            {recentSubmissions.map((s) => {
                                const pill =
                                    STATUS_PILL[s.status] ??
                                    STATUS_PILL.PENDING;
                                return (
                                    <div
                                        key={s.id}
                                        className="flex items-center gap-3.5 border-b border-[#F0F2EA] py-[11px] last:border-b-0"
                                    >
                                        <div
                                            className="flex h-[42px] w-[42px] shrink-0 items-center justify-center overflow-hidden rounded-[11px] bg-cover bg-center text-white/70"
                                            style={{
                                                background: s.proof_thumb_url
                                                    ? `center/cover url(${s.proof_thumb_url})`
                                                    : 'linear-gradient(135deg,#3a4a22,#1a2010)',
                                            }}
                                        >
                                            {s.proof_thumb_url ? null : (
                                                <ImageIcon size={16} />
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <div className="font-stat text-base font-bold text-ink">
                                                {s.km} KM
                                            </div>
                                            <div className="text-xs text-muted">
                                                {s.date}
                                            </div>
                                        </div>
                                        <span
                                            className="rounded-full px-2.5 py-[5px] text-[11px] font-extrabold tracking-[.05em]"
                                            style={{
                                                background: pill.bg,
                                                color: pill.fg,
                                            }}
                                        >
                                            {s.status}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
