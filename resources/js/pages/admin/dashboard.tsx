import { Head, Link } from '@inertiajs/react';
import {
    Users,
    ClipboardList,
    Upload,
    Calendar,
    ArrowRight,
    MapPin,
    Flag,
} from 'lucide-react';

import AppLayout from '@/layouts/app-layout';

interface EventTracker {
    id: number;
    name: string;
    location: string;
    status: string;
    end_date: string | null;
    participants: number;
    target_km: number;
    completed_km: number;
    remaining_km: number;
    percentage: number;
}

interface Stats {
    total_users: number;
    total_events: number;
    total_registrations: number;
    total_submissions: number;
    pending_users: number;
    pending_registrations: number;
    pending_submissions: number;
}

interface RecentRegistration {
    id: number;
    runner: string | null;
    event: string | null;
    category: string | null;
    bib_number: string;
    status: string;
    created_at: string | null;
}

interface RecentUser {
    id: number;
    name: string;
    email: string;
    status: string;
    runner_code: string | null;
    created_at: string | null;
}

interface RecentSubmission {
    id: number;
    runner: string | null;
    distance: number;
    status: string;
    created_at: string | null;
}

interface Props {
    stats: Stats;
    eventTrackers: EventTracker[];
    recentRegistrations: RecentRegistration[];
    recentUsers: RecentUser[];
    recentSubmissions: RecentSubmission[];
}

const statusPill = (status: string) => {
    switch (status) {
        case 'approved':
        case 'active':
        case 'completed':
            return 'bg-lime text-[#12150d]';
        case 'pending':
            return 'bg-[#FEF3C7] text-[#92600A]';
        case 'rejected':
        case 'suspended':
            return 'bg-[#FEE2E2] text-[#B91C1C]';
        default:
            return 'bg-[#E4E8DD] text-[#5A6152]';
    }
};

export default function Dashboard({
    stats,
    eventTrackers,
    recentRegistrations,
    recentUsers,
    recentSubmissions,
}: Props) {
    return (
        <>
            <Head title="Admin Dashboard" />

            <div className="space-y-8">

                {/* HERO */}
                <div className="relative overflow-hidden rounded-[24px] border border-[#2a3120] bg-[linear-gradient(145deg,#12150d,#0b0d09)] p-8">
                    <div className="absolute right-0 top-0 h-80 w-80 rounded-full bg-lime/10 blur-3xl" />
                    <div className="relative">
                        <p className="mb-2 text-xs font-bold tracking-[.28em] uppercase text-lime">
                            Administration
                        </p>
                        <h1 className="font-display text-5xl font-black italic text-white">
                            DASHBOARD
                        </h1>
                        <p className="mt-3 max-w-xl text-sm text-[#98A08E]">
                            Live overview of events, runners and submissions
                            across Shift &amp; Stride PH.
                        </p>
                    </div>
                </div>

                {/* STATS */}
                <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
                    <StatCard
                        icon={Users}
                        title="Total Runners"
                        value={stats.total_users}
                        hint={`${stats.pending_users} pending approval`}
                    />
                    <StatCard
                        icon={Calendar}
                        title="Events"
                        value={stats.total_events}
                    />
                    <StatCard
                        icon={ClipboardList}
                        title="Registrations"
                        value={stats.total_registrations}
                        hint={`${stats.pending_registrations} pending`}
                    />
                    <StatCard
                        icon={Upload}
                        title="Run Submissions"
                        value={stats.total_submissions}
                        hint={`${stats.pending_submissions} to review`}
                    />
                </div>

                {/* EVENT TRACKERS */}
                <section className="space-y-5">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs font-bold uppercase tracking-[.2em] text-lime">
                                Live Progress
                            </p>
                            <h2 className="mt-1 font-display text-3xl font-black italic text-ink">
                                Event Trackers
                            </h2>
                        </div>
                        <Link
                            href="/admin/events"
                            className="inline-flex items-center gap-1 text-sm font-semibold text-[#5A6152] transition hover:text-lime-deep"
                        >
                            Manage events <ArrowRight size={15} />
                        </Link>
                    </div>

                    {eventTrackers.length === 0 ? (
                        <div className="rounded-3xl border border-dashed border-line bg-card py-16 text-center">
                            <Flag className="mx-auto mb-4 text-lime" size={38} />
                            <h3 className="text-lg font-bold">
                                No ongoing events
                            </h3>
                            <p className="mt-1 text-sm text-muted">
                                Published events that are open or in progress
                                will show their completion here.
                            </p>
                        </div>
                    ) : (
                        <div className="grid gap-6 lg:grid-cols-2">
                            {eventTrackers.map((event) => (
                                <TrackerCard key={event.id} event={event} />
                            ))}
                        </div>
                    )}
                </section>

                {/* DATA CARDS */}
                <div className="grid gap-6 xl:grid-cols-3">

                    {/* Registrations */}
                    <DataCard
                        title="Recent Registrations"
                        icon={ClipboardList}
                        href="/admin/registrations"
                        empty="No registrations yet."
                        rows={recentRegistrations.map((r) => ({
                            id: r.id,
                            primary: r.runner ?? 'Unknown runner',
                            secondary: `${r.event ?? '—'} · ${r.category ?? '—'}`,
                            status: r.status,
                        }))}
                    />

                    {/* Users */}
                    <DataCard
                        title="Recent Runners"
                        icon={Users}
                        href="/admin/users"
                        empty="No runners yet."
                        rows={recentUsers.map((u) => ({
                            id: u.id,
                            primary: u.name,
                            secondary: u.email,
                            status: u.status,
                        }))}
                    />

                    {/* Submissions */}
                    <DataCard
                        title="Recent Submissions"
                        icon={Upload}
                        href="/admin/run-submissions"
                        empty="No submissions yet."
                        rows={recentSubmissions.map((s) => ({
                            id: s.id,
                            primary: s.runner ?? 'Unknown runner',
                            secondary: `${s.distance.toFixed(2)} km`,
                            status: s.status,
                        }))}
                    />
                </div>
            </div>
        </>
    );
}

