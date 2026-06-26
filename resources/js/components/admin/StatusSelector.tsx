import { LucideIcon, Clock3, PlayCircle, Lock, CheckCircle2 } from 'lucide-react';
import clsx from 'clsx';

type Status =
    | 'upcoming'
    | 'open'
    | 'closed'
    | 'completed';

interface StatusSelectorProps {
    value: Status;
    onChange: (status: Status) => void;
}

interface StatusOption {
    value: Status;
    title: string;
    description: string;
    icon: LucideIcon;
    color: string;
}

const OPTIONS: StatusOption[] = [
    {
        value: 'upcoming',
        title: 'Upcoming',
        description: 'Visible but not open',
        icon: Clock3,
        color: 'text-blue-500',
    },
    {
        value: 'open',
        title: 'Open',
        description: 'Accepting registrations',
        icon: PlayCircle,
        color: 'text-lime',
    },
    {
        value: 'closed',
        title: 'Closed',
        description: 'Registration ended',
        icon: Lock,
        color: 'text-orange-500',
    },
    {
        value: 'completed',
        title: 'Completed',
        description: 'Event finished',
        icon: CheckCircle2,
        color: 'text-emerald-600',
    },
];

export default function StatusSelector({
    value,
    onChange,
}: StatusSelectorProps) {
    return (
        <div className="space-y-3 w-full">

            <div>
                <h3 className="font-display text-2xl font-bold italic text-ink">
                    Event Status
                </h3>

                <p className="mt-1 text-sm text-muted">
                    Choose the current lifecycle of this event.
                </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">

                {OPTIONS.map((status) => {
                    const Icon = status.icon;

                    const selected = value === status.value;

                    return (
                        <button
                            key={status.value}
                            type="button"
                            onClick={() => onChange(status.value)}
                            className={clsx(
                                'rounded-2xl border p-5 text-left transition-all duration-200',
                                selected
                                    ? 'border-lime bg-[#F7FCEB] shadow'
                                    : 'border-line bg-card hover:border-lime hover:shadow-sm',
                            )}
                        >
                            <div
                                className={clsx(
                                    'mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-[#eef7d8]',
                                    status.color,
                                )}
                            >
                                <Icon size={24} />
                            </div>

                            <div className="font-semibold text-ink">
                                {status.title}
                            </div>

                            <div className="mt-1 text-sm text-muted">
                                {status.description}
                            </div>

                            {selected && (
                                <div className="mt-5 inline-flex rounded-full bg-lime px-3 py-1 text-xs font-bold uppercase text-[#12150d]">
                                    Selected
                                </div>
                            )}
                        </button>
                    );
                })}

            </div>

        </div>
    );
}