import { useState, useEffect } from 'react';
import { Ban } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';

interface RejectDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title?: string;
    description?: string;
    processing?: boolean;
    error?: string;
    onConfirm: (reason: string) => void;
}

/**
 * Modal that requires the admin to write a rejection reason before confirming.
 */
export default function RejectDialog({
    open,
    onOpenChange,
    title = 'Reject',
    description = 'Let the runner know why. This reason will be saved with the record.',
    processing = false,
    error,
    onConfirm,
}: RejectDialogProps) {
    const [reason, setReason] = useState('');

    // Reset the field whenever the dialog re-opens.
    useEffect(() => {
        if (open) setReason('');
    }, [open]);

    const tooShort = reason.trim().length < 3;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="border-line bg-card sm:max-w-md">
                <DialogHeader>
                    <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 text-red-600">
                        <Ban size={22} />
                    </div>
                    <DialogTitle className="font-display text-2xl font-black italic">
                        {title}
                    </DialogTitle>
                    <p className="text-sm text-muted">{description}</p>
                </DialogHeader>

                <div className="space-y-2">
                    <textarea
                        autoFocus
                        rows={3}
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        placeholder="e.g. The proof photo is unclear / distance doesn't match."
                        className="w-full resize-y rounded-xl border border-line bg-white px-4 py-3 text-sm outline-none transition focus:border-lime focus:ring-4 focus:ring-lime/10"
                    />
                    {error && (
                        <p className="text-sm font-medium text-red-500">
                            {error}
                        </p>
                    )}
                </div>

                <DialogFooter className="mt-1 gap-2 sm:gap-2">
                    <button
                        type="button"
                        onClick={() => onOpenChange(false)}
                        className="rounded-xl border border-line px-5 py-2.5 text-sm font-semibold text-muted transition hover:border-lime hover:text-ink"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        disabled={processing || tooShort}
                        onClick={() => onConfirm(reason.trim())}
                        className="rounded-xl bg-red-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {processing ? 'Rejecting…' : 'Reject'}
                    </button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