function StatCard({
    icon: Icon,
    title,
    value,
    hint,
}: {
    icon: React.ComponentType<{ size?: number }>;
    title: string;
    value: number;
    hint?: string;
}) {
    return (
        <div className="overflow-hidden rounded-[22px] border border-[#dfe4d6] bg-card p-6 shadow-sm">
            <div className="flex items-start justify-between">
                <div>
                    <div className="text-[11px] font-bold tracking-[.18em] uppercase text-[#92A084]">
                        {title}
                    </div>
                    <div className="mt-3 font-display text-5xl font-black italic text-ink">
                        {value}
                    </div>
                    {hint && (
                        <div className="mt-2 text-xs font-semibold text-[#92A084]">
                            {hint}
                        </div>
                    )}
                </div>
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-[#eef7d8] text-lime">
                    <Icon size={24} />
                </div>
            </div>
        </div>
    );
}

function TrackerCard({ event }: { event: EventTracker }) {
    return (
        <div className="rounded-3xl border border-[#dde3d5] bg-card p-7 shadow-sm">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <h3 className="font-display text-2xl font-black italic text-ink">
                        {event.name}
                    </h3>
                    <div className="mt-2 flex items-center gap-2 text-sm text-[#70766a]">
                        <MapPin size={15} />
                        {event.location}
                    </div>
                </div>
                <span className="shrink-0 rounded-full bg-[#EEF7D8] px-3 py-1 text-xs font-bold uppercase text-lime-deep">
                    {event.status}
                </span>
            </div>

            {/* progress */}
            <div className="mt-6">
                <div className="flex items-end justify-between">
                    <span className="text-sm font-semibold text-[#70766a]">
                        Goal completion
                    </span>
                    <span className="font-display text-4xl font-black italic text-ink">
                        {event.percentage}%
                    </span>
                </div>

                <div className="mt-3 h-4 w-full overflow-hidden rounded-full bg-[#EEF1E8]">
                    <div
                        className="h-full rounded-full bg-lime transition-all"
                        style={{ width: `${event.percentage}%` }}
                    />
                </div>

                <div className="mt-3 flex justify-between text-sm">
                    <span className="font-semibold text-ink">
                        {event.completed_km.toLocaleString()} km done
                    </span>
                    <span className="text-[#70766a]">
                        {event.remaining_km.toLocaleString()} km to goal
                    </span>
                </div>
            </div>

            {/* footer */}
            <div className="mt-6 grid grid-cols-3 gap-3 border-t border-line pt-5 text-center">
                <Metric label="Participants" value={event.participants} />
                <Metric label="Target km" value={event.target_km.toLocaleString()} />
                <Metric label="Ends" value={event.end_date ?? '—'} />
            </div>
        </div>
    );
}

function Metric({
    label,
    value,
}: {
    label: string;
    value: string | number;
}) {
    return (
        <div>
            <div className="font-display text-xl font-black italic text-ink">
                {value}
            </div>
            <div className="mt-1 text-[10px] font-bold uppercase tracking-[.15em] text-[#92A084]">
                {label}
            </div>
        </div>
    );
}

interface Row {
    id: number;
    primary: string;
    secondary: string;
    status: string;
}

function DataCard({
    title,
    icon: Icon,
    href,
    rows,
    empty,
}: {
    title: string;
    icon: React.ComponentType<{ size?: number }>;
    href: string;
    rows: Row[];
    empty: string;
}) {
    return (
        <div className="flex flex-col rounded-3xl border border-[#dde3d5] bg-card p-6 shadow-sm">
            <div className="mb-5 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#eef7d8] text-lime">
                    <Icon size={20} />
                </div>
                <h3 className="font-display text-xl font-bold italic text-ink">
                    {title}
                </h3>
            </div>

            <div className="flex-1 space-y-2">
                {rows.length === 0 ? (
                    <p className="py-8 text-center text-sm text-muted">
                        {empty}
                    </p>
                ) : (
                    rows.map((row) => (
                        <div
                            key={row.id}
                            className="flex items-center justify-between gap-3 rounded-xl border border-line px-3 py-2.5"
                        >
                            <div className="min-w-0">
                                <div className="truncate text-sm font-semibold text-ink">
                                    {row.primary}
                                </div>
                                <div className="truncate text-xs text-muted">
                                    {row.secondary}
                                </div>
                            </div>
                            <span
                                className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase ${statusPill(
                                    row.status,
                                )}`}
                            >
                                {row.status}
                            </span>
                        </div>
                    ))
                )}
            </div>

            <Link
                href={href}
                className="mt-5 inline-flex items-center justify-center gap-2 rounded-xl border border-line py-2.5 text-sm font-bold transition hover:border-lime hover:bg-[#f5f8ee]"
            >
                View all <ArrowRight size={15} />
            </Link>
        </div>
    );
}

Dashboard.layout = (page: React.ReactNode) => (
    <AppLayout active="admin-dashboard">{page}</AppLayout>
);
