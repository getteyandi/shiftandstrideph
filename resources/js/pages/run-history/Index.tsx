import { Head, Link } from '@inertiajs/react';
import {
    Footprints,
    ImageIcon,
    ExternalLink,
    CheckCircle2,
    Clock,
    Route as RouteIcon,
    Upload,
} from 'lucide-react';

import AppLayout from '@/layouts/app-layout';
import SectionHeader from '@/components/SectionHeader';
import Pagination, { type PaginationLink } from '@/components/Pagination';

interface RunEvent {
    event_name: string;
    category_name: string;
}
interface Run {
    id: number;
    distance: number;
    status: 'pending' | 'approved' | 'rejected';
    notes: string | null;
    date: string;
    reviewed_at: string | null;
    rejection_reason: string | null;
    photo_url: string | null;
    proof_link: string | null;
    events: RunEvent[];
}
interface Paginated<T> {
    data: T[];
    links: PaginationLink[];
    from?: number | null;
    to?: number | null;
    total?: number;
}
interface Props {
    runs: Paginated<Run>;
    stats: {
        total: number;
        approved: number;
        pending: number;
        total_km: number;
    };
}

const STATUS_PILL: Record<string, string> = {
    approved: 'bg-[#eef7d8] text-[#5f8c00]',
    pending: 'bg-[#fff3d6] text-[#b07d00]',
    rejected: 'bg-[#fde4e1] text-[#c0392b]',
};

function StatCard({
    label,
    value,
    icon: Icon,
}: {
    label: string;
    value: string | number;
    icon: typeof Footprints;
}) {
    return (
        <div className="rounded-[18px] border border-line bg-card p-5">
            <div className="flex items-center gap-2 text-muted-2">
                <Icon size={16} className="text-lime-deep" />
                <span className="text-[11px] font-bold uppercase tracking-[.14em]">
                    {label}
                </span>
            </div>
            <div className="mt-2 font-display text-3xl font-black italic text-ink">
                {value}
            </div>
        </div>
    );
}

export default function Index({ runs, stats }: Props) {
    return (
        <div>
            <Head title="My Runs" />

            <div className="animate-[floatup_.4s_ease_both] space-y-7">
                {/* HERO */}
                <div className="flex flex-wrap items-end justify-between gap-3.5">
                    <div>
                        <div className="mb-1.5 text-[11px] font-bold uppercase tracking-[.28em] text-lime-deep">
                            Activity · History
                        </div>
                        <h1 className="m-0 font-display text-[clamp(30px,4.4vw,44px)] font-extrabold uppercase italic leading-[.92] text-ink">
                            My Runs
                        </h1>
                    </div>
                    <Link
                        href="/run-submissions"
                        className="inline-flex items-center gap-2 rounded-xl bg-ink px-5 py-3 text-sm font-bold text-lime transition hover:bg-lime hover:text-ink"
                    >
                        <Upload size={16} />
                        Submit a Run
                    </Link>
                </div>

                {/* STATS */}
                <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                    <StatCard
                        label="Total Runs"
                        value={stats.total}
                        icon={Footprints}
                    />
                    <StatCard
                        label="Approved"
                        value={stats.approved}
                        icon={CheckCircle2}
                    />
                    <StatCard
                        label="Pending"
                        value={stats.pending}
                        icon={Clock}
                    />
                    <StatCard
                        label="KM Logged"
                        value={stats.total_km}
                        icon={RouteIcon}
                    />
                </div>

                {/* LIST */}
                <div>
                    <SectionHeader title="Submissions" />
                    {runs.data.length === 0 ? (
                        <div className="rounded-[20px] border border-dashed border-line bg-card py-16 text-center">
                            <Footprints
                                className="mx-auto mb-3 text-lime"
                                size={36}
                            />
                            <p className="font-semibold text-ink">
                                No runs submitted yet
                            </p>
                            <p className="mt-1 text-sm text-muted">
                                Log your first run to start filling your goals.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {runs.data.map((run) => (
                                <div
                                    key={run.id}
                                    className="flex flex-col gap-4 rounded-[20px] border border-line bg-card p-5 sm:flex-row sm:items-center"
                                >
                                    {/* proof thumb */}
                                    <div
                                        className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-cover bg-center text-white/70"
                                        style={{
                                            background: run.photo_url
                                                ? `center/cover url(${run.photo_url})`
                                                : 'linear-gradient(135deg,#3a4a22,#1a2010)',
                                        }}
                                    >
                                        {run.photo_url ? null : run.proof_link ? (
                                            <ExternalLink size={22} />
                                        ) : (
                                            <ImageIcon size={22} />
                                        )}
                                    </div>

                                    {/* body */}
                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-center gap-3">
                                            <span className="font-display text-3xl font-black italic text-ink">
                                                {run.distance}
                                                <span className="ml-1 text-sm font-bold not-italic text-muted">
                                                    KM
                                                </span>
                                            </span>
                                            <span
                                                className={`rounded-full px-3 py-1 text-[11px] font-extrabold uppercase ${
                                                    STATUS_PILL[run.status] ??
                                                    STATUS_PILL.pending
                                                }`}
                                            >
                                                {run.status}
                                            </span>
                                        </div>

                                        {run.events.length > 0 && (
                                            <div className="mt-2 flex flex-wrap gap-1.5">
                                                {run.events.map((e, i) => (
                                                    <span
                                                        key={i}
                                                        className="rounded-md border border-[#e1e6d6] bg-[#f7f9f1] px-2.5 py-0.5 text-xs font-bold text-[#3A4034]"
                                                    >
                                                        {e.event_name} ·{' '}
                                                        {e.category_name}
                                                    </span>
                                                ))}
                                            </div>
                                        )}

                                        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-2">
                                            <span>Submitted {run.date}</span>
                                            {run.proof_link && (
                                                <a
                                                    href={run.proof_link}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center gap-1 font-bold text-lime-deep underline"
                                                >
                                                    <ExternalLink size={12} />
                                                    Proof link
                                                </a>
                                            )}
                                        </div>

                                        {run.notes && (
                                            <p className="mt-2 text-sm text-muted-2">
                                                “{run.notes}”
                                            </p>
                                        )}

                                        {run.status === 'rejected' &&
                                            run.rejection_reason && (
                                                <p className="mt-2 rounded-lg bg-[#fde4e1] px-3 py-1.5 text-xs font-semibold text-[#c0392b]">
                                                    {run.rejection_reason}
                                                </p>
                                            )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    <Pagination paginator={runs} />
                </div>
            </div>
        </div>
    );
}

Index.layout = (page: React.ReactNode) => (
    <AppLayout active="my-runs">{page}</AppLayout>
);
