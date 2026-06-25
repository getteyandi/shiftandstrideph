import { Head } from '@inertiajs/react';
import { useState } from 'react';

import { cn } from '@/lib/utils';
import AppLayout from '@/layouts/app-layout';
import EventCard from '@/components/EventCard';

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

interface EventsIndexProps {
    events: EventItem[];
    /** Optional filter labels; defaults below if not provided by the controller. */
    filters?: string[];
}

const DEFAULT_FILTERS = ['All', 'Open', 'Marathon', 'Ultra'];

export default function EventsIndex({ events, filters }: EventsIndexProps) {
    const pills = filters ?? DEFAULT_FILTERS;
    const [active, setActive] = useState(pills[0]);

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
                            Upcoming Events
                        </h1>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {pills.map((f) => {
                            const on = f === active;
                            return (
                                <button
                                    key={f}
                                    type="button"
                                    onClick={() => setActive(f)}
                                    className={cn(
                                        'rounded-full border px-4 py-2 text-[13px] font-semibold transition-colors',
                                        on
                                            ? 'border-ink-900 bg-ink-900 text-lime'
                                            : 'border-line-2 bg-card text-[#5A6152] hover:border-lime',
                                    )}
                                >
                                    {f}
                                </button>
                            );
                        })}
                    </div>
                </div>

                <div className="grid grid-cols-[repeat(auto-fit,minmax(340px,1fr))] gap-[22px]">
                    {events.map((ev) => (
                        <EventCard key={ev.id} event={ev} />
                    ))}
                </div>
            </div>
        </div>
    );
}
