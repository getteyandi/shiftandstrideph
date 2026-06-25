import SectionHeader from '@/components/SectionHeader';
import StatTile from '@/components/StatTile';
import VerificationRow from '@/components/VerificationRow';
import AppLayout from '@/layouts/app-layout';
import { Head, router } from '@inertiajs/react';
import { useState } from 'react';

// stats: [{ label, value, glow }]   submissions: [{ id, runner_name, runner_code, distance, applies_to, submitted_at, proof_thumbnail? }]
export default function Verification({ stats = [], submissions = [] }) {
    const [statuses, setStatuses] = useState({}); // optimistic UI: { [id]: 'approved'|'rejected' }
    const pendingCount = submissions.filter((s) => !statuses[s.id]).length;

    const approve = (id) => {
        setStatuses((m) => ({ ...m, [id]: 'approved' }));
        router.post(
            route('admin.runs.approve', id),
            {},
            { preserveScroll: true },
        );
    };
    const reject = (id) => {
        setStatuses((m) => ({ ...m, [id]: 'rejected' }));
        router.post(
            route('admin.runs.reject', id),
            {},
            { preserveScroll: true },
        );
    };

    return (
        <>
            <Head title="Admin · Verification" />
            <div className="animate-floatup">
                <div className="mb-[22px]">
                    <div className="mb-1.5 text-[11px] font-bold tracking-[.28em] text-lime-deep uppercase">
                        Control Center
                    </div>
                    <h1 className="m-0 font-display text-[clamp(30px,4.4vw,44px)] leading-[.92] font-extrabold uppercase italic">
                        Admin Dashboard
                    </h1>
                </div>

                <div className="mb-[26px] grid grid-cols-[repeat(auto-fit,minmax(190px,1fr))] gap-4">
                    {stats.map((s, i) => (
                        <StatTile
                            key={i}
                            label={s.label}
                            value={s.value}
                            glow={s.glow}
                        />
                    ))}
                </div>

                <SectionHeader title="Run Verification Queue">
                    <span className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-[#6b7261]">
                        <span className="h-2 w-2 animate-pulse2 rounded-full bg-lime" />
                        {pendingCount} pending
                    </span>
                </SectionHeader>

                <div className="overflow-hidden rounded-[20px] border border-[#DFE3D6] bg-white">
                    {submissions.map((s) => (
                        <VerificationRow
                            key={s.id}
                            submission={s}
                            status={statuses[s.id] ?? 'pending'}
                            onApprove={() => approve(s.id)}
                            onReject={() => reject(s.id)}
                        />
                    ))}
                </div>
            </div>
        </>
    );
}

Verification.layout = (page) => <AppLayout current="admin">{page}</AppLayout>;
