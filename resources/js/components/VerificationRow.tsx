import { Check, ImageIcon } from '@/lib/icons';
import { cn } from '@/lib/utils';

interface VerificationRowProps {
    submission: {
        id: number | string;
        runner_name: string;
        runner_code: string;
        km: number | string;
        applies_to: string; // e.g. "Davao Marathon · 21KM"
        submitted_at: string; // pre-formatted, e.g. "8 min ago"
        /** 'pending' | 'approved' | 'rejected' */
        status: string;
        /** Optional proof thumbnail URL; falls back to a gradient placeholder. */
        proof_thumb_url?: string;
    };
    onApprove: (id: VerificationRowProps['submission']['id']) => void;
    onReject: (id: VerificationRowProps['submission']['id']) => void;
}

/**
 * Run verification queue row (HANDOFF.md §4). Pending rows expose Reject / Approve;
 * resolved rows collapse to a status pill. Approve mutates status server-side
 * and triggers progress / completion / badge / cert logic.
 */
export default function VerificationRow({
    submission: v,
    onApprove,
    onReject,
}: VerificationRowProps) {
    const pending = v.status === 'pending';
    const approved = v.status === 'approved';

    return (
        <div className="flex flex-wrap items-center gap-4 border-b border-[#F0F2EA] px-5 py-4 last:border-b-0">
            <div
                className="flex h-[58px] w-[58px] shrink-0 items-center justify-center overflow-hidden rounded-[13px] bg-cover bg-center text-white/70"
                style={{
                    background: v.proof_thumb_url
                        ? `center/cover url(${v.proof_thumb_url})`
                        : 'linear-gradient(135deg,#3a4a22,#161c0e)',
                }}
            >
                {v.proof_thumb_url ? null : <ImageIcon size={20} />}
            </div>

            <div className="min-w-[150px]">
                <div className="text-[15px] font-bold text-ink">
                    {v.runner_name}{' '}
                    <span className="text-[13px] font-semibold text-[#aeb4a4]">
                        · {v.runner_code}
                    </span>
                </div>
                <div className="mt-0.5 text-[12.5px] text-muted">
                    {v.applies_to} · {v.submitted_at}
                </div>
            </div>

            <div className="px-1 text-center">
                <div className="font-display text-[26px] leading-none font-extrabold text-ink italic">
                    {v.km}
                </div>
                <div className="text-[10px] font-bold tracking-[.1em] text-[#9aa18d]">
                    KM
                </div>
            </div>

            <div className="ml-auto flex items-center gap-[9px]">
                {pending ? (
                    <>
                        <button
                            type="button"
                            onClick={() => onReject(v.id)}
                            className="flex items-center gap-1.5 rounded-[10px] border-[1.5px] border-[#e9ccc8] bg-card px-4 py-[9px] text-[13.5px] font-bold text-[#c0392b] transition-colors hover:bg-[#fdf0ee]"
                        >
                            Reject
                        </button>
                        <button
                            type="button"
                            onClick={() => onApprove(v.id)}
                            className="flex items-center gap-1.5 rounded-[10px] bg-ink-900 px-[18px] py-[9px] text-[13.5px] font-bold text-lime transition-colors hover:bg-lime hover:text-ink-900"
                        >
                            <Check size={15} strokeWidth={2.6} />
                            Approve
                        </button>
                    </>
                ) : (
                    <span
                        className={cn(
                            'rounded-full px-3.5 py-[7px] text-xs font-extrabold tracking-[.05em]',
                            approved
                                ? 'bg-[#eef7d8] text-[#5f8c00]'
                                : 'bg-[#fde4e1] text-[#c0392b]',
                        )}
                    >
                        {approved ? '✓ APPROVED' : '✕ REJECTED'}
                    </span>
                )}
            </div>
        </div>
    );
}
