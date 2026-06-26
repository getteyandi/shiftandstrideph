import { ChevronLeft, ChevronRight } from 'lucide-react';
import { DayPicker, getDefaultClassNames } from 'react-day-picker';

import { cn } from '@/lib/utils';

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

/**
 * Branded react-day-picker (v9) calendar used inside the date pickers.
 */
export function Calendar({ className, classNames, ...props }: CalendarProps) {
    const defaults = getDefaultClassNames();

    return (
        <DayPicker
            showOutsideDays
            className={cn('p-1', className)}
            classNames={{
                root: cn(defaults.root, 'w-fit'),
                months: 'flex flex-col gap-2',
                month: 'space-y-3',
                month_caption:
                    'flex h-9 items-center justify-center px-9 relative',
                caption_label:
                    'font-display text-base font-bold italic text-ink',
                nav: 'absolute inset-x-0 top-0 flex items-center justify-between',
                button_previous:
                    'flex h-8 w-8 items-center justify-center rounded-lg border border-line text-[#5A6152] transition hover:border-lime hover:text-lime disabled:opacity-40',
                button_next:
                    'flex h-8 w-8 items-center justify-center rounded-lg border border-line text-[#5A6152] transition hover:border-lime hover:text-lime disabled:opacity-40',
                month_grid: 'w-full border-collapse',
                weekdays: 'flex',
                weekday:
                    'w-9 text-[11px] font-bold uppercase tracking-wide text-[#9aa18d]',
                week: 'flex w-full mt-1',
                day: 'h-9 w-9 p-0 text-center',
                day_button:
                    'h-9 w-9 rounded-lg text-sm font-semibold text-ink transition hover:bg-[#eef7d8] aria-selected:bg-lime aria-selected:text-[#12150d]',
                today: 'font-black text-lime-deep',
                outside: 'text-[#c0c5b8]',
                disabled: 'opacity-40 cursor-not-allowed',
                ...classNames,
            }}
            components={{
                Chevron: ({ orientation, ...rest }) =>
                    orientation === 'left' ? (
                        <ChevronLeft size={16} {...rest} />
                    ) : (
                        <ChevronRight size={16} {...rest} />
                    ),
            }}
            {...props}
        />
    );
}
