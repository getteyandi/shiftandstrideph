import BannerUpload from './BannerUpload';
import FormInput from './FormInput';
import FormTextarea from './FormTextarea';
import StatusSelector from './StatusSelector';
import DatePickerField from './DatePickerField';
import { Link } from '@inertiajs/react';
import { Save, CalendarRange } from 'lucide-react';

/** Human-friendly duration between two YYYY-MM-DD dates. */
function eventDuration(start: string, end: string): string {
    const startDate = new Date(start);
    const endDate = new Date(end);

    if (
        Number.isNaN(startDate.getTime()) ||
        Number.isNaN(endDate.getTime())
    ) {
        return '';
    }

    const days =
        Math.round(
            (endDate.getTime() - startDate.getTime()) /
                (1000 * 60 * 60 * 24),
        ) + 1;

    if (days <= 0) {
        return 'Event ends before it starts — check the dates.';
    }

    const fmt = (d: Date) =>
        d.toLocaleDateString(undefined, {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });

    return `${fmt(startDate)} → ${fmt(endDate)} · ${days} day${
        days === 1 ? '' : 's'
    }`;
}

export interface EventFormData {
    name: string;
    description: string;
    location: string;

    banner: File | null;

    registration_start: string;
    registration_end: string;

    start_date: string;
    end_date: string;

    status:
        | 'upcoming'
        | 'open'
        | 'closed'
        | 'completed';

    preset: 'solo' | 'community' | 'group';
    is_highlighted: boolean;
}

const PRESETS: {
    value: EventFormData['preset'];
    title: string;
    desc: string;
}[] = [
    {
        value: 'solo',
        title: 'Solo Run',
        desc: 'Standard event. Each runner logs on their own.',
    },
    {
        value: 'community',
        title: 'Community Run',
        desc: 'Shows all participants, a shared progress bar, event & island rankings.',
    },
    {
        value: 'group',
        title: 'Group Run',
        desc: 'Runners team up — solo, duo, or group — and compete as teams.',
    },
];

interface Props {
    data: EventFormData;

    setData: <K extends keyof EventFormData>(
        key: K,
        value: EventFormData[K],
    ) => void;

    errors: Record<string, string>;

    processing: boolean;

    submit: (e: React.FormEvent<HTMLFormElement>) => void;

    currentBanner?: string | null;

    submitLabel?: string;
}

