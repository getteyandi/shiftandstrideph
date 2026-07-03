import { Head, router, useForm } from '@inertiajs/react';
import { REGEXP_ONLY_DIGITS } from 'input-otp';
import { useEffect, useState } from 'react';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    InputOTP,
    InputOTPGroup,
    InputOTPSlot,
} from '@/components/ui/input-otp';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { login } from '@/routes';

type Props = {
    passwordRules: string;
    otpLength: number;
    otpTtlMinutes: number;
};

const RESEND_COOLDOWN = 60;

export default function Register({
    passwordRules,
    otpLength,
    otpTtlMinutes,
}: Props) {
    const [step, setStep] = useState<1 | 2>(1);
    const [cooldown, setCooldown] = useState(0);

    // Step 1 — account details.
    const details = useForm({
        first_name: '',
        last_name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    // Step 2 — the emailed one-time code.
    const verify = useForm({
        email: '',
        otp: '',
    });

    // Tick down the resend cooldown.
    useEffect(() => {
        if (cooldown <= 0) return;
        const id = setTimeout(() => setCooldown((c) => c - 1), 1000);
        return () => clearTimeout(id);
    }, [cooldown]);

    const submitDetails = (e: React.FormEvent) => {
        e.preventDefault();
        details.post('/register/otp', {
            preserveScroll: true,
            onSuccess: () => {
                verify.setData('email', details.data.email.trim());
                verify.setData('otp', '');
                setStep(2);
                setCooldown(RESEND_COOLDOWN);
            },
        });
    };

    const submitOtp = (e: React.FormEvent) => {
        e.preventDefault();
        // On success the server responds with a redirect to /login.
        verify.post('/register/verify', { preserveScroll: true });
    };

    const resend = () => {
        if (cooldown > 0 || details.processing) return;
        router.post(
            '/register/otp/resend',
            { email: verify.data.email },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setCooldown(RESEND_COOLDOWN);
                    verify.setData('otp', '');
                },
            },
        );
    };

    const backToDetails = () => {
        setStep(1);
        verify.clearErrors();
        verify.setData('otp', '');
    };

    return (
        <>
            <Head title="Register" />

            {step === 1 ? (
                <form onSubmit={submitDetails} className="flex flex-col gap-6">
                    <div className="grid gap-6">
                        <div className="grid gap-2">
                            <Label htmlFor="first_name">First Name</Label>
                            <Input
                                id="first_name"
                                type="text"
                                required
                                autoFocus
                                tabIndex={1}
                                autoComplete="given-name"
                                value={details.data.first_name}
                                onChange={(e) =>
                                    details.setData(
                                        'first_name',
                                        e.target.value,
                                    )
                                }
                                placeholder="John"
                            />
                            <InputError message={details.errors.first_name} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="last_name">Last Name</Label>
                            <Input
                                id="last_name"
                                type="text"
                                required
                                tabIndex={2}
                                autoComplete="family-name"
                                value={details.data.last_name}
                                onChange={(e) =>
                                    details.setData('last_name', e.target.value)
                                }
                                placeholder="Doe"
                            />
                            <InputError message={details.errors.last_name} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="email">Email address</Label>
                            <Input
                                id="email"
                                type="email"
                                required
                                tabIndex={3}
                                autoComplete="email"
                                value={details.data.email}
                                onChange={(e) =>
                                    details.setData('email', e.target.value)
                                }
                                placeholder="email@example.com"
                            />
                            <InputError message={details.errors.email} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="password">Password</Label>
                            <PasswordInput
                                id="password"
                                required
                                tabIndex={4}
                                autoComplete="new-password"
                                value={details.data.password}
                                onChange={(e) =>
                                    details.setData('password', e.target.value)
                                }
                                placeholder="Password"
                                passwordrules={passwordRules}
                            />
                            <InputError message={details.errors.password} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="password_confirmation">
                                Confirm password
                            </Label>
                            <PasswordInput
                                id="password_confirmation"
                                required
                                tabIndex={5}
                                autoComplete="new-password"
                                value={details.data.password_confirmation}
                                onChange={(e) =>
                                    details.setData(
                                        'password_confirmation',
                                        e.target.value,
                                    )
                                }
                                placeholder="Confirm password"
                                passwordrules={passwordRules}
                            />
                            <InputError
                                message={details.errors.password_confirmation}
                            />
                        </div>

                        <Button
                            type="submit"
                            className="mt-2 w-full rounded-xl bg-lime py-6 font-bold text-[#12150d] hover:bg-lime hover:brightness-95"
                            tabIndex={6}
                            disabled={details.processing}
                            data-test="register-user-button"
                        >
                            {details.processing && <Spinner />}
                            Continue
                        </Button>
                    </div>

                    <div className="text-center text-sm text-muted-foreground">
                        Already have an account?{' '}
                        <TextLink href={login()} tabIndex={7}>
                            Log in
                        </TextLink>
                    </div>
                </form>
            ) : (
                <form onSubmit={submitOtp} className="flex flex-col gap-6">
                    <p className="text-sm text-muted-foreground">
                        We sent a {otpLength}-digit verification code to{' '}
                        <span className="font-semibold text-ink">
                            {verify.data.email}
                        </span>
                        . Enter it below to finish creating your account — the
                        code expires in {otpTtlMinutes} minutes.
                    </p>

                    <div className="grid gap-2">
                        <Label htmlFor="otp">Verification code</Label>
                        <InputOTP
                            id="otp"
                            maxLength={otpLength}
                            pattern={REGEXP_ONLY_DIGITS}
                            value={verify.data.otp}
                            onChange={(value) => verify.setData('otp', value)}
                            autoFocus
                            containerClassName="justify-center"
                        >
                            <InputOTPGroup>
                                {Array.from({ length: otpLength }).map(
                                    (_, i) => (
                                        <InputOTPSlot
                                            key={i}
                                            index={i}
                                            className="h-12 w-12 text-lg"
                                        />
                                    ),
                                )}
                            </InputOTPGroup>
                        </InputOTP>
                        <InputError message={verify.errors.otp} />
                        <InputError message={verify.errors.email} />
                    </div>

                    <Button
                        type="submit"
                        className="w-full rounded-xl bg-lime py-6 font-bold text-[#12150d] hover:bg-lime hover:brightness-95"
                        disabled={
                            verify.processing ||
                            verify.data.otp.length < otpLength
                        }
                        data-test="verify-otp-button"
                    >
                        {verify.processing && <Spinner />}
                        Verify &amp; create account
                    </Button>

                    <div className="flex items-center justify-between text-sm">
                        <button
                            type="button"
                            onClick={backToDetails}
                            className="text-muted-foreground underline-offset-4 hover:underline"
                        >
                            Change details
                        </button>

                        <button
                            type="button"
                            onClick={resend}
                            disabled={cooldown > 0}
                            className="font-medium text-lime-deep underline-offset-4 hover:underline disabled:cursor-not-allowed disabled:text-muted-foreground disabled:no-underline"
                        >
                            {cooldown > 0
                                ? `Resend code in ${cooldown}s`
                                : 'Resend code'}
                        </button>
                    </div>
                </form>
            )}
        </>
    );
}

Register.layout = {
    title: 'Create an account',
    description: 'Enter your details below to create your account',
};
