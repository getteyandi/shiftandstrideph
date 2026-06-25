import EventCard from '@/components/EventCard';
import AppLayout from '@/layouts/app-layout';
import { Head, router, useForm } from '@inertiajs/react';
import { useState } from 'react';

export default function Index({
    events,
    filters = ['All', 'Open', 'Marathon', 'Ultra'],
}: any) {
    const [active, setActive] = useState(filters[0]);

    const { post, setData, errors } = useForm({
        event_category_id: '',
    });

    const join = (categoryId: number) => {
        setData('event_category_id', categoryId.toString());

        post('/registrations');
    };

    return (
        <>
            <Head title="Events" />
            <div className="animate-floatup">
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
                        {filters.map((f) => {
                            const on = active === f;
                            return (
                                <button
                                    key={f}
                                    type="button"
                                    onClick={() => setActive(f)}
                                    className={`rounded-full border px-4 py-2 text-[13px] font-semibold transition-colors ${
                                        on
                                            ? 'border-ink-900 bg-ink-900 text-lime'
                                            : 'border-[#DDE1D5] bg-white text-[#5A6152] hover:border-lime'
                                    }`}
                                >
                                    {f}
                                </button>
                            );
                        })}
                    </div>
                </div>

                <div className="grid grid-cols-[repeat(auto-fit,minmax(340px,1fr))] gap-[22px]">
                    {events.map((event, i) => (
                        <EventCard key={event.id} event={event} onJoin={join} />
                    ))}
                </div>
            </div>
        </>
    );
}