export default function EventForm({
    data,
    setData,
    errors,
    processing,
    submit,
    currentBanner = null,
    submitLabel = 'Create Event',
}: Props) {
    return (
        <form
            onSubmit={submit}
            className="space-y-8"
        >
            <div className="flex flex-col gap-8">
                <div className="rounded-3xl border border-line bg-card p-7">

                    <h2 className="font-display text-2xl font-bold italic">
                        Basic Information
                    </h2>

                    <p className="mt-1 mb-8 text-sm text-muted">
                        Information displayed to runners.
                    </p>

                    <div className="space-y-6">

                        <FormInput
                            label="Event Name"
                            value={data.name}
                            error={errors.name}
                            placeholder="Davao Virtual Marathon 2026"
                            onChange={(e) =>
                                setData('name', e.target.value)
                            }
                        />

                        <FormTextarea
                            label="Description"
                            value={data.description}
                            error={errors.description}
                            onChange={(e) =>
                                setData(
                                    'description',
                                    e.target.value,
                                )
                            }
                        />

                        <FormInput
                            label="Location"
                            value={data.location}
                            error={errors.location}
                            placeholder="Davao City"
                            onChange={(e) =>
                                setData(
                                    'location',
                                    e.target.value,
                                )
                            }
                        />

                    </div>

                </div>
                <BannerUpload
                    value={data.banner}
                    currentImage={currentBanner}
                    error={errors.banner}
                    onChange={(file) => setData('banner', file)}
                />
            </div>

            {/* Registration */}

            <div className="rounded-3xl border border-line bg-card p-7">

                <h2 className="font-display text-2xl font-bold italic text-ink">
                    Registration Period
                </h2>

                <p className="mt-1 mb-8 text-sm text-muted">
                    When runners can register.
                </p>

                <div className="grid gap-6 md:grid-cols-2">

                    <DatePickerField
                        withTime
                        label="Registration Starts"
                        value={data.registration_start}
                        error={errors.registration_start}
                        hint="When sign-ups open."
                        onChange={(v) => setData('registration_start', v)}
                    />

                    <DatePickerField
                        withTime
                        label="Registration Ends"
                        value={data.registration_end}
                        error={errors.registration_end}
                        minDate={data.registration_start?.slice(0, 10)}
                        hint="Must be after sign-ups open."
                        onChange={(v) => setData('registration_end', v)}
                    />

                </div>

            </div>

            {/* Event */}

            <div className="rounded-3xl border border-line bg-card p-7">

                <h2 className="font-display text-2xl font-bold italic text-ink">
                    Event Period
                </h2>

                <p className="mt-1 mb-8 text-sm text-muted">
                    Duration of the virtual event.
                </p>

                <div className="grid gap-6 md:grid-cols-2">

                    <DatePickerField
                        label="Event Starts"
                        value={data.start_date}
                        error={errors.start_date}
                        minDate={data.registration_start?.slice(0, 10)}
                        hint="The day the virtual event begins."
                        onChange={(v) => setData('start_date', v)}
                    />

                    <DatePickerField
                        label="Event Ends"
                        value={data.end_date}
                        error={errors.end_date}
                        minDate={data.start_date || undefined}
                        hint="Must be on or after the start day."
                        onChange={(v) => setData('end_date', v)}
                    />

                </div>

                {data.start_date && data.end_date && (
                    <p className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#F7FCEB] px-4 py-2.5 text-sm font-semibold text-[#4b5340]">
                        <CalendarRange size={16} className="text-lime-deep" />
                        {eventDuration(data.start_date, data.end_date)}
                    </p>
                )}

            </div>
            <div className="rounded-3xl border border-line bg-card p-7">
                <StatusSelector
                    value={data.status}
                    onChange={(status) =>
                        setData('status', status)
                    }
                />
            </div>

            {/* Preset + highlight */}
            <div className="space-y-5 rounded-3xl border border-line bg-card p-7">
                <div>
                    <h3 className="font-display text-2xl font-bold italic text-ink">
                        Event Type
                    </h3>
                    <p className="mt-1 text-sm text-muted">
                        How runners experience this event.
                    </p>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                    {PRESETS.map((p) => {
                        const on = data.preset === p.value;
                        return (
                            <button
                                key={p.value}
                                type="button"
                                onClick={() => setData('preset', p.value)}
                                className={`rounded-2xl border p-5 text-left transition ${
                                    on
                                        ? 'border-lime bg-[#F7FCEB] shadow'
                                        : 'border-line bg-card hover:border-lime'
                                }`}
                            >
                                <div className="font-display text-xl font-bold italic text-ink">
                                    {p.title}
                                </div>
                                <div className="mt-1.5 text-sm text-muted">
                                    {p.desc}
                                </div>
                                {on && (
                                    <span className="mt-4 inline-flex rounded-full bg-lime px-3 py-1 text-xs font-bold uppercase text-[#12150d]">
                                        Selected
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </div>

                <button
                    type="button"
                    onClick={() =>
                        setData('is_highlighted', !data.is_highlighted)
                    }
                    className={`flex w-full items-center justify-between rounded-2xl border p-5 text-left transition ${
                        data.is_highlighted
                            ? 'border-lime bg-[#F7FCEB]'
                            : 'border-line bg-card hover:border-lime'
                    }`}
                >
                    <div>
                        <div className="font-semibold text-ink">
                            Highlighted Event
                        </div>
                        <div className="text-sm text-muted">
                            Feature this event at the top of the events page
                            (only one can be highlighted).
                        </div>
                    </div>
                    <span
                        className={`relative h-6 w-11 rounded-full transition ${
                            data.is_highlighted ? 'bg-lime' : 'bg-[#d8ddd0]'
                        }`}
                    >
                        <span
                            className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${
                                data.is_highlighted
                                    ? 'left-[22px]'
                                    : 'left-0.5'
                            }`}
                        />
                    </span>
                </button>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap items-center justify-end gap-3 rounded-3xl border border-line bg-card p-5">
                <Link
                    href="/admin/events"
                    className="rounded-xl border border-line px-6 py-3 font-semibold text-muted transition hover:border-lime hover:text-ink"
                >
                    Cancel
                </Link>

                <button
                    type="submit"
                    disabled={processing}
                    className="inline-flex items-center gap-2 rounded-xl bg-lime px-7 py-3 font-bold text-[#12150d] transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-60"
                >
                    <Save size={18} />
                    {processing ? 'Saving…' : submitLabel}
                </button>
            </div>

        </form>
    )};