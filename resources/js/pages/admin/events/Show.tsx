import { Head, Link } from '@inertiajs/react';
import {
    ArrowLeft,
    MapPin,
    CalendarDays,
    Users,
    Flag,
    Hash,
} from 'lucide-react';

import AppLayout from '@/layouts/app-layout';
import SectionHeader from '@/components/SectionHeader';

interface Category {
    id: number;
    name: string;
    target_km: number;
    registration_limit: number | null;
    joined: number;
}

interface Participant {
    id: number;
    runner: string | null;
    runner_code: string | null;
    profile_photo: string | null;
    category_name: string;
    bib_number: string;
    status: string;
    completed_km: number;
    target_km: number;
}

interface EventShow {
    id: number;
    name: string;
    description: string;
    banner: string | null;
    location: string;
    status: string;
    registration_start: string | null;
    registration_end: string | null;
    start_date: string | null;
    end_date: string | null;
    categories: Category[];
}

interface Props {
    event: EventShow;
    participants: Participant[];
}

const statusPill = (status: string) => {
    switch (status) {
        case 'approved':
        case 'completed':
            return 'bg-lime text-[#12150d]';
        case 'pending':
            return 'bg-[#FEF3C7] text-[#92600A]';
        case 'rejected':
            return 'bg-[#FEE2E2] text-[#B91C1C]';
        default:
            return 'bg-[#E4E8DD] text-[#5A6152]';
    }
};

export default function Show({ event, participants }: Props) {
    const isHistory =
        event.status === 'closed' || event.status === 'completed';

    return (
        <>
            <Head title={event.name} />

            <div className="space-y-8">
                <Link
                    href="/admin/events"
                    className="inline-flex items-center gap-2 text-sm font-semibold text-[#5A6152] transition hover:text-lime-deep"
                >
                    <ArrowLeft size={16} />
                    Back to events
                </Link>

                {/* HERO */}
                <div className="relative overflow-hidden rounded-[24px] border border-[#2a3120] bg-[linear-gradient(145deg,#12150d,#0b0d09)] p-8">
                    {event.banner && (
                        <img
                            src={`/storage/${event.banner}`}
                            alt={event.name}
                            className="absolute inset-0 h-full w-full object-cover opacity-25"
                        />
                    )}
                    <div className="relative">
                        <span className="inline-flex rounded-full bg-lime/15 px-3 py-1 text-xs font-bold uppercase tracking-[.1em] text-lime">
                            {event.status}
                        </span>
                        <h1 className="mt-3 font-display text-5xl font-black italic text-white">
                            {event.name}
                        </h1>
                        <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-sm text-[#98A08E]">
                            <span className="inline-flex items-center gap-1.5">
                                <MapPin size={15} />
                                {event.location}
                            </span>
                            <span className="inline-flex items-center gap-1.5">
                                <CalendarDays size={15} />
                                {event.start_date} – {event.end_date}
                            </span>
                            <span className="inline-flex items-center gap-1.5">
                                <Users size={15} />
                                {participants.length} joined
                            </span>
                        </div>
                        {isHistory && (
                            <p className="mt-4 max-w-xl text-sm text-[#cdd3c3]">
                                This event is in history (view only).
                            </p>
                        )}
                    </div>
                </div>

                {/* DETAILS + CATEGORIES */}
                <div className="grid gap-6 lg:grid-cols-3">
                    <div className="rounded-3xl border border-line bg-card p-6 lg:col-span-2">
                        <h2 className="font-display text-xl font-bold italic text-ink">
                            About
                        </h2>
                        <p className="mt-2 whitespace-pre-line text-sm text-[#4b5340]">
                            {event.description}
                        </p>
                        <div className="mt-5 grid grid-cols-2 gap-4 border-t border-line pt-5 text-sm">
                            <Field
                                label="Registration opens"
                                value={event.registration_start ?? '—'}
                            />
                            <Field
                                label="Registration closes"
                                value={event.registration_end ?? '—'}
                            />
                        </div>
                    </div>

                    <div className="rounded-3xl border border-line bg-card p-6">
                        <h2 className="mb-4 font-display text-xl font-bold italic text-ink">
                            Categories
                        </h2>
                        <ul className="space-y-3">
                            {event.categories.map((c) => (
                                <li
                                    key={c.id}
                                    className="flex items-center justify-between rounded-xl border border-line px-3 py-2.5"
                                >
                                    <span className="flex items-center gap-2">
                                        <Flag size={15} className="text-lime" />
                                        <span className="font-display text-lg font-black italic text-ink">
                                            {c.name}
                                        </span>
                                        <span className="text-xs text-muted">
                                            {c.target_km} km
                                        </span>
                                    </span>
                                    <span className="text-xs font-semibold text-[#70766a]">
                                        {c.joined}
                                        {c.registration_limit
                                            ? `/${c.registration_limit}`
                                            : ''}{' '}
                                        joined
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* PARTICIPANTS */}
                <div>
                    <SectionHeader
                        title="Participants"
                        aside={
                            <span className="text-sm font-semibold text-muted">
                                {participants.length} runners
                            </span>
                        }
                    />
                    {participants.length === 0 ? (
                        <div className="rounded-3xl border border-dashed border-line bg-card py-16 text-center">
                            <Users className="mx-auto mb-3 text-lime" size={36} />
                            <p className="font-semibold text-ink">
                                No one has joined yet
                            </p>
                        </div>
                    ) : (
                        <div className="overflow-hidden rounded-3xl border border-line bg-card">
                            {participants.map((p) => (
                                <div
                                    key={p.id}
                                    className="flex flex-wrap items-center gap-4 border-b border-[#F0F2EA] px-5 py-4 last:border-b-0"
                                >
                                    <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[linear-gradient(135deg,#1c2114,#0c0f0b)] font-display text-sm font-bold text-white">
                                        {p.profile_photo ? (
                                            <img
                                                src={`/storage/${p.profile_photo}`}
                                                alt=""
                                                className="h-full w-full object-cover"
                                            />
                                        ) : (
                                            (p.runner ?? '?')
                                                .split(' ')
                                                .map((w) => w[0])
                                                .slice(0, 2)
                                                .join('')
                                                .toUpperCase()
                                        )}
                                    </div>

                                    <div className="min-w-[150px] flex-1">
                                        <div className="text-[15px] font-bold text-ink">
                                            {p.runner}
                                        </div>
                                        <div className="text-[12.5px] text-muted">
                                            {p.runner_code ?? '—'} ·{' '}
                                            {p.category_name}
                                            <span className="ml-1 inline-flex items-center gap-0.5">
                                                <Hash size={11} />
                                                {p.bib_number}
                                            </span>
                                        </div>
                                    </div>

                                    <span className="text-sm font-semibold text-ink">
                                        {p.completed_km}/{p.target_km} KM
                                    </span>

                                    <span
                                        className={`rounded-full px-3 py-1 text-xs font-bold uppercase ${statusPill(
                                            p.status,
                                        )}`}
                                    >
                                        {p.status}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}

function Field({ label, value }: { label: string; value: string }) {
    return (
        <div>
            <div className="text-[10px] font-bold uppercase tracking-[.14em] text-[#92A084]">
                {label}
            </div>
            <div className="mt-0.5 font-semibold text-ink">{value}</div>
        </div>
    );
}

Show.layout = (page: React.ReactNode) => (
    <AppLayout active="events">{page}</AppLayout>
);
