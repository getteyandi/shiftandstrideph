import SectionHeader from '@/components/SectionHeader';
import StatTile from '@/components/StatTile';
import VerificationRow from '@/components/VerificationRow';
import AppLayout from '@/layouts/app-layout';
import { Head, router } from '@inertiajs/react';
import { useState } from 'react';

interface AdminStat {
    label: string;
    value: string | number;
    glow?: string;
}
interface Submission {
    id: number | string;
    runner_name: string;
    runner_code: string;
    km: number | string;
    applies_to: string;
    submitted_at: string;
    status: string; // 'pending' | 'approved' | 'rejected'
    proof_thumb_url?: string;
}

interface VerificationProps {
    stats: AdminStat[];
    submissions: Submission[];
}

export default function Verification({
    stats,
    submissions,
}: VerificationProps) {
    // Optimistic local status so rows flip immediately; the request reconciles.
    const [statusById, setStatusById] = useState<Record<string, string>>({});

    const rows = submissions.map((s) => ({
        ...s,
        status: statusById[String(s.id)] ?? s.status,
    }));
    const pendingCount = rows.filter((r) => r.status === 'pending').length;

    function resolve(id: Submission['id'], decision: 'approved' | 'rejected') {
        setStatusById((m) => ({ ...m, [String(id)]: decision }));
        router.patch(
            `/admin/verification/${id}`,
            { status: decision },
            { preserveScroll: true, preserveState: true },
        );
    }

    return (
        <AppLayout active="admin">
            <Head title="Admin · Verification" />

            <div className="animate-[floatup_.4s_ease_both]">
                <div className="mb-[22px]">
                    <div className="mb-1.5 text-[11px] font-bold tracking-[.28em] text-lime-deep uppercase">
                        Control Center
                    </div>
                    <h1 className="m-0 font-display text-[clamp(30px,4.4vw,44px)] leading-[.92] font-extrabold uppercase italic">
                        Admin Dashboard
                    </h1>
                </div>

                <div className="mb-[26px] grid grid-cols-[repeat(auto-fit,minmax(190px,1fr))] gap-4">
                    {stats.map((st) => (
                        <StatTile
                            key={st.label}
                            label={st.label}
                            value={st.value}
                            glow={st.glow}
                        />
                    ))}
                </div>

                <SectionHeader
                    title="Run Verification Queue"
                    aside={
                        <span className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-muted-2">
                            <span className="h-2 w-2 animate-[pulse2_2s_infinite] rounded-full bg-lime" />
                            {pendingCount} pending
                        </span>
                    }
                />

                <div className="overflow-hidden rounded-[20px] border border-line bg-card">
                    {rows.map((s) => (
                        <VerificationRow
                            key={s.id}
                            submission={s}
                            onApprove={(id) => resolve(id, 'approved')}
                            onReject={(id) => resolve(id, 'rejected')}
                        />
                    ))}
                </div>
            </div>
        </AppLayout>
    );
}
