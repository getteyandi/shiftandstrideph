import { TextareaHTMLAttributes } from 'react';

interface FormTextareaProps
    extends TextareaHTMLAttributes<HTMLTextAreaElement> {
    label: string;
    error?: string;
}

export default function FormTextarea({
    label,
    error,
    className = '',
    ...props
}: FormTextareaProps) {
    return (
        <div className="space-y-2">
            <label className="block text-sm font-bold text-ink">
                {label}
            </label>

            <textarea
                {...props}
                className={`min-h-40 w-full resize-none rounded-xl border border-line bg-white px-4 py-3 transition outline-none focus:border-lime focus:ring-4 focus:ring-lime/10 ${className}`}
            />

            {error && (
                <p className="text-sm font-medium text-red-500">
                    {error}
                </p>
            )}
        </div>
    );
}