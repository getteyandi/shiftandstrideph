import { Head, Link, router } from '@inertiajs/react';

import { cn } from '@/lib/utils';
import AppLayout from '@/layouts/app-layout';
import SectionHeader from '@/components/SectionHeader';
import Pagination, { type PaginationLink } from '@/components/Pagination';
import ActiveEventCard from '@/components/ActiveEventCard';
import {
    Calendar,
    History,
    MapPin,
    ArrowRight,
    Star,
} from 'lucide-react';

interface EventItem {
    id: number | string;
    name: string;
    location: string;
    description?: string;
    dates: string;
    status: string;
    joined_count: string | number;
    categories: string[];
    banner?: string | null;
    is_highlighted?: boolean;
    preset?: 'solo' | 'community' | 'group';
}

const PRESET_LABEL: Record<string, string> = {
    solo: 'Solo Run',
    community: 'Community Run',
    group: 'Group Run',
};

function PresetTag({
    preset,
    dark = false,
}: {
    preset?: string;
    dark?: boolean;
}) {
    if (!preset) return null;
    return (
        <span
            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
                dark
                    ? 'bg-white/15 text-white'
                    : 'bg-[#eef7d8] text-[#5f8c00]'
            }`}
        >
            {PRESET_LABEL[preset] ?? preset}
        </span>
    );
}

interface JoinedEvent {
    id: number;
    event_id?: number;
    event_name: string;
    banner?: string | null;
    is_highlighted?: boolean;
    preset?: 'solo' | 'community' | 'group';
    category_name: string;
    bib_number: string;
    distance_done: number;
    target_km: number;
    activity_count: number;
    last_activity_at: string;
    ranking_enabled: boolean;
    rank?: number | null;
    status: string;
    joined_at: string;
}

interface Paginated<T> {
    data: T[];
    links: PaginationLink[];
    from?: number | null;
    to?: number | null;
    total?: number;
}

interface Props {
    highlighted: EventItem[];
    events: Paginated<EventItem>;
    joinedEvents: Paginated<JoinedEvent>;
    filter: string;
}

const FILTERS = [
    { key: 'active', label: 'Active' },
    { key: 'open', label: 'Open' },
    { key: 'upcoming', label: 'Upcoming' },
    { key: 'past', label: 'Past' },
    { key: 'all', label: 'All' },
];

const isHistory = (status: string) =>
    ['closed', 'completed'].includes(status.toLowerCase());

export default function EventsIndex({
    highlighted,
    events,
    joinedEvents,
    filter,
}: Props) {
    const setFilter = (key: string) =>
        router.get(
            '/events',
            key === 'active' ? {} : { filter: key },
            { preserveScroll: true, preserveState: true },
        );

    return (
        <div>
            <Head title="Events" />

            <div className="animate-[floatup_.4s_ease_both] space-y-7">
                <div className="flex flex-wrap items-end justify-between gap-3.5">
                    <div>
                        <div className="mb-1.5 text-[11px] font-bold uppercase tracking-[.28em] text-lime-deep">
                            Browse · Join
                        </div>
                        <h1 className="m-0 font-display text-[clamp(30px,4.4vw,44px)] font-extrabold uppercase italic leading-[.92] text-ink">
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
                                            : 'border-line-2 bg-card text-muted-2 hover:border-lime',
                                    )}
                                >
                                    {f.label}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* FEATURED / HIGHLIGHTED EVENTS */}
                {highlighted.length > 0 && (
                    <div className="space-y-5">
                        {highlighted.map((ev) => (
                            <FeaturedEvent key={ev.id} event={ev} />
                        ))}
                    </div>
                )}

                {/* OTHER EVENTS — one row per event (desktop), swipe (mobile) */}
                {events.data.length === 0 ? (
                    highlighted.length === 0 && (
                        <div className="rounded-[20px] border border-dashed border-line bg-card py-16 text-center">
                            <Calendar
                                className="mx-auto mb-3 text-lime"
                                size={36}
                            />
                            <p className="font-semibold text-ink">
                                No events to show here
                            </p>
                            <p className="mt-1 text-sm text-muted">
                                Try a different filter.
                            </p>
                        </div>
                    )
                ) : (
                    <div>
                        <SectionHeader title="All Events" />
                        <div className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2 md:flex-col md:gap-4 md:overflow-visible md:pb-0">
                            {events.data.map((ev) => (
                                <EventRow key={ev.id} event={ev} />
                            ))}
                        </div>
                        <Pagination paginator={events} />
                    </div>
                )}

                {/* JOINED HISTORY */}
                {joinedEvents.data.length > 0 && (
                    <div className="mt-6">
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
                        <div className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2 md:grid md:grid-cols-2 md:gap-[18px] md:overflow-visible md:pb-0 xl:grid-cols-3">
                            {joinedEvents.data.map((j) => (
                                <ActiveEventCard key={j.id} registration={j} />
                            ))}
                        </div>
                        <Pagination paginator={joinedEvents} />
                    </div>
                )}
            </div>
        </div>
    );
}

/* The big featured (admin-highlighted) event. */
function FeaturedEvent({ event }: { event: EventItem }) {
    const history = isHistory(event.status);
    return (
        <Link
            href={`/events/${event.id}/board`}
            className="group relative block overflow-hidden rounded-[24px] border border-[#2a3120] bg-[linear-gradient(145deg,#12150d,#090b08)]"
        >
            {event.banner && (
                <img
                    src={`/storage/${event.banner}`}
                    alt={event.name}
                    className="absolute inset-0 h-full w-full object-cover opacity-40 transition group-hover:opacity-50"
                />
            )}
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(9,11,8,.35),rgba(9,11,8,.9))]" />

            <div className="relative flex min-h-[260px] flex-col justify-end p-7 md:p-9">
                <div className="absolute left-7 top-7 flex flex-wrap gap-2 md:left-9 md:top-9">
                    <span className="inline-flex items-center gap-1 rounded-full bg-lime px-3 py-1 text-[11px] font-extrabold uppercase text-[#12150d]">
                        <Star size={12} className="fill-[#12150d]" />
                        Highlighted
                    </span>
                    <span className="inline-flex rounded-full bg-white/15 px-3 py-1 text-[11px] font-bold uppercase text-white">
                        {event.status}
                    </span>
                    <PresetTag preset={event.preset} dark />
                </div>

                <h2 className="font-display text-[clamp(28px,4vw,46px)] font-black italic uppercase leading-[.95] text-white">
                    {event.name}
                </h2>
                <div className="mt-2 flex flex-wrap items-center gap-x-5 gap-y-1 text-sm text-[#cdd3c3]">
                    <span className="inline-flex items-center gap-1.5">
                        <MapPin size={15} />
                        {event.location}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                        <Calendar size={15} />
                        {event.dates}
                    </span>
                    <span>{event.joined_count} runners joined</span>
                </div>

                <div className="mt-5 flex flex-wrap items-center gap-3">
                    {event.categories.slice(0, 5).map((c) => (
                        <span
                            key={c}
                            className="rounded-lg border border-white/20 bg-white/5 px-3 py-1 font-display text-sm font-bold italic text-white"
                        >
                            {c}
                        </span>
                    ))}
                </div>

                <span className="mt-6 inline-flex w-fit items-center gap-2 rounded-xl bg-lime px-6 py-3 font-bold text-[#12150d] transition group-hover:brightness-95">
                    View Live Board
                    <ArrowRight size={17} />
                </span>
            </div>
        </Link>
    );
}

/* Full-width row (desktop) / swipe card (mobile). */
function EventRow({ event }: { event: EventItem }) {
    const history = isHistory(event.status);
    return (
        <Link
            href={`/events/${event.id}`}
            className="group flex w-[88%] shrink-0 snap-center flex-col overflow-hidden rounded-[20px] border border-line bg-card transition hover:border-lime hover:shadow-md sm:w-[60%] md:w-full md:flex-row"
        >
            <div className="relative h-40 w-full shrink-0 overflow-hidden bg-[linear-gradient(135deg,#1a2412,#0c0f0b)] md:h-auto md:w-72">
                {event.banner && (
                    <img
                        src={`/storage/${event.banner}`}
                        alt={event.name}
                        className="h-full w-full object-cover"
                    />
                )}
                <span
                    className={cn(
                        'absolute left-3 top-3 rounded-full px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wide',
                        history
                            ? 'bg-black/60 text-white'
                            : event.status.toLowerCase() === 'open'
                              ? 'bg-lime text-ink-900'
                              : 'bg-white/20 text-white',
                    )}
                >
                    {history
                        ? event.status.toLowerCase() === 'completed'
                            ? 'Ended'
                            : 'Closed'
                        : event.status}
                </span>
            </div>

            <div className="flex flex-1 flex-col justify-between gap-3 p-5">
                <div>
                    <div className="mb-1 flex items-center gap-2">
                        <PresetTag preset={event.preset} />
                    </div>
                    <h3 className="font-display text-2xl font-black italic uppercase leading-tight text-ink">
                        {event.name}
                    </h3>
                    <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-[12.5px] text-muted-2">
                        <span className="inline-flex items-center gap-1.5">
                            <MapPin size={13} />
                            {event.location}
                        </span>
                        <span>{event.dates}</span>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-1.5">
                        {event.categories.slice(0, 5).map((c) => (
                            <span
                                key={c}
                                className="rounded-md border border-[#e1e6d6] bg-[#f7f9f1] px-2.5 py-0.5 font-display text-[13px] font-bold italic text-[#3A4034]"
                            >
                                {c}
                            </span>
                        ))}
                    </div>
                </div>

                <div className="flex items-center justify-between">
                    <span className="text-[13px] font-semibold text-muted-2">
                        {event.joined_count} runners joined
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-xl bg-ink px-4 py-2 text-sm font-bold text-lime transition group-hover:bg-lime group-hover:text-ink">
                        {history ? 'View' : 'Join'}
                        <ArrowRight size={15} />
                    </span>
                </div>
            </div>
        </Link>
    );
}

EventsIndex.layout = (page: React.ReactNode) => (
    <AppLayout active="events">{page}</AppLayout>
);
