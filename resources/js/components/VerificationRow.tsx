import { Check, Image as ImageIcon } from 'lucide-react';

const DEFAULT_THUMB = 'linear-gradient(135deg,#3a4a22,#161c0e)';

// submission: { id, runner_name, runner_code, distance, applies_to, submitted_at, proof_thumbnail? }
// status: 'pending' | 'approved' | 'rejected'
export default function VerificationRow({
    submission,
    status = 'pending',
    onApprove,
    onReject,
}) {
    const {
        runner_name,
        runner_code,
        distance,
        applies_to,
        submitted_at,
        proof_thumbnail,
    } = submission;
    const done = status !== 'pending';
    const approved = status === 'approved';

    return (
        <div className="flex flex-wrap items-center gap-4 border-b border-[#F0F2EA] px-5 py-4 last:border-b-0">
            <div
                className="flex h-[58px] w-[58px] shrink-0 items-center justify-center rounded-[13px] text-white/70"
                style={{ background: proof_thumbnail || DEFAULT_THUMB }}
            >
                <ImageIcon size={20} strokeWidth={2} />
            </div>

            <div className="min-w-[150px]">
                <div className="text-[15px] font-bold text-ink">
                    {runner_name}{' '}
                    <span className="text-[13px] font-semibold text-[#aeb4a4]">
                        · {runner_code}
                    </span>
                </div>
                <div className="mt-0.5 text-[12.5px] text-[#8A9080]">
                    {applies_to} · {submitted_at}
                </div>
            </div>

            <div className="px-1 text-center">
                <div className="font-display text-[26px] leading-none font-extrabold text-ink italic">
                    {distance}
                </div>
                <div className="text-[10px] font-bold tracking-[.1em] text-[#9aa18d]">
                    KM
                </div>
            </div>

            <div className="ml-auto flex items-center gap-[9px]">
                {!done ? (
                    <>
                        <button
                            type="button"
                            onClick={onReject}
                            className="flex items-center rounded-[10px] border-[1.5px] border-[#e9ccc8] bg-white px-4 py-[9px] text-[13.5px] font-bold text-[#c0392b] transition-colors hover:bg-[#fdf0ee]"
                        >
                            Reject
                        </button>
                        <button
                            type="button"
                            onClick={onApprove}
                            className="flex items-center gap-1.5 rounded-[10px] bg-ink-900 px-[18px] py-[9px] text-[13.5px] font-bold text-lime transition-colors hover:bg-lime hover:text-ink-900"
                        >
                            <Check size={15} strokeWidth={2.6} /> Approve
                        </button>
                    </>
                ) : (
                    <span
                        className={`rounded-full px-3.5 py-[7px] text-xs font-extrabold tracking-[.05em] ${
                            approved
                                ? 'bg-[#eef7d8] text-[#5f8c00]'
                                : 'bg-[#fde4e1] text-[#c0392b]'
                        }`}
                    >
                        {approved ? '✓ APPROVED' : '✕ REJECTED'}
                    </span>
                )}
            </div>
        </div>
    );
}
