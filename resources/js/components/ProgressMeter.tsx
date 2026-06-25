import { cn } from '@/lib/utils';

interface ProgressMeterProps {
    /** 0–100. Clamped defensively. */
    pct: number;
    /** Track height. Hero/contribution cards use a slimmer 8px bar. */
    size?: 'md' | 'sm';
    /** Use the dark-surface track (Top Contribution card). */
    onDark?: boolean;
    className?: string;
}

/**
 * Animated progress fill (HANDOFF.md §2). The fill grows from the left on mount
 * via the `grow` keyframe; the lime gradient tips into `lime-bright`.
 */
export default function ProgressMeter({
    pct,
    size = 'md',
    onDark = false,
    className,
}: ProgressMeterProps) {
    const value = Math.min(100, Math.max(0, pct));
    return (
        <div
            role="progressbar"
            aria-valuenow={Math.round(value)}
            aria-valuemin={0}
            aria-valuemax={100}
            className={cn(
                'overflow-hidden rounded-full',
                size === 'md' ? 'h-2.5' : 'h-2',
                onDark ? 'bg-white/10' : 'bg-[#EAEEE2]',
                className,
            )}
        >
            <div
                className={cn(
                    'h-full origin-left rounded-full',
                    'animate-[grow_1.1s_cubic-bezier(.2,.8,.2,1)_both]',
                    'bg-gradient-to-r from-lime-deep via-lime to-lime-bright',
                )}
                style={{ width: `${value}%` }}
            />
        </div>
    );
}
