import { cn } from '@/lib/utils';

interface RankRowProps {
    rank: number;
    runner: {
        name: string;
        city: string;
        initials: string;
    };
    /** "Events" count on Overall, or scope label ("Unity Run", "42KM") on tabs. */
    scope: string | number;
    km: number | string;
    /** Highlights the signed-in runner's own row with a lime tint. */
    me?: boolean;
}

/**
 * Leaderboard row for the dark Hall of Fame (HANDOFF.md §3). Top-3 ranks brighten;
 * #1 goes full lime; the current runner's row gets a lime tint + border.
 */
export default function RankRow({
    rank,
    runner,
    scope,
    km,
    me = false,
}: RankRowProps) {
    const top = rank <= 3;
    return (
        <div
            className={cn(
                'flex items-center rounded-[14px] border px-5 py-3.5',
                me
                    ? 'border-lime/40 bg-lime/[.08]'
                    : top
                      ? 'border-[#1c2114] bg-white/[.035]'
                      : 'border-[#1c2114] bg-transparent',
            )}
        >
            <div
                className={cn(
                    'w-12 font-display text-[22px] font-extrabold italic',
                    rank === 1
                        ? 'text-lime'
                        : top
                          ? 'text-white'
                          : 'text-[#5f6a52]',
                )}
            >
                {rank}
            </div>
            <div className="flex flex-1 items-center gap-3.5">
                <div
                    className={cn(
                        'flex h-10 w-10 shrink-0 items-center justify-center rounded-[11px] border-[1.5px] bg-[linear-gradient(145deg,#222a18,#0c0f0b)] font-display text-[15px] font-bold text-white',
                        top ? 'border-lime' : 'border-[#2a3320]',
                    )}
                >
                    {runner.initials}
                </div>
                <div>
                    <div className="text-[15px] font-bold text-white">
                        {runner.name}
                    </div>
                    <div className="text-xs text-[#8c9882]">{runner.city}</div>
                </div>
            </div>
            <div className="w-[90px] text-right font-semibold text-[#b6bfaa]">
                {scope}
            </div>
            <div
                className={cn(
                    'w-[110px] text-right font-display text-[22px] font-extrabold italic',
                    top ? 'text-lime' : 'text-[#dfe6d4]',
                )}
            >
                {km}
            </div>
        </div>
    );
}
