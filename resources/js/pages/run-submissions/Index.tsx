import { useForm } from '@inertiajs/react';

export default function Index({
    registrations,
}: any) {

    const { data, setData, post, processing } =
        useForm({
            distance: '',
            photo: null as File | null,
            notes: '',
        });

    const submit = (e: React.FormEvent) => {
    e.preventDefault();

        post('/run-submissions', {
            forceFormData: true,
        });
    };

    
    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-6">
                Submit Run
            </h1>

            <h2 className="font-semibold mb-4">
                Approved Events
            </h2>

            {registrations.map(
                (registration: any) => (
                    <div
                        key={registration.id}
                        className="border p-3 mb-2"
                    >
                        <p>
                            {
                                registration
                                    .event_category
                                    ?.event?.title
                            }
                        </p>

                        <p>
                            {
                                registration
                                    .event_category
                                    ?.name
                            }
                        </p>
                    </div>
                )
            )}

            <form
                onSubmit={submit}
                className="mt-6 space-y-4"
            >
                <input
                    type="number"
                    step="0.01"
                    placeholder="Distance (KM)"
                    value={data.distance}
                    onChange={(e) =>
                        setData(
                            'distance',
                            e.target.value
                        )
                    }
                    className="border p-2 w-full"
                />

                <input
                    type="file"
                    accept="image/*"
                    onChange={(e) =>
                        setData(
                            'photo',
                            e.target.files?.[0] ??
                                null
                        )
                    }
                />

                <textarea
                    placeholder="Notes"
                    value={data.notes}
                    onChange={(e) =>
                        setData(
                            'notes',
                            e.target.value
                        )
                    }
                    className="border p-2 w-full"
                />

                <button
                    type="submit"
                    disabled={processing}
                    className="bg-blue-600 text-white px-4 py-2 rounded"
                >
                    Submit Run
                </button>
            </form>
        </div>
    );
}
