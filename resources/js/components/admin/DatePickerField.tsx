import { useState } from 'react';
import { format } from 'date-fns';
import { CalendarIcon, Clock } from 'lucide-react';

import { Calendar } from '@/components/ui/calendar';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';

interface DatePickerFieldProps {
    label: string;
    /** "YYYY-MM-DD" when withTime is false, "YYYY-MM-DDTHH:mm" when true. */
    value: string;
    onChange: (value: string) => void;
    withTime?: boolean;
    error?: string;
    hint?: string;
    /** Earliest selectable date as "YYYY-MM-DD". */
    minDate?: string;
}

/** Parse a "YYYY-MM-DD" or "YYYY-MM-DDTHH:mm" string into a local Date. */
function parseValue(value: string): Date | undefined {
    if (!value) return undefined;
    const [datePart, timePart] = value.split('T');
    const [y, m, d] = datePart.split('-').map(Number);
    if (!y || !m || !d) return undefined;
    const [hh, mm] = (timePart ?? '00:00').split(':').map(Number);
    return new Date(y, m - 1, d, hh || 0, mm || 0);
}

const pad = (n: number) => String(n).padStart(2, '0');

export default function DatePickerField({
    label,
    value,
    onChange,
    withTime = false,
    error,
    hint,
    minDate,
}: DatePickerFieldProps) {
    const [open, setOpen] = useState(false);

    const selected = parseValue(value);
    const time = withTime ? (value.split('T')[1] ?? '00:00') : '00:00';

    const emit = (date: Date, t: string) => {
        const base = `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
            date.getDate(),
        )}`;
        onChange(withTime ? `${base}T${t}` : base);
    };

    const onSelectDay = (date?: Date) => {
        if (!date) return;
        emit(date, time);
        if (!withTime) setOpen(false);
    };

    const onTimeChange = (t: string) => {
        emit(selected ?? new Date(), t || '00:00');
    };

    const display = selected
        ? withTime
            ? format(selected, 'MMM d, yyyy · h:mm a')
            : format(selected, 'MMM d, yyyy')
        : 'Select a date';

    return (
        <div className="space-y-2">
            <label className="block text-sm font-bold text-ink">{label}</label>

            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <button
                        type="button"
                        className={`flex w-full items-center gap-2 rounded-xl border bg-white px-4 py-3 text-left transition outline-none focus:border-lime focus:ring-4 focus:ring-lime/10 ${
                            error ? 'border-red-300' : 'border-line'
                        } ${selected ? 'text-ink' : 'text-muted'}`}
                    >
                        <CalendarIcon size={17} className="text-[#9aa18d]" />
                        <span className="font-medium">{display}</span>
                    </button>
                </PopoverTrigger>

                <PopoverContent align="start">
                    <Calendar
                        mode="single"
                        selected={selected}
                        defaultMonth={selected}
                        onSelect={onSelectDay}
                        disabled={
                            minDate ? { before: parseValue(minDate)! } : undefined
                        }
                    />

                    {withTime && (
                        <div className="mt-2 flex items-center gap-2 border-t border-line px-1 pt-3">
                            <Clock size={15} className="text-[#9aa18d]" />
                            <input
                                type="time"
                                value={time}
                                onChange={(e) => onTimeChange(e.target.value)}
                                className="flex-1 rounded-lg border border-line bg-white px-3 py-2 text-sm outline-none focus:border-lime"
                            />
                        </div>
                    )}
                </PopoverContent>
            </Popover>

            {hint && !error && <p className="text-xs text-muted">{hint}</p>}
            {error && (
                <p className="text-sm font-medium text-red-500">{error}</p>
            )}
        </div>
    );
}
