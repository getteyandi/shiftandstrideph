import { InputHTMLAttributes } from 'react';

interface FormInputProps
    extends InputHTMLAttributes<HTMLInputElement> {
    label: string;
    error?: string;
    hint?: string;
}

export default function FormInput({
    label,
    error,
    hint,
    className = '',
    ...props
}: FormInputProps) {
    return (
        <div className="space-y-2">
            <label className="block text-sm font-bold text-ink">
                {label}
            </label>

            <input
                {...props}
                className={`w-full rounded-xl border border-line bg-white px-4 py-3 transition outline-none focus:border-lime focus:ring-4 focus:ring-lime/10 ${className}`}
            />

            {hint && !error && (
                <p className="text-xs text-muted">{hint}</p>
            )}

            {error && (
                <p className="text-sm font-medium text-red-500">
                    {error}
                </p>
            )}
        </div>
    );
}