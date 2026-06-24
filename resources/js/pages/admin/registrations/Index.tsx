import { router } from '@inertiajs/react';

export default function Index({
    registrations,
}: any) {
    const approve = (id: number) => {
        router.patch(
            `/admin/registrations/${id}/approve`
        );
    };

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-6">
                Admin Registrations
            </h1>

            {registrations.map(
                (registration: any) => (
                    <div
                        key={registration.id}
                        className="border p-4 mb-4 rounded"
                    >
                        <p>
                            User:
                            {' '}
                            {registration.user.first_name}
                            {' '}
                            {registration.user.last_name}
                        </p>

                        <p>
                            Event:
                            {' '}
                            {
                                registration
                                    .event_category
                                    ?.event?.title
                            }
                        </p>

                        <p>
                            Category:
                            {' '}
                            {
                                registration
                                    .event_category
                                    ?.name
                            }
                        </p>

                        <p>
                            Status:
                            {' '}
                            {registration.status}
                        </p>

                        {registration.status ===
                            'pending' && (
                            <button
                                onClick={() =>
                                    approve(
                                        registration.id
                                    )
                                }
                                className="mt-2 bg-green-600 text-white px-4 py-2 rounded"
                            >
                                Approve
                            </button>
                        )}
                    </div>
                )
            )}
        </div>
    );
}