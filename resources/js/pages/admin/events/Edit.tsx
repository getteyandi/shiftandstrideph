import { Head, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import EventForm, {
    EventFormData,
} from '@/components/admin/EventForm';

interface Event {
    id: number;
    name: string;
    description: string;
    location: string;
    banner: string | null;
    registration_start: string | null;
    registration_end: string | null;
    start_date: string | null;
    end_date: string | null;
    status: EventFormData['status'];
}

/** ISO string -> "YYYY-MM-DDTHH:mm" for <input type="datetime-local">. */
const toDateTimeLocal = (value: string | null) =>
    value ? value.slice(0, 16) : '';

/** ISO string -> "YYYY-MM-DD" for <input type="date">. */
const toDate = (value: string | null) =>
    value ? value.slice(0, 10) : '';

export default function Edit({ event }: { event: Event }) {
    const { data, setData, transform, post, processing, errors } =
        useForm<EventFormData>({
            name: event.name ?? '',
            description: event.description ?? '',
            location: event.location ?? '',

            banner: null,

            registration_start: toDateTimeLocal(event.registration_start),
            registration_end: toDateTimeLocal(event.registration_end),

            start_date: toDate(event.start_date),
            end_date: toDate(event.end_date),

            status: event.status ?? 'upcoming',
        });

    function submit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();

        // Method spoofing so the banner file upload survives the PUT.
        transform((current) => ({ ...current, _method: 'put' }));

        post(`/admin/events/${event.id}`, {
            forceFormData: true,
        });
    }

    return (
        <div>
            <Head title={`Edit · ${event.name}`} />

            <div className="mx-auto max-w-7xl space-y-8 p-6">

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
                            EDIT EVENT
                        </h1>
                        <p className="mt-3 max-w-xl text-[#98A08E]">
                            Update the details for {event.name}.
                        </p>
                    </div>
                </div>

                <EventForm
                    data={data}
                    setData={setData}
                    errors={errors}
                    processing={processing}
                    submit={submit}
                    currentBanner={event.banner}
                    submitLabel="Save Changes"
                />
            </div>
        </div>
    );
}

Edit.layout = (page: React.ReactNode) => (
    <AppLayout active="events">{page}</AppLayout>
);
