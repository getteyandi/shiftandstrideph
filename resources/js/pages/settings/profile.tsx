import { Head, useForm, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { Camera } from 'lucide-react';

import DeleteUser from '@/components/delete-user';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';

const GENDERS = ['Male', 'Female', 'Prefer not to say'];
const ISLANDS = ['Luzon', 'Visayas', 'Mindanao'];

interface ProfileForm {
    first_name: string;
    last_name: string;
    email: string;
    gender: string;
    birthday: string;
    province: string;
    city: string;
    island: string;
    address: string;
    profile_photo: File | null;
    [key: string]: string | File | null;
}

export default function Profile() {
    const { auth } = usePage().props as any;
    const user = auth.user;

    const [preview, setPreview] = useState<string | null>(
        user.profile_photo ? `/storage/${user.profile_photo}` : null,
    );

    const { data, setData, transform, post, processing, errors } =
        useForm<ProfileForm>({
            first_name: user.first_name ?? '',
            last_name: user.last_name ?? '',
            email: user.email ?? '',
            gender: user.gender ?? '',
            birthday: user.birthday ? String(user.birthday).slice(0, 10) : '',
            province: user.province ?? '',
            city: user.city ?? '',
            island: user.island ?? '',
            address: user.address ?? '',
            profile_photo: null,
        });

    const onPhoto = (file?: File) => {
        if (!file) return;
        setData('profile_photo', file);
        setPreview(URL.createObjectURL(file));
    };

    const submit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        transform((d) => ({ ...d, _method: 'patch' }));
        post('/settings/profile', { forceFormData: true });
    };

    return (
        <>
            <Head title="Profile settings" />

            <div className="space-y-6">
                <Heading
                    variant="small"
                    title="Profile"
                    description="Update your details, shipping address, and profile photo"
                />

                <form onSubmit={submit} className="space-y-6">
                    {/* photo */}
                    <div className="flex items-center gap-4">
                        <label className="group relative h-20 w-20 shrink-0 cursor-pointer overflow-hidden rounded-2xl border-2 border-dashed border-line bg-card transition hover:border-lime">
                            {preview ? (
                                <img
                                    src={preview}
                                    alt="Profile"
                                    className="h-full w-full object-cover"
                                />
                            ) : (
                                <span className="flex h-full w-full items-center justify-center text-lime">
                                    <Camera size={22} />
                                </span>
                            )}
                            <input
                                type="file"
                                accept="image/*"
                                className="sr-only"
                                onChange={(e) => onPhoto(e.target.files?.[0])}
                            />
                        </label>
                        <div>
                            <div className="text-sm font-semibold text-ink">
                                Profile photo
                            </div>
                            <div className="text-xs text-muted">
                                Click the avatar to upload a new one.
                            </div>
                            <InputError
                                className="mt-1"
                                message={errors.profile_photo}
                            />
                        </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <Field label="First name" error={errors.first_name}>
                            <Input
                                value={data.first_name}
                                onChange={(e) =>
                                    setData('first_name', e.target.value)
                                }
                            />
                        </Field>
                        <Field label="Last name" error={errors.last_name}>
                            <Input
                                value={data.last_name}
                                onChange={(e) =>
                                    setData('last_name', e.target.value)
                                }
                            />
                        </Field>
                    </div>

                    <Field label="Email address" error={errors.email}>
                        <Input
                            type="email"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                        />
                    </Field>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <Field label="Gender" error={errors.gender}>
                            <select
                                value={data.gender}
                                onChange={(e) =>
                                    setData('gender', e.target.value)
                                }
                                className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm shadow-xs"
                            >
                                <option value="">Select…</option>
                                {GENDERS.map((g) => (
                                    <option key={g} value={g}>
                                        {g}
                                    </option>
                                ))}
                            </select>
                        </Field>
                        <Field label="Birthday" error={errors.birthday}>
                            <Input
                                type="date"
                                value={data.birthday}
                                max={new Date().toISOString().slice(0, 10)}
                                onChange={(e) =>
                                    setData('birthday', e.target.value)
                                }
                            />
                        </Field>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <Field label="Province" error={errors.province}>
                            <Input
                                value={data.province}
                                onChange={(e) =>
                                    setData('province', e.target.value)
                                }
                            />
                        </Field>
                        <Field label="City" error={errors.city}>
                            <Input
                                value={data.city}
                                onChange={(e) =>
                                    setData('city', e.target.value)
                                }
                            />
                        </Field>
                    </div>

                    <Field label="Island group" error={errors.island}>
                        <div className="grid grid-cols-3 gap-2">
                            {ISLANDS.map((isl) => {
                                const on = data.island === isl;
                                return (
                                    <button
                                        key={isl}
                                        type="button"
                                        onClick={() => setData('island', isl)}
                                        className={`rounded-md border px-3 py-2 text-sm font-semibold transition ${
                                            on
                                                ? 'border-lime bg-lime/15 text-foreground'
                                                : 'border-input text-muted-foreground hover:border-lime'
                                        }`}
                                    >
                                        {isl}
                                    </button>
                                );
                            })}
                        </div>
                    </Field>

                    <Field
                        label="Shipping address"
                        error={errors.address}
                    >
                        <textarea
                            rows={2}
                            value={data.address}
                            onChange={(e) => setData('address', e.target.value)}
                            className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none"
                        />
                    </Field>

                    <div className="flex items-center gap-4">
                        <Button
                            disabled={processing}
                            data-test="update-profile-button"
                        >
                            Save
                        </Button>
                    </div>
                </form>
            </div>

            <DeleteUser />
        </>
    );
}

function Field({
    label,
    error,
    children,
}: {
    label: string;
    error?: string;
    children: React.ReactNode;
}) {
    return (
        <div className="grid gap-2">
            <Label>{label}</Label>
            {children}
            <InputError message={error} />
        </div>
    );
}

Profile.layout = (page: React.ReactNode) => (
    <AppLayout>
        <SettingsLayout>{page}</SettingsLayout>
    </AppLayout>
);
