import { Head, useForm } from '@inertiajs/react';

import AppLayout from '@/layouts/app-layout';
import { MapPin, Calendar, Check } from '@/lib/icons';
import EventCardLarge from '@/components/EventCardLarge';

interface Category {
    id: number;
    name: string;
    target_km: number;
    ranking_enabled: boolean;
    is_registered: boolean;
}

interface Event {
    id: number;
    name: string;
    description: string;
    banner?: string | null;
    location: string;
    dates: string;
    status: string;
    categories: Category[];
}

interface Props {
    event: Event;
}

export default function Show({ event }: Props) {
    const { data, setData, post, processing } = useForm({
        event_category_id: 0,
    });

    const join = (categoryId: number) => {
        setData('event_category_id', categoryId);

        post(`/events/${event.id}/join`);
    };

    return (
        <div>
            <Head title={event.name} />

            <div className="animate-[floatup_.4s_ease_both]">
                {/* Hero */}

                {/* <section
                    className="overflow-hidden rounded-[24px] border border-line"
                    style={{
                        background:
                            event.banner ??
                            'linear-gradient(135deg,#1a2412,#0c0f0b)',
                    }}
                >
                    <div className="bg-black/45 px-10 py-12">
                        <div className="mb-3 inline-flex rounded-full bg-lime px-3 py-1 text-xs font-bold text-ink uppercase">
                            {event.status}
                        </div>

                        <h1 className="font-display text-5xl font-extrabold text-white uppercase italic">
                            {event.name}
                        </h1>

                        <div className="mt-5 flex flex-wrap gap-6 text-sm text-white/80">
                            <span className="flex items-center gap-2">
                                <MapPin size={16} />
                                {event.location}
                            </span>

                            <span className="flex items-center gap-2">
                                <Calendar size={16} />
                                {event.dates}
                            </span>
                        </div>
                    </div>
                </section> */}

                <EventCardLarge
                    id={event.id}
                    name={event.name}
                    location={event.location}
                    dates={event.dates}
                    status={event.status}
                    description={event.description}
                />

                {/* Categories */}

                <section className="mt-8">
                    <h2 className="mb-5 font-display text-3xl font-extrabold uppercase italic">
                        Choose Your Category
                    </h2>

                    <div className="grid gap-5 md:grid-cols-2">
                        {event.categories.map((category) => (
                            <div
                                key={category.id}
                                className="rounded-[20px] border border-line bg-card p-6"
                            >
                                <div className="flex items-start justify-between">
                                    <div>
                                        <h3 className="font-display text-3xl font-bold italic">
                                            {category.name}
                                        </h3>

                                        <p className="mt-2 text-sm text-muted-2">
                                            Complete {category.target_km} KM
                                        </p>
                                    </div>

                                    {category.ranking_enabled && (
                                        <span className="rounded-full bg-lime px-3 py-1 text-xs font-bold text-ink uppercase">
                                            Ranked
                                        </span>
                                    )}
                                </div>

                                <div className="mt-8">
                                    {category.is_registered ? (
                                        <button
                                            disabled
                                            className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#e9f7cf] px-5 py-3 font-bold text-lime-deep"
                                        >
                                            <Check size={18} />
                                            Already Joined
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => join(category.id)}
                                            disabled={processing}
                                            className="w-full cursor-pointer rounded-xl bg-ink px-5 py-3 font-bold text-lime transition hover:bg-lime hover:text-ink"
                                        >
                                            Join Category
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            </div>
        </div>
    );
}
