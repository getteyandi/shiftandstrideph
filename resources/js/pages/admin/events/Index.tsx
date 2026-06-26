import { Head, Link, router } from '@inertiajs/react';
import {
    Calendar,
    Plus,
    Play,
    Clock3,
    CheckCircle2,
} from 'lucide-react';

import SectionHeader from '@/components/SectionHeader';
import EventCard from '@/components/admin/EventCard';
import AppLayout from '@/layouts/app-layout';
import DraftEventsSection from '@/components/admin/DraftEventsSection';

interface Event {
    id: number;
    name: string;
    slug: string;
    description: string;
    banner: string | null;
    location: string;
    registration_start: string;
    registration_end: string;
    start_date: string;
    end_date: string;
    status: 'open' | 'upcoming' | 'closed' | 'completed';
    categories?: {
        id: number;
        target_km: number;
    }[];
}
interface DraftEvent {
    id: number;
    name: string;
    banner: string | null;
    location: string;
    updated_at: string;
    status: string;
}
interface Props {
    events: {
        data: Event[];
    };

    draftEvents: DraftEvent[];
    filter: string;
}

const FILTERS: { key: string; label: string }[] = [
    { key: 'active', label: 'Active' },
    { key: 'open', label: 'Open' },
    { key: 'upcoming', label: 'Upcoming' },
    { key: 'past', label: 'Past' },
    { key: 'all', label: 'All' },
];

export default function Index({ events, draftEvents, filter }: Props) {
    const total = events.data.length;

    const open = events.data.filter(
        (e) => e.status === 'open',
    ).length;

    const upcoming = events.data.filter(
        (e) => e.status === 'upcoming',
    ).length;

    const completed = events.data.filter(
        (e) => e.status === 'completed' || e.status === 'closed',
    ).length;

    const setFilter = (key: string) => {
        router.get(
            '/admin/events',
            key === 'active' ? {} : { filter: key },
            { preserveScroll: true, preserveState: true },
        );
    };

    return (
        <>
            <Head title="Manage Events" />

            <div className="space-y-8">

                {/* HERO */}

                <div className="relative overflow-hidden rounded-[24px] border border-[#2a3120] bg-[linear-gradient(145deg,#12150d,#0b0d09)] p-8">

                    <div className="absolute right-0 top-0 h-80 w-80 rounded-full bg-lime/10 blur-3xl" />

                    <div className="relative flex flex-col justify-between gap-6 lg:flex-row lg:items-center">

                        <div>

                            <p className="mb-2 text-xs font-bold tracking-[.28em] uppercase text-lime">
                                Administration
                            </p>

                            <h1 className="font-display text-5xl font-black italic text-white">
                                EVENTS
                            </h1>

                            <p className="mt-3 max-w-xl text-sm text-[#98A08E]">
                                Create, update and manage all virtual
                                running events.
                            </p>

                        </div>

                        <Link
                            href="/admin/events/create"
                            className="inline-flex items-center gap-2 rounded-xl bg-lime px-5 py-3 font-bold text-[#12150d] transition hover:brightness-95"
                        >
                            <Plus size={18} />
                            Create Event
                        </Link>

                    </div>

                </div>

                {/* STATS */}

                <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">

                    <StatCard
                        icon={Calendar}
                        title="Total Events"
                        value={total}
                    />

                    <StatCard
                        icon={Play}
                        title="Open"
                        value={open}
                    />

                    <StatCard
                        icon={Clock3}
                        title="Upcoming"
                        value={upcoming}
                    />

                    <StatCard
                        icon={CheckCircle2}
                        title="Completed"
                        value={completed}
                    />
                    

                </div>

                    <DraftEventsSection draftEvents={draftEvents} />
                {/* FILTERS */}

                <div className="flex flex-wrap gap-3">
                    {FILTERS.map((f) => {
                        const on = f.key === filter;
                        return (
                            <button
                                key={f.key}
                                type="button"
                                onClick={() => setFilter(f.key)}
                                className={
                                    on
                                        ? 'rounded-full bg-black px-5 py-2 font-semibold text-lime'
                                        : 'rounded-full border border-line bg-card px-5 py-2 font-semibold text-muted transition hover:border-lime hover:text-lime'
                                }
                            >
                                {f.label}
                            </button>
                        );
                    })}
                </div>

                <SectionHeader
                    title={
                        FILTERS.find((f) => f.key === filter)?.label ?? 'All'
                    }
                    aside={
                        <span className="text-sm font-semibold text-muted">
                            {total} events
                        </span>
                    }
                />

                {/* GRID */}

                <div className="grid grid-cols-[repeat(auto-fit,minmax(390px,1fr))] gap-6">

                    {events.data.map((event) => (

                        <EventCard
                            key={event.id}
                            event={event}
                        />

                    ))}

                </div>

            </div>
        </>
    );
}

function StatCard({
    icon: Icon,
    title,
    value,
}: any) {
    return (
        <div className="overflow-hidden rounded-[22px] border border-[#dfe4d6] bg-card p-6 shadow-sm">

            <div className="flex items-center justify-between">

                <div>

                    <div className="text-[11px] font-bold tracking-[.18em] uppercase text-[#92A084]">
                        {title}
                    </div>

                    <div className="mt-3 font-display text-5xl font-black italic text-ink">
                        {value}
                    </div>

                </div>

                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-[#eef7d8] text-lime">
                    <Icon size={24} />
                </div>

            </div>

        </div>
        
    );
}

Index.layout = (page: React.ReactNode) => (
    <AppLayout>{page}</AppLayout>
);