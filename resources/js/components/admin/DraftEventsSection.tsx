import { Link, router } from '@inertiajs/react';
import { useState } from 'react';
import {
    CalendarDays,
    FileEdit,
    Trash2,
    ChevronRight,
    Rocket,
} from 'lucide-react';
import { route } from 'ziggy-js';
import ConfirmDialog from '@/components/ConfirmDialog';

interface DraftEvent {
    id: number;
    name: string;
    banner: string | null;
    location: string;
    updated_at: string;
    status: string;
}

interface Props {
    draftEvents: DraftEvent[];
}

export default function DraftEventsSection({
    draftEvents,
}: Props) {
    const [deleteTarget, setDeleteTarget] = useState<DraftEvent | null>(null);

    const publish = (id: number) => {
        router.post(
            `/admin/events/${id}/publish`,
            {},
            { preserveScroll: true },
        );
    };

    const confirmDelete = () => {
        if (!deleteTarget) return;
        router.delete(`/admin/events/${deleteTarget.id}`, {
            preserveScroll: true,
            onFinish: () => setDeleteTarget(null),
        });
    };

    return (
        <section className="space-y-6">

            <div className="flex w-full items-center justify-between rounded-3xl border border-line bg-card p-6">

                <div>

                    <div className="text-xs font-bold uppercase tracking-[.2em] text-lime">
                        Continue Working
                    </div>

                    <h2 className="mt-2 font-display text-4xl font-black italic text-ink">
                        Draft Events
                    </h2>

                    <p className="mt-2 text-muted">
                        Events that haven't been published yet.
                    </p>

                </div>

                <div className="flex items-center gap-3">

                <div className="rounded-full bg-[#EEF7D8] px-5 py-3 text-center">
                    <div className="text-2xl font-black text-lime">
                        {draftEvents.length}
                    </div>

                    <div className="text-[11px] font-bold uppercase tracking-[.15em] text-[#7F8C72]">
                        Drafts
                    </div>
                </div>

            </div>

            </div>

            {draftEvents.length === 0 && (
                <div className="rounded-3xl border border-dashed border-line bg-card py-20 text-center">

                    <CalendarDays
                        className="mx-auto mb-5 text-[#A6E212]"
                        size={42}
                    />

                    <h3 className="text-xl font-bold">
                        No Draft Events
                    </h3>

                    <p className="mt-2 text-muted">
                        Your newly created events will appear here.
                    </p>

                </div>
            )}

            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">

                {draftEvents.map((event) => (

                    <div
                        key={event.id}
                        className="overflow-hidden rounded-3xl border border-line bg-card shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                    >

                        <div className="h-3 bg-lime" />

                        <div className="p-6">

                            <div className="mb-4 flex items-center justify-between">

                                <span className="rounded-full bg-[#EEF7D8] px-3 py-1 text-xs font-bold uppercase text-lime">
                                    Draft
                                </span>

                                <span className="text-xs text-muted">
                                    {new Date(
                                        event.updated_at,
                                    ).toLocaleDateString()}
                                </span>

                            </div>

                            <h3 className="line-clamp-2 font-display text-2xl font-black italic leading-tight text-ink">
                                {event.name}
                            </h3>

                            <p className="mt-2 text-sm text-muted">
                                {event.location}
                            </p>

                            <div className="mt-6 grid grid-cols-2 gap-3">

                                <Link
    href={route('admin.events.setup', event.id)}
    className="col-span-2 inline-flex items-center justify-center gap-2 rounded-xl bg-lime px-5 py-3 font-bold text-[#12150D] transition hover:brightness-95"
>
    Continue This Event
    <ChevronRight size={18} />
</Link>

                                <button
                                    type="button"
                                    onClick={() => publish(event.id)}
                                    className="col-span-2 inline-flex items-center justify-center gap-2 rounded-xl border border-lime bg-[#F7FCEB] px-5 py-3 font-bold text-[#12150D] transition hover:bg-[#EEF7D8]"
                                >
                                    <Rocket size={18} />
                                    Publish Event
                                </button>

                                <Link
                                    href={`/admin/events/${event.id}/edit`}
                                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-line px-5 py-3 font-semibold transition hover:border-lime"
                                >
                                    <FileEdit size={18} />
                                    Edit
                                </Link>

                                <button
                                    type="button"
                                    onClick={() => setDeleteTarget(event)}
                                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-200 px-5 py-3 font-semibold text-red-500 transition hover:bg-red-50"
                                >
                                    <Trash2 size={18} />
                                    Delete
                                </button>

                            </div>

                        </div>

                    </div>

                ))}

            </div>

            <ConfirmDialog
                open={!!deleteTarget}
                onOpenChange={(o) => !o && setDeleteTarget(null)}
                destructive
                title="Delete draft?"
                description={
                    deleteTarget
                        ? `"${deleteTarget.name}" will be permanently removed.`
                        : ''
                }
                confirmLabel="Delete"
                onConfirm={confirmDelete}
            />

        </section>
    );
}