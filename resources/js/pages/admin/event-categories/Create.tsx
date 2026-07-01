import { Head, Link, router, useForm } from '@inertiajs/react';
import { useState } from 'react';
import {
    Plus,
    Flag,
    Trophy,
    Trash2,
    ArrowRight,
    Route as RouteIcon,
    CheckCircle2,
} from 'lucide-react';

import AppLayout from '@/layouts/app-layout';
import FormInput from '@/components/admin/FormInput';
import ConfirmDialog from '@/components/ConfirmDialog';

interface Category {
    id: number;
    name: string;
    target_km: number | string;
    ranking_enabled: boolean;
}

interface EventLite {
    id: number;
    name: string;
    location: string;
    categories?: Category[];
}

interface EventOption {
    id: number;
    name: string;
}

interface Props {
    event: EventLite | null;
    events: EventOption[] | null;
}

interface FormData {
    event_id: string;
    name: string;
    target_km: string;
    registration_limit: string;
    ranking_enabled: boolean;
    [key: string]: string | boolean;
}

export default function Create({ event, events }: Props) {
    const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);

    const { data, setData, post, processing, errors, reset } =
        useForm<FormData>({
            event_id: event ? String(event.id) : '',
            name: '',
            target_km: '',
            registration_limit: '',
            ranking_enabled: true,
        });

    function submit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();

        post('/admin/event-categories', {
            preserveScroll: true,
            onSuccess: () => reset('name', 'target_km'),
        });
    }

    const existing = event?.categories ?? [];

    const removeCategory = () => {
        if (!deleteTarget) return;
        router.delete(`/admin/event-categories/${deleteTarget.id}`, {
            preserveScroll: true,
            onFinish: () => setDeleteTarget(null),
        });
    };

    return (
        <>
            <Head title="Event Setup · Categories" />

            <div className="mx-auto max-w-5xl space-y-8">

                {/* HERO */}
                <div className="relative overflow-hidden rounded-[28px] border border-[#2a3120] bg-[linear-gradient(145deg,#12150d,#090b08)] p-8">
                    <div
                        className="pointer-events-none absolute inset-0"
                        style={{
                            background:
                                'radial-gradient(420px 260px at 100% 0,rgba(166,226,18,.16),transparent 60%)',
                        }}
                    />
                    <div className="relative">
                        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[.25em] text-lime">
                            <RouteIcon size={15} />
                            Event Setup · Step 2
                        </div>

                        <h1 className="mt-2 font-display text-5xl font-black italic text-white">
                            RACE CATEGORIES
                        </h1>

                        {event ? (
                            <p className="mt-3 max-w-xl text-[#98A08E]">
                                Add the distance categories for{' '}
                                <span className="font-bold text-white">
                                    {event.name}
                                </span>
                                . The event stays a draft until you publish it.
                            </p>
                        ) : (
                            <p className="mt-3 max-w-xl text-[#98A08E]">
                                Choose an event and add its distance categories.
                            </p>
                        )}
                    </div>
                </div>

                <div className="grid gap-8 lg:grid-cols-[1.1fr_.9fr]">

                    {/* FORM */}
                    <form
                        onSubmit={submit}
                        className="space-y-6 rounded-3xl border border-line bg-card p-7"
                    >
                        <div>
                            <h2 className="font-display text-2xl font-bold italic text-ink">
                                New Category
                            </h2>
                            <p className="mt-1 text-sm text-muted">
                                e.g. 5 KM, 21 KM, or a 300 KM challenge.
                            </p>
                        </div>

                        {/* Event picker only when not scoped */}
                        {!event && events && (
                            <div className="space-y-2">
                                <label className="block text-sm font-bold text-ink">
                                    Event
                                </label>
                                <select
                                    value={data.event_id}
                                    onChange={(e) =>
                                        setData('event_id', e.target.value)
                                    }
                                    className="w-full rounded-xl border border-line bg-white px-4 py-3 outline-none transition focus:border-lime focus:ring-4 focus:ring-lime/10"
                                >
                                    <option value="">Select an event</option>
                                    {events.map((opt) => (
                                        <option key={opt.id} value={opt.id}>
                                            {opt.name}
                                        </option>
                                    ))}
                                </select>
                                {errors.event_id && (
                                    <p className="text-sm font-medium text-red-500">
                                        {errors.event_id}
                                    </p>
                                )}
                            </div>
                        )}

                        <FormInput
                            label="Category Name"
                            placeholder="21 KM"
                            value={data.name}
                            error={errors.name}
                            onChange={(e) => setData('name', e.target.value)}
                        />

                        <FormInput
                            label="Target Distance (KM)"
                            type="number"
                            min={1}
                            step="0.01"
                            placeholder="21"
                            value={data.target_km}
                            error={errors.target_km}
                            onChange={(e) =>
                                setData('target_km', e.target.value)
                            }
                        />

                        <FormInput
                            label="Registration Limit"
                            type="number"
                            min={1}
                            step="1"
                            placeholder="Leave blank for unlimited"
                            hint="Quota of runners. When every category's quota fills, the event auto-completes."
                            value={data.registration_limit}
                            error={errors.registration_limit}
                            onChange={(e) =>
                                setData('registration_limit', e.target.value)
                            }
                        />

                        {/* Ranking toggle */}
                        <button
                            type="button"
                            onClick={() =>
                                setData(
                                    'ranking_enabled',
                                    !data.ranking_enabled,
                                )
                            }
                            className={`flex w-full items-center justify-between rounded-2xl border p-5 text-left transition ${
                                data.ranking_enabled
                                    ? 'border-lime bg-[#F7FCEB]'
                                    : 'border-line bg-white hover:border-lime'
                            }`}
                        >
                            <div className="flex items-center gap-3">
                                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#eef7d8] text-lime">
                                    <Trophy size={20} />
                                </div>
                                <div>
                                    <div className="font-semibold text-ink">
                                        Leaderboard Ranking
                                    </div>
                                    <div className="text-sm text-muted">
                                        Rank runners in this category.
                                    </div>
                                </div>
                            </div>

                            <span
                                className={`relative h-6 w-11 rounded-full transition ${
                                    data.ranking_enabled
                                        ? 'bg-lime'
                                        : 'bg-[#d8ddd0]'
                                }`}
                            >
                                <span
                                    className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${
                                        data.ranking_enabled
                                            ? 'left-[22px]'
                                            : 'left-0.5'
                                    }`}
                                />
                            </span>
                        </button>

                        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                            <Link
                                href="/admin/events"
                                className="inline-flex items-center gap-2 rounded-xl border border-line px-5 py-3 font-semibold text-muted transition hover:border-lime hover:text-ink"
                            >
                                Done — Back to Drafts
                                <ArrowRight size={17} />
                            </Link>

                            <button
                                type="submit"
                                disabled={processing}
                                className="inline-flex items-center gap-2 rounded-xl bg-lime px-7 py-3 font-bold text-[#12150d] transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                <Plus size={18} />
                                {processing ? 'Adding…' : 'Add Category'}
                            </button>
                        </div>
                    </form>

                    {/* EXISTING CATEGORIES */}
                    <div className="rounded-3xl border border-line bg-card p-7">
                        <div className="mb-5 flex items-center justify-between">
                            <h2 className="font-display text-2xl font-bold italic text-ink">
                                Categories
                            </h2>
                            <span className="rounded-full bg-[#EEF7D8] px-3 py-1 text-xs font-bold uppercase text-lime-deep">
                                {existing.length} added
                            </span>
                        </div>

                        {existing.length === 0 ? (
                            <div className="rounded-2xl border border-dashed border-line py-14 text-center">
                                <Flag
                                    className="mx-auto mb-4 text-lime"
                                    size={36}
                                />
                                <h3 className="text-lg font-bold">
                                    No categories yet
                                </h3>
                                <p className="mt-1 text-sm text-muted">
                                    Add your first distance category to the
                                    left.
                                </p>
                            </div>
                        ) : (
                            <ul className="space-y-3">
                                {existing.map((category) => (
                                    <li
                                        key={category.id}
                                        className="flex items-center justify-between rounded-2xl border border-line px-4 py-3"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#eef7d8] text-lime">
                                                <Flag size={18} />
                                            </div>
                                            <div>
                                                <div className="font-display text-lg font-black italic text-ink">
                                                    {category.name}
                                                </div>
                                                <div className="text-xs text-muted">
                                                    {Math.round(
                                                        Number(
                                                            category.target_km,
                                                        ) * 100,
                                                    ) / 100}{' '}
                                                    km target
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            {category.ranking_enabled && (
                                                <span className="inline-flex items-center gap-1 rounded-full bg-[#F7FCEB] px-3 py-1 text-xs font-bold text-lime-deep">
                                                    <Trophy size={13} />
                                                    Ranked
                                                </span>
                                            )}

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setDeleteTarget(category)
                                                }
                                                aria-label={`Remove ${category.name}`}
                                                className="flex h-9 w-9 items-center justify-center rounded-lg border border-red-200 text-red-500 transition hover:bg-red-50"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}

                        {event && existing.length > 0 && (
                            <div className="mt-6 flex items-start gap-3 rounded-2xl bg-[#F7FCEB] p-4 text-sm text-[#4b5340]">
                                <CheckCircle2
                                    size={18}
                                    className="mt-0.5 shrink-0 text-lime-deep"
                                />
                                <span>
                                    Details complete. Head back to{' '}
                                    <Link
                                        href="/admin/events"
                                        className="font-bold underline"
                                    >
                                        Drafts
                                    </Link>{' '}
                                    and publish when you're ready.
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <ConfirmDialog
                open={!!deleteTarget}
                onOpenChange={(o) => !o && setDeleteTarget(null)}
                destructive
                title="Remove category?"
                description={
                    deleteTarget
                        ? `"${deleteTarget.name}" will be removed from this event.`
                        : ''
                }
                confirmLabel="Remove"
                onConfirm={removeCategory}
            />
        </>
    );
}

Create.layout = (page: React.ReactNode) => (
    <AppLayout active="events">{page}</AppLayout>
);
