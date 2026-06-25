import { useForm } from '@inertiajs/react';
import { useState } from 'react';
import { Upload, Check } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';

export default function Index({ registrations }: any) {
    // pre-select every approved registration; one upload can apply to many
    const [selected, setSelected] = useState<number[]>(() =>
        registrations.map((r: any) => r.id),
    );

    const { data, setData, post, processing, recentlySuccessful } = useForm({
        distance: '',
        photo: null as File | null,
        notes: '',
        registration_ids: registrations.map((r: any) => r.id) as number[],
    });

    const toggle = (id: number) => {
        const next = selected.includes(id)
            ? selected.filter((x) => x !== id)
            : [...selected, id];
        setSelected(next);
        setData('registration_ids', next);
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/run-submissions', { forceFormData: true });
    };

    return (
        <div className="min-h-screen bg-surface text-ink">
            <div className="mx-auto max-w-[1100px] animate-floatup px-[clamp(16px,4vw,40px)] py-[clamp(20px,3.5vw,36px)]">
                {/* heading */}
                <div className="mb-[22px]">
                    <div className="mb-1.5 text-[11px] font-bold tracking-[.28em] text-lime-deep uppercase">
                        Log Activity
                    </div>
                    <h1 className="m-0 font-display text-[clamp(30px,4.4vw,44px)] leading-[.92] font-extrabold uppercase italic">
                        Submit Your Run
                    </h1>
                </div>

                <form
                    onSubmit={submit}
                    className="grid grid-cols-[repeat(auto-fit,minmax(320px,1fr))] items-start gap-6"
                >
                    {/* left — proof + distance + notes */}
                    <div className="rounded-[20px] border border-[#DFE3D6] bg-white p-6">
                        <div className="mb-2.5 text-[11px] font-bold tracking-[.16em] text-[#9aa18d] uppercase">
                            Proof Photo
                        </div>

                        <label className="group flex h-[190px] cursor-pointer flex-col items-center justify-center gap-2.5 rounded-2xl border-2 border-dashed border-[#c8cfbb] bg-[#f8faf3] text-center transition-colors hover:border-lime hover:bg-[#f3f8e6]">
                            <div className="flex h-[54px] w-[54px] items-center justify-center rounded-[15px] bg-ink-900 text-lime">
                                <Upload size={24} strokeWidth={2} />
                            </div>
                            <div>
                                <div className="font-bold text-ink">
                                    {data.photo
                                        ? data.photo.name
                                        : 'Drop your watch / treadmill photo'}
                                </div>
                                <div className="mt-0.5 text-[12.5px] text-[#8A9080]">
                                    PNG or JPG · proof of distance
                                </div>
                            </div>
                            <input
                                type="file"
                                accept="image/*"
                                className="sr-only"
                                onChange={(e) =>
                                    setData(
                                        'photo',
                                        e.target.files?.[0] ?? null,
                                    )
                                }
                            />
                        </label>

                        <div className="mt-5">
                            <div className="mb-[7px] text-[11px] font-bold tracking-[.16em] text-[#9aa18d] uppercase">
                                Distance (KM)
                            </div>
                            <div className="relative">
                                <input
                                    type="number"
                                    step="0.01"
                                    inputMode="decimal"
                                    placeholder="0.0"
                                    value={data.distance}
                                    onChange={(e) =>
                                        setData('distance', e.target.value)
                                    }
                                    className="w-full [appearance:textfield] rounded-xl border-[1.5px] border-[#DDE1D5] py-[13px] pr-[50px] pl-3.5 font-stat text-xl font-bold text-ink outline-none focus:border-lime [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                                />
                                <span className="absolute top-1/2 right-3.5 -translate-y-1/2 text-[13px] font-bold text-[#9aa18d]">
                                    KM
                                </span>
                            </div>
                        </div>

                        <div className="mt-4">
                            <div className="mb-[7px] text-[11px] font-bold tracking-[.16em] text-[#9aa18d] uppercase">
                                Notes{' '}
                                <span className="font-medium tracking-normal text-[#bcc2b0] normal-case">
                                    · optional
                                </span>
                            </div>
                            <textarea
                                rows={2}
                                placeholder="Morning run along the coastal road…"
                                value={data.notes}
                                onChange={(e) =>
                                    setData('notes', e.target.value)
                                }
                                className="w-full resize-y rounded-xl border-[1.5px] border-[#DDE1D5] px-3.5 py-3 text-sm text-ink outline-none focus:border-lime"
                            />
                        </div>
                    </div>

                    {/* right — apply this run to + submit */}
                    <div className="rounded-[20px] border border-[#DFE3D6] bg-white p-6">
                        <div className="mb-[3px] font-bold text-ink">
                            Apply this run to
                        </div>
                        <div className="mb-4 text-[12.5px] text-[#8A9080]">
                            One submission can count toward multiple approved
                            registrations — no duplicate uploads.
                        </div>

                        <div className="flex flex-col gap-2.5">
                            {registrations.map((registration: any) => {
                                const on = selected.includes(registration.id);
                                return (
                                    <button
                                        key={registration.id}
                                        type="button"
                                        onClick={() => toggle(registration.id)}
                                        className={`flex w-full items-center gap-[13px] rounded-[14px] border-[1.5px] p-3.5 text-left transition-colors ${
                                            on
                                                ? 'border-lime bg-[#f6fbe8]'
                                                : 'border-[#E4E8DD] bg-white'
                                        }`}
                                    >
                                        <span
                                            className={`flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-[7px] border-2 text-ink-900 ${
                                                on
                                                    ? 'border-lime bg-lime'
                                                    : 'border-[#cdd3c2] bg-white'
                                            }`}
                                        >
                                            {on && (
                                                <Check
                                                    size={13}
                                                    strokeWidth={3.5}
                                                />
                                            )}
                                        </span>
                                        <span className="flex-1">
                                            <span className="block text-[14.5px] font-bold text-ink">
                                                {
                                                    registration.event_category
                                                        ?.event?.title
                                                }
                                            </span>
                                            <span className="mt-px block text-[12.5px] text-[#8A9080]">
                                                {
                                                    registration.event_category
                                                        ?.name
                                                }
                                            </span>
                                        </span>
                                    </button>
                                );
                            })}
                        </div>

                        <button
                            type="submit"
                            disabled={processing}
                            className="mt-[18px] flex w-full items-center justify-center gap-2 rounded-[13px] bg-lime px-4 py-[15px] font-display text-[17px] font-extrabold tracking-[.03em] text-ink-900 uppercase italic transition-colors hover:bg-[#b8f032] disabled:opacity-60"
                        >
                            {recentlySuccessful ? (
                                <>
                                    <Check size={18} strokeWidth={3} />{' '}
                                    Submitted for review
                                </>
                            ) : (
                                'Submit for verification'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
