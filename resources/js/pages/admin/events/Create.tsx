import { Head, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import EventForm, {
    EventFormData,
} from '@/components/admin/EventForm';

export default function Create() {
    const { data, setData, post, processing, errors } =
        useForm<EventFormData>({
            name: '',
            description: '',
            location: '',

            banner: null,

            registration_start: '',
            registration_end: '',

            start_date: '',
            end_date: '',

            status: 'upcoming',
        });

    function submit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();

        post('/admin/events', {
            forceFormData: true,
        });
    }

    return (
        <div>
            <Head title="Create Event" />

            <div className="mx-auto max-w-7xl space-y-8 p-6">

                {/* Hero */}

                <div className="relative overflow-hidden rounded-[28px] border border-[#2a3120] bg-[linear-gradient(145deg,#12150d,#090b08)] p-8">

                    <div
                        className="pointer-events-none absolute inset-0"
                        style={{
                            background:
                                'radial-gradient(400px 250px at 100% 0,rgba(166,226,18,.15),transparent 60%)',
                        }}
                    />

                    <div className="relative">

                        <div className="text-xs font-bold tracking-[.25em] uppercase text-lime">
                            Administration
                        </div>

                        <h1 className="mt-2 font-display text-5xl font-black italic text-white">
                            CREATE EVENT
                        </h1>

                        <p className="mt-3 max-w-xl text-[#98A08E]">
                            Build a new virtual running event for
                            Shift & Stride PH.
                        </p>

                    </div>

                </div>

                <EventForm
                    data={data}
                    setData={setData}
                    errors={errors}
                    processing={processing}
                    submit={submit}
                    submitLabel="Create Event"
                />

            </div>
            </div>
    );
}

Create.layout = (page: React.ReactNode) => (
    <AppLayout active="events">{page}</AppLayout>
);