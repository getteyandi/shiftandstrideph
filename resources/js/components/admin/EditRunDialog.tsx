import { Pencil } from 'lucide-react';
import { useEffect, useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';

export interface EditableRun {
    id: number | string;
    runner_name: string;
    km: number | string;
    run_date_input?: string | null;
    notes?: string | null;
    status: string;
}

interface EditRunDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    run: EditableRun | null;
    today: string;
    processing?: boolean;
    error?: string;
    onConfirm: (values: {
        distance: string;
        run_date: string;
        notes: string;
    }) => void;
}

/**
 * Admin dialog for correcting a run submission — including one already
 * approved. Editing an approved run's distance re-credits event progress on
 * the server, so the note below warns the admin of that side effect.
 */
export default function EditRunDialog({
    open,
    onOpenChange,
    run,
    today,
    processing = false,
    error,
    onConfirm,
}: EditRunDialogProps) {
    const [distance, setDistance] = useState('');
    const [runDate, setRunDate] = useState('');
    const [notes, setNotes] = useState('');

    // Load the run's current values whenever the dialog opens for a new target.
    useEffect(() => {
        if (open && run) {
            setDistance(String(run.km ?? ''));
            setRunDate(run.run_date_input ?? today);
            setNotes(run.notes ?? '');
        }
    }, [open, run, today]);

    const valid = Number(distance) > 0 && runDate !== '';

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="border-line bg-card sm:max-w-md">
                <DialogHeader>
                    <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-xl bg-[#eef7d8] text-lime-deep">
                        <Pencil size={20} />
                    </div>
                    <DialogTitle className="font-display text-2xl font-black italic">
                        Edit run submission
                    </DialogTitle>
                    {run && (
                        <p className="text-sm text-muted">
                            {run.runner_name}
                            {run.status === 'approved' && (
                                <span className="mt-1 block text-[13px] font-semibold text-[#b07d00]">
                                    This run is approved — changing the distance
                                    will re-adjust the runner’s event progress.
                                </span>
                            )}
                        </p>
                    )}
                </DialogHeader>

                <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                        <label className="block">
                            <span className="mb-1 block text-[11px] font-bold uppercase tracking-[.14em] text-[#92A084]">
                                Distance (KM)
                            </span>
                            <input
                                type="number"
                                step="0.01"
                                min="0.1"
                                value={distance}
                                onChange={(e) => setDistance(e.target.value)}
                                className="w-full rounded-xl border border-line bg-white px-3 py-2.5 text-sm outline-none focus:border-lime focus:ring-4 focus:ring-lime/10"
                            />
                        </label>
                        <label className="block">
                            <span className="mb-1 block text-[11px] font-bold uppercase tracking-[.14em] text-[#92A084]">
                                Run Date
                            </span>
                            <input
                                type="date"
                                value={runDate}
                                max={today}
                                onChange={(e) => setRunDate(e.target.value)}
                                className="w-full rounded-xl border border-line bg-white px-3 py-2.5 text-sm outline-none focus:border-lime focus:ring-4 focus:ring-lime/10"
                            />
                        </label>
                    </div>

                    <label className="block">
                        <span className="mb-1 block text-[11px] font-bold uppercase tracking-[.14em] text-[#92A084]">
                            Description
                        </span>
                        <textarea
                            rows={3}
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Optional notes…"
                            className="w-full resize-y rounded-xl border border-line bg-white px-3 py-2.5 text-sm outline-none focus:border-lime focus:ring-4 focus:ring-lime/10"
                        />
                    </label>

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
                        disabled={processing || !valid}
                        onClick={() =>
                            onConfirm({
                                distance,
                                run_date: runDate,
                                notes,
                            })
                        }
                        className="rounded-xl bg-lime px-5 py-2.5 text-sm font-bold text-[#12150d] transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {processing ? 'Saving…' : 'Save changes'}
                    </button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
