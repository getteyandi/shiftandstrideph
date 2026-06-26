import { AlertTriangle } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';

interface ConfirmDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title: string;
    description?: string;
    confirmLabel?: string;
    cancelLabel?: string;
    destructive?: boolean;
    processing?: boolean;
    onConfirm: () => void;
}

/**
 * Branded confirmation modal — replaces window.confirm for destructive
 * actions (delete, etc.).
 */
export default function ConfirmDialog({
    open,
    onOpenChange,
    title,
    description,
    confirmLabel = 'Confirm',
    cancelLabel = 'Cancel',
    destructive = false,
    processing = false,
    onConfirm,
}: ConfirmDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="border-line bg-card sm:max-w-md">
                <DialogHeader>
                    <div
                        className={`mb-2 flex h-12 w-12 items-center justify-center rounded-xl ${
                            destructive
                                ? 'bg-red-50 text-red-600'
                                : 'bg-[#eef7d8] text-lime-deep'
                        }`}
                    >
                        <AlertTriangle size={22} />
                    </div>
                    <DialogTitle className="font-display text-2xl font-black italic">
                        {title}
                    </DialogTitle>
                    {description && (
                        <p className="text-sm text-muted">{description}</p>
                    )}
                </DialogHeader>

                <DialogFooter className="mt-2 gap-2 sm:gap-2">
                    <button
                        type="button"
                        onClick={() => onOpenChange(false)}
                        className="rounded-xl border border-line px-5 py-2.5 text-sm font-semibold text-muted transition hover:border-lime hover:text-ink"
                    >
                        {cancelLabel}
                    </button>
                    <button
                        type="button"
                        disabled={processing}
                        onClick={onConfirm}
                        className={`rounded-xl px-5 py-2.5 text-sm font-bold transition disabled:cursor-not-allowed disabled:opacity-60 ${
                            destructive
                                ? 'bg-red-600 text-white hover:bg-red-700'
                                : 'bg-lime text-[#12150d] hover:brightness-95'
                        }`}
                    >
                        {processing ? 'Working…' : confirmLabel}
                    </button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
