import { type ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface SectionHeaderProps {
    title: string;
    /** Optional right-aligned content (e.g. "12 registrations"). */
    aside?: ReactNode;
    /** Smaller variant used inside cards (Recent Submissions). */
    size?: 'lg' | 'sm';
    /** Hall of Fame centers its headers and uses white text. */
    center?: boolean;
    className?: string;
}

/**
 * Signature section header (HANDOFF.md §2): a skewed lime tick followed by an
 * uppercase condensed-italic title. Inherits text color from its parent, so it
 * reads dark on the light app and white inside the dark Hall of Fame.
 */
export default function SectionHeader({
    title,
    aside,
    size = 'lg',
    center = false,
    className,
}: SectionHeaderProps) {
    return (
        <div
            className={cn(
                'flex items-center gap-3',
                size === 'lg' ? 'my-1 mb-4' : 'mb-3.5',
                center && 'justify-center',
                className,
            )}
        >
            <span
                aria-hidden
                className={cn(
                    'block shrink-0 -skew-x-12 rounded-sm bg-lime',
                    size === 'lg' ? 'h-[22px] w-2' : 'h-[18px] w-[7px]',
                )}
            />
            <h2
                className={cn(
                    'm-0 font-display font-bold tracking-[.01em] uppercase italic',
                    size === 'lg' ? 'text-[23px]' : 'text-lg',
                )}
            >
                {title}
            </h2>
            {aside ? <div className="ml-auto">{aside}</div> : null}
        </div>
    );
}
