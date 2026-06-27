import { Head, useForm } from '@inertiajs/react';
import { useState, type ReactNode } from 'react';
import { Camera, Check, ArrowRight } from 'lucide-react';

interface Props {
    user: {
        first_name: string;
        last_name: string;
        email: string;
    };
    genders: string[];
    islands: string[];
}

interface FormData {
    birthday: string;
    gender: string;
    province: string;
    city: string;
    island: string;
    address: string;
    profile_photo: File | null;
    [key: string]: string | File | null;
}

export default function Onboarding({ user, genders, islands }: Props) {
    const [preview, setPreview] = useState<string | null>(null);

    const { data, setData, post, processing, errors } = useForm<FormData>({
        birthday: '',
        gender: '',
        province: '',
        city: '',
        island: '',
        address: '',
        profile_photo: null,
    });

    const onPhoto = (file?: File) => {
        if (!file) return;
        setData('profile_photo', file);
        setPreview(URL.createObjectURL(file));
    };

    const submit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        post('/onboarding', { forceFormData: true });
    };

    return (
        <div className="min-h-svh bg-surface">
            <Head title="Complete your profile" />

            <div className="mx-auto grid min-h-svh max-w-6xl gap-0 lg:grid-cols-[0.9fr_1.1fr]">
                {/* BRAND PANEL */}
                <div className="relative hidden overflow-hidden bg-[linear-gradient(155deg,#12150d,#090b08)] p-12 text-white lg:flex lg:flex-col lg:justify-between">
                    <div className="absolute right-0 top-0 h-96 w-96 rounded-full bg-lime/10 blur-3xl" />
                    <div className="relative flex items-center gap-3">
                        <img
                            src="/assets/logo.png"
                            alt="Shift & Stride PH"
                            className="h-12 w-12 rounded-xl object-cover"
                        />
                        <div className="font-display text-lg font-extrabold uppercase italic">
                            Shift <span className="text-lime">&amp;</span> Stride
                            <span className="ml-px align-super text-xs text-lime">
                                PH
                            </span>
                        </div>
                    </div>

                    <div className="relative">
                        <div className="text-xs font-bold uppercase tracking-[.25em] text-lime">
                            Welcome, {user.first_name}
                        </div>
                        <h1 className="mt-3 max-w-md font-display text-5xl font-black italic leading-[1.05]">
                            ONE LAST
                            <span className="text-lime"> STEP.</span>
                        </h1>
                        <p className="mt-4 max-w-sm text-[#98A08E]">
                            Complete your runner profile so we can place you on
                            the right leaderboards and issue your runner code.
                        </p>
                    </div>

                    <p className="relative text-xs text-[#6f7665]">
                        © {new Date().getFullYear()} Shift &amp; Stride PH
                    </p>
                </div>

                {/* FORM */}
                <div className="flex items-center justify-center p-6 md:p-12">
                    <form
                        onSubmit={submit}
                        className="w-full max-w-md space-y-7"
                    >
                        <div className="lg:hidden">
                            <h1 className="font-display text-4xl font-black italic text-ink">
                                Complete your profile
                            </h1>
                        </div>

                        {/* Photo */}
                        <div className="flex flex-col items-center gap-3">
                            <label className="group relative h-28 w-28 cursor-pointer overflow-hidden rounded-3xl border-2 border-dashed border-line bg-card transition hover:border-lime">
                                {preview ? (
                                    <img
                                        src={preview}
                                        alt="Profile preview"
                                        className="h-full w-full object-cover"
                                    />
                                ) : (
                                    <span className="flex h-full w-full flex-col items-center justify-center gap-1 text-muted">
                                        <Camera size={26} className="text-lime" />
                                        <span className="text-xs font-semibold">
                                            Add photo
                                        </span>
                                    </span>
                                )}
                                <input
                                    type="file"
                                    accept="image/*"
                                    className="sr-only"
                                    onChange={(e) =>
                                        onPhoto(e.target.files?.[0])
                                    }
                                />
                            </label>
                            <span className="text-xs font-semibold text-muted">
                                Profile photo (required)
                            </span>
                            {errors.profile_photo && (
                                <p className="text-sm font-medium text-red-500">
                                    {errors.profile_photo}
                                </p>
                            )}
                        </div>

                        <Field label="Birthday" error={errors.birthday}>
                            <input
                                type="date"
                                value={data.birthday}
                                max={new Date().toISOString().slice(0, 10)}
                                onChange={(e) =>
                                    setData('birthday', e.target.value)
                                }
                                className="w-full rounded-xl border border-line bg-white px-4 py-3 outline-none transition focus:border-lime focus:ring-4 focus:ring-lime/10"
                            />
                        </Field>

                        <Field label="Gender" error={errors.gender}>
                            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                                {genders.map((g) => {
                                    const on = data.gender === g;
                                    return (
                                        <button
                                            key={g}
                                            type="button"
                                            onClick={() => setData('gender', g)}
                                            className={`flex items-center justify-center gap-1.5 rounded-xl border px-3 py-3 text-sm font-semibold transition ${
                                                on
                                                    ? 'border-lime bg-[#F7FCEB] text-ink'
                                                    : 'border-line bg-white text-muted hover:border-lime'
                                            }`}
                                        >
                                            {on && (
                                                <Check
                                                    size={14}
                                                    className="text-lime-deep"
                                                />
                                            )}
                                            {g}
                                        </button>
                                    );
                                })}
                            </div>
                        </Field>

                        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                            <Field label="Province" error={errors.province}>
                                <input
                                    type="text"
                                    value={data.province}
                                    placeholder="Davao del Sur"
                                    onChange={(e) =>
                                        setData('province', e.target.value)
                                    }
                                    className="w-full rounded-xl border border-line bg-white px-4 py-3 outline-none transition focus:border-lime focus:ring-4 focus:ring-lime/10"
                                />
                            </Field>

                            <Field label="City" error={errors.city}>
                                <input
                                    type="text"
                                    value={data.city}
                                    placeholder="Davao City"
                                    onChange={(e) =>
                                        setData('city', e.target.value)
                                    }
                                    className="w-full rounded-xl border border-line bg-white px-4 py-3 outline-none transition focus:border-lime focus:ring-4 focus:ring-lime/10"
                                />
                            </Field>
                        </div>

                        <Field
                            label="Shipping Address"
                            error={errors.address}
                        >
                            <textarea
                                rows={2}
                                value={data.address}
                                placeholder="House no., street, barangay, city, ZIP — where prizes/merch ship to"
                                onChange={(e) =>
                                    setData('address', e.target.value)
                                }
                                className="w-full resize-y rounded-xl border border-line bg-white px-4 py-3 outline-none transition focus:border-lime focus:ring-4 focus:ring-lime/10"
                            />
                        </Field>

                        <Field label="Island Group" error={errors.island}>
                            <div className="grid grid-cols-3 gap-2">
                                {islands.map((isl) => {
                                    const on = data.island === isl;
                                    return (
                                        <button
                                            key={isl}
                                            type="button"
                                            onClick={() =>
                                                setData('island', isl)
                                            }
                                            className={`rounded-xl border px-3 py-3 text-sm font-semibold transition ${
                                                on
                                                    ? 'border-lime bg-[#F7FCEB] text-ink'
                                                    : 'border-line bg-white text-muted hover:border-lime'
                                            }`}
                                        >
                                            {isl}
                                        </button>
                                    );
                                })}
                            </div>
                        </Field>

                        <button
                            type="submit"
                            disabled={processing}
                            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-lime px-7 py-4 font-bold text-[#12150d] transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {processing ? 'Saving…' : 'Finish & Enter'}
                            <ArrowRight size={18} />
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}

function Field({
    label,
    error,
    children,
}: {
    label: string;
    error?: string;
    children: ReactNode;
}) {
    return (
        <div className="space-y-2">
            <label className="block text-sm font-bold text-ink">{label}</label>
            {children}
            {error && (
                <p className="text-sm font-medium text-red-500">{error}</p>
            )}
        </div>
    );
}

// Standalone full-screen page — bypass the app shell/nav during onboarding.
Onboarding.layout = (page: ReactNode) => page;
