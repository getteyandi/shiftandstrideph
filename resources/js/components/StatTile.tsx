import { cn } from '@/lib/utils';

interface StatTileProps {
    label: string;
    value: string | number;
    /** Optional unit shown small + muted after the value (e.g. "KM"). */
    unit?: string;
    /**
     * Glow color. On the light admin grid this is a soft blurred orb in the
     * corner; pass any hex. Omit for no glow.
     */
    glow?: string;
    /** Dark hero variant (used on the runner profile). */
    variant?: 'light' | 'dark' | 'dark-accent';
    className?: string;
}

/**
 * Stat tile (HANDOFF.md §3 component candidates). Big condensed-italic number
 * with an uppercase micro-label. Light variant for the admin grid; dark
 * variants for the runner hero.
 */
export default function StatTile({
    label,
    value,
    unit,
    glow,
    variant = 'light',
    className,
}: StatTileProps) {
    const isDark = variant !== 'light';
    return (
        <div
            className={cn(
                'relative overflow-hidden rounded-2xl',
                variant === 'light' &&
                    'border border-line bg-card px-5 py-[18px]',
                variant === 'dark' &&
                    'min-w-[140px] border border-[#2f3823] bg-white/[.04] px-[22px] py-4',
                variant === 'dark-accent' &&
                    'min-w-[140px] border border-lime/35 bg-lime/10 px-[22px] py-4',
                className,
            )}
        >
            {glow ? (
                <span
                    aria-hidden
                    className="absolute -top-1.5 -right-1.5 h-[60px] w-[60px] rounded-full opacity-50 blur-[18px]"
                    style={{ background: glow }}
                />
            ) : null}
            <div
                className={cn(
                    'text-[10.5px] font-bold tracking-[.14em] uppercase',
                    variant === 'dark-accent'
                        ? 'text-lime'
                        : isDark
                          ? 'text-[#8c9882]'
                          : 'text-[#9aa18d]',
                )}
            >
                {label}
            </div>
            <div
                className={cn(
                    'mt-1 font-display leading-none font-extrabold italic',
                    isDark ? 'text-white' : 'text-ink',
                    variant === 'light'
                        ? 'text-[40px]'
                        : 'text-[clamp(34px,4vw,46px)]',
                )}
            >
                {value}
                {unit ? (
                    <span className="ml-1 text-base font-normal text-[#8c9882] not-italic">
                        {unit}
                    </span>
                ) : null}
            </div>
        </div>
    );
}
