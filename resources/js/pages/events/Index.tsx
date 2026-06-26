import { Head, router } from '@inertiajs/react';

import { cn } from '@/lib/utils';
import AppLayout from '@/layouts/app-layout';
import EventCard from '@/components/EventCard';
import SectionHeader from '@/components/SectionHeader';
import Pagination, { type PaginationLink } from '@/components/Pagination';
import { Calendar, History } from 'lucide-react';

interface EventItem {
    id: number | string;
    name: string;
    location: string;
    dates: string;
    status: string;
    joined_count: string | number;
    categories: string[];
    banner?: string;
}

interface JoinedEvent {
    id: number;
    event_name: string;
    category_name: string;
    target_km: number;
    completed_km: number;
    bib_number: string;
    status: 'pending' | 'approved' | 'rejected' | 'completed' | string;
    joined_at: string;
}

interface Paginated<T> {
    data: T[];
    links: PaginationLink[];
    from?: number | null;
    to?: number | null;
    total?: number;
}

interface EventsIndexProps {
    events: EventItem[];
    joinedEvents: Paginated<JoinedEvent>;
    filter: string;
}

const FILTERS: { key: string; label: string }[] = [
    { key: 'active', label: 'Active' },
    { key: 'open', label: 'Open' },
    { key: 'upcoming', label: 'Upcoming' },
    { key: 'past', label: 'Past' },
    { key: 'all', label: 'All' },
];

const joinStatusPill = (status: string) => {
    switch (status) {
        case 'approved':
        case 'completed':
            return 'bg-[#eef7d8] text-[#5f8c00]';
        case 'pending':
            return 'bg-[#fff3d6] text-[#b07d00]';
        case 'rejected':
            return 'bg-[#fde4e1] text-[#c0392b]';
        default:
            return 'bg-[#E4E8DD] text-[#5A6152]';
    }
};

export default function EventsIndex({
    events,
    joinedEvents,
    filter,
}: EventsIndexProps) {
    const setFilter = (key: string) => {
        router.get(
            '/events',
            key === 'active' ? {} : { filter: key },
            { preserveScroll: true, preserveState: true },
        );
    };

    return (
        <div>
            <Head title="Events" />

            <div className="animate-[floatup_.4s_ease_both]">
                <div className="mb-6 flex flex-wrap items-end justify-between gap-3.5">
                    <div>
                        <div className="mb-1.5 text-[11px] font-bold tracking-[.28em] text-lime-deep uppercase">
                            Browse · Join
                        </div>
                        <h1 className="m-0 font-display text-[clamp(30px,4.4vw,44px)] leading-[.92] font-extrabold uppercase italic">
                            Events
                        </h1>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {FILTERS.map((f) => {
                            const on = f.key === filter;
                            return (
                                <button
                                    key={f.key}
                                    type="button"
                                    onClick={() => setFilter(f.key)}
                                    className={cn(
                                        'rounded-full border px-4 py-2 text-[13px] font-semibold transition-colors',
                                        on
                                            ? 'border-ink-900 bg-ink-900 text-lime'
                                            : 'border-line-2 bg-card text-[#5A6152] hover:border-lime',
                                    )}
                                >
                                    {f.label}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {events.length === 0 ? (
                    <div className="rounded-[20px] border border-dashed border-line bg-card py-16 text-center">
                        <Calendar className="mx-auto mb-3 text-lime" size={36} />
                        <p className="font-semibold text-ink">
                            No events to show here
                        </p>
                        <p className="mt-1 text-sm text-muted">
                            Try a different filter.
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-[repeat(auto-fit,minmax(340px,1fr))] gap-[22px]">
                        {events.map((ev) => (
                            <EventCard key={ev.id} event={ev} />
                        ))}
                    </div>
                )}

                {/* JOINED HISTORY */}
                {joinedEvents.data.length > 0 && (
                    <div className="mt-12">
                        <SectionHeader
                            title="My Joined Events"
                            aside={
                                <span className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-muted">
                                    <History size={15} />
                                    {joinedEvents.total ?? joinedEvents.data.length}{' '}
                                    total
                                </span>
                            }
                        />
                        <div className="overflow-hidden rounded-[20px] border border-line bg-card">
                            {joinedEvents.data.map((j) => {
                                const pct = j.target_km
                                    ? Math.min(
                                          100,
                                          Math.round(
                                              (j.completed_km / j.target_km) *
                                                  100,
                                          ),
                                      )
                                    : 0;
                                return (
                                    <div
                                        key={j.id}
                                        className="flex flex-wrap items-center gap-4 border-b border-[#F0F2EA] px-5 py-4 last:border-b-0"
                                    >
                                        <div className="min-w-[180px] flex-1">
                                            <div className="text-[15px] font-bold text-ink">
                                                {j.event_name}
                                            </div>
                                            <div className="text-[12.5px] text-muted">
                                                {j.category_name} · Bib{' '}
                                                {j.bib_number} · Joined{' '}
                                                {j.joined_at}
                                            </div>
                                        </div>

                                        <div className="min-w-[140px]">
                                            <div className="mb-1 flex justify-between text-[11px] font-semibold text-muted">
                                                <span>
                                                    {j.completed_km}/
                                                    {j.target_km} KM
                                                </span>
                                                <span>{pct}%</span>
                                            </div>
                                            <div className="h-2 w-full overflow-hidden rounded-full bg-[#EEF1E8]">
                                                <div
                                                    className="h-full rounded-full bg-lime"
                                                    style={{
                                                        width: `${pct}%`,
                                                    }}
                                                />
                                            </div>
                                        </div>

                                        <span
                                            className={`rounded-full px-2.5 py-[5px] text-[11px] font-extrabold uppercase tracking-[.05em] ${joinStatusPill(
                                                j.status,
                                            )}`}
                                        >
                                            {j.status}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>

                        <Pagination paginator={joinedEvents} />
                    </div>
                )}
            </div>
        </div>
    );
}

EventsIndex.layout = (page: React.ReactNode) => (
    <AppLayout active="events">{page}</AppLayout>
);
