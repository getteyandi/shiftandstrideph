import { Link, router } from '@inertiajs/react';
import { useState } from 'react';
import {
    CalendarDays,
    MapPin,
    Pencil,
    Trash2,
    Eye,
    Lock,
    Star,
} from 'lucide-react';
import ConfirmDialog from '@/components/ConfirmDialog';

interface Category {
    id: number;
    target_km: number;
}

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
    status: string;
    is_highlighted?: boolean;
    preset?: 'solo' | 'community' | 'group';
    categories?: Category[];
}

const PRESET_LABEL: Record<string, string> = {
    solo: 'Solo Run',
    community: 'Community Run',
    group: 'Group Run',
};

interface Props {
    event: Event;
}

export default function EventCard({ event }: Props) {
    const [confirmOpen, setConfirmOpen] = useState(false);

    // Closed/completed events are read-only history.
    const isHistory =
        event.status === 'closed' || event.status === 'completed';

    const handleDelete = () => {
        router.delete(`/admin/events/${event.id}`, {
            preserveScroll: true,
            onFinish: () => setConfirmOpen(false),
        });
    };

    const toggleHighlight = () =>
        router.post(
            `/admin/events/${event.id}/highlight`,
            {},
            { preserveScroll: true },
        );

    const statusColor = () => {
        switch (event.status) {
            case 'open':
                return 'bg-lime text-black';

            case 'upcoming':
                return 'bg-[#45493c] text-white';

            case 'closed':
                return 'bg-[#8a6d1f] text-white';

            case 'completed':
                return 'bg-[#1f1f1f] text-white';

            default:
                return 'bg-gray-300';
        }
    };

    return (
        <div className="overflow-hidden rounded-[24px] border border-[#dde3d5] bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl">

            {/* HEADER */}

            <div className="relative h-44 overflow-hidden bg-[linear-gradient(145deg,#12150d,#090b08)]">

                {event.banner && (
                    <img
                        src={`/storage/${event.banner}`}
                        alt={event.name}
                        className="absolute inset-0 h-full w-full object-cover"
                    />
                )}

                {/* Dark gradient overlay keeps the title legible over any banner */}
                <div
                    className="absolute inset-0"
                    style={{
                        background: event.banner
                            ? 'linear-gradient(180deg,rgba(9,11,8,.25) 0%,rgba(9,11,8,.85) 100%)'
                            : 'transparent',
                    }}
                />

                <div
                    className="absolute inset-0 opacity-20"
                    style={{
                        background:
                            'radial-gradient(circle at top right,#A6E212 0%,transparent 60%)',
                    }}
                />

                <svg
                    className="absolute inset-0 h-full w-full"
                    viewBox="0 0 600 180"
                    preserveAspectRatio="none"
                >
                    <path
                        d="M0,150 C180,60 350,40 600,90"
                        stroke="#A6E212"
                        strokeWidth="2"
                        strokeDasharray="4 10"
                        fill="none"
                        opacity=".55"
                    />
                </svg>

                <div className="relative flex h-full flex-col justify-between p-6">

                    <div className="flex items-center gap-2">

                        <span
                            className={`inline-flex rounded-full px-4 py-1 text-xs font-bold uppercase ${statusColor()}`}
                        >
                            {event.status}
                        </span>

                        {event.is_highlighted && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-lime px-3 py-1 text-xs font-bold uppercase text-[#12150d]">
                                <Star size={12} className="fill-[#12150d]" />
                                Highlighted
                            </span>
                        )}

                        {event.preset && (
                            <span className="inline-flex rounded-full bg-white/15 px-3 py-1 text-xs font-bold uppercase text-white">
                                {PRESET_LABEL[event.preset] ?? event.preset}
                            </span>
                        )}

                    </div>

                    <div>

                        <h2 className="font-display text-3xl font-black italic leading-tight text-white">
                            {event.name}
                        </h2>

                    </div>

                </div>

            </div>

            {/* BODY */}

            <div className="space-y-5 p-6">

                <div className="flex items-center gap-2 text-sm text-[#70766a]">
                    <MapPin size={16} />
                    {event.location}
                </div>

                <div className="flex items-center gap-2 text-sm text-[#70766a]">
                    <CalendarDays size={16} />

                    {new Date(event.start_date).toLocaleDateString()} -
                    {' '}
                    {new Date(event.end_date).toLocaleDateString()}
                </div>

                <div>

                    <p className="mb-2 text-[11px] font-bold tracking-[.2em] uppercase text-[#93a082]">
                        Registration
                    </p>

                    <p className="font-semibold text-[#363d33]">
                        {new Date(
                            event.registration_start,
                        ).toLocaleDateString()}

                        {' '}—{' '}

                        {new Date(
                            event.registration_end,
                        ).toLocaleDateString()}
                    </p>

                </div>

                {event.categories && (

                    <div>

                        <p className="mb-3 text-[11px] font-bold tracking-[.2em] uppercase text-[#93a082]">
                            Categories
                        </p>

                        <div className="flex flex-wrap gap-2">

                            {event.categories.map((category) => (

                                <span
                                    key={category.id}
                                    className="rounded-lg border border-[#dfe4d6] bg-[#f8faf5] px-3 py-1 text-sm font-bold italic"
                                >
                                    {category.target_km} KM
                                </span>

                            ))}

                        </div>

                    </div>

                )}

                {isHistory ? (
                    <div className="flex items-center justify-between gap-2 rounded-xl border border-[#e6e0cd] bg-[#faf6e9] px-4 py-3 text-sm font-semibold text-[#8a6d1f]">
                        <span className="inline-flex items-center gap-2">
                            <Lock size={16} />
                            {event.status === 'completed'
                                ? 'Event ended — view only'
                                : 'Registration closed — view only'}
                        </span>
                        <Link
                            href={`/admin/events/${event.id}`}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-[#d9ded2] bg-white px-3 py-1.5 text-[#5A6152] transition hover:border-lime"
                        >
                            <Eye size={15} />
                            View
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-2 pt-2">
                        <button
                            type="button"
                            onClick={toggleHighlight}
                            className={`flex w-full items-center justify-center gap-2 rounded-xl border py-2.5 text-sm font-bold transition ${
                                event.is_highlighted
                                    ? 'border-lime bg-[#F7FCEB] text-lime-deep'
                                    : 'border-[#d9ded2] text-[#5A6152] hover:border-lime'
                            }`}
                        >
                            <Star
                                size={16}
                                className={
                                    event.is_highlighted
                                        ? 'fill-lime text-lime-deep'
                                        : ''
                                }
                            />
                            {event.is_highlighted
                                ? 'Highlighted Event'
                                : 'Set as Highlighted'}
                        </button>

                        <div className="flex gap-2">
                            <Link
                                href={`/admin/events/${event.id}/setup`}
                                className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-[#d9ded2] py-3 font-semibold transition hover:border-lime hover:bg-[#f5f8ee]"
                            >
                                <Eye size={17} />
                                Manage
                            </Link>

                            <Link
                                href={`/admin/events/${event.id}/edit`}
                                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-lime py-3 font-bold text-black transition hover:brightness-95"
                            >
                                <Pencil size={17} />
                                Edit
                            </Link>

                            <button
                                type="button"
                                onClick={() => setConfirmOpen(true)}
                                className="flex items-center justify-center rounded-xl border border-red-300 px-4 transition hover:bg-red-50"
                            >
                                <Trash2 size={18} className="text-red-500" />
                            </button>
                        </div>
                    </div>
                )}

                <Link
                    href={`/events/${event.id}/board`}
                    className="flex items-center justify-center gap-2 rounded-xl border border-[#d9ded2] py-2.5 text-sm font-semibold text-[#5A6152] transition hover:border-lime hover:text-lime-deep"
                >
                    <Eye size={15} />
                    Live Board
                </Link>

            </div>

            <ConfirmDialog
                open={confirmOpen}
                onOpenChange={setConfirmOpen}
                destructive
                title="Delete event?"
                description={`"${event.name}" and its categories will be permanently removed. This cannot be undone.`}
                confirmLabel="Delete"
                onConfirm={handleDelete}
            />

        </div>
    );
}