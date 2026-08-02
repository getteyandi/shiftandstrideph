import { useEffect, useState } from 'react';
import { Trash2 } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';

interface DeleteDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title: string;
    description?: string;
    /**
     * The exact phrase the admin must retype to enable deletion — usually the
     * record's name or code. This is the second layer of confirmation on top of
     * opening the dialog, guarding against accidental permanent deletes.
     */
    confirmPhrase: string;
    confirmLabel?: string;
    processing?: boolean;
    onConfirm: () => void;
}

/**
 * Two-step confirmation modal for permanent deletes: the admin must both open
 * the dialog AND retype the record's identifier before the delete button
 * unlocks. Used for hard-deleting runs, registrations and users.
 */
export default function DeleteDialog({
    open,
    onOpenChange,
    title,
    description,
    confirmPhrase,
    confirmLabel = 'Delete permanently',
    processing = false,
    onConfirm,
}: DeleteDialogProps) {
    const [typed, setTyped] = useState('');

    // Reset the field each time the dialog opens for a new target.
    useEffect(() => {
        if (open) setTyped('');
    }, [open, confirmPhrase]);

    const matches =
        typed.trim().toLowerCase() === confirmPhrase.trim().toLowerCase();

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="border-line bg-card sm:max-w-md">
                <DialogHeader>
                    <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 text-red-600">
                        <Trash2 size={22} />
                    </div>
                    <DialogTitle className="font-display text-2xl font-black italic">
                        {title}
                    </DialogTitle>
                    {description && (
                        <p className="text-sm text-muted">{description}</p>
                    )}
                </DialogHeader>

                <div className="space-y-2">
                    <label className="block text-sm font-medium text-ink">
                        Type{' '}
                        <span className="font-bold text-red-600">
                            {confirmPhrase}
                        </span>{' '}
                        to confirm
                    </label>
                    <input
                        autoFocus
                        type="text"
                        value={typed}
                        onChange={(e) => setTyped(e.target.value)}
                        placeholder={confirmPhrase}
                        className="w-full rounded-xl border border-line bg-white px-4 py-3 text-sm outline-none transition focus:border-red-400 focus:ring-4 focus:ring-red-500/10"
                    />
                    <p className="text-xs text-muted">
                        This action is permanent and cannot be undone.
                    </p>
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
                        disabled={processing || !matches}
                        onClick={onConfirm}
                        className="rounded-xl bg-red-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {processing ? 'Deleting…' : confirmLabel}
                    </button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
