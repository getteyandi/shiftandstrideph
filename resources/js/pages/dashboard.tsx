import { Head } from '@inertiajs/react';

export default function Dashboard({
    registrations,
}: any) {

    return (
        <>
            <Head title="Dashboard" />

            <div className="p-6">
                <h1 className="text-3xl font-bold mb-6">
                    My Dashboard
                </h1>

                {registrations.map(
                    (registration: any) => {

                        const completed =
                        Number(
                            registration.progress
                                ?.completed_km ?? 0
                        );

                        const target =
                            Number(
                                registration.event_category
                                    ?.target_km ?? 0
                            );

                        const displayCompleted =
                            Math.min(completed, target);

                        const percent =
                            target > 0
                                ? Math.min(
                                    100,
                                    (completed / target) * 100
                                )
                                : 0;

                        return (
                            <div
                                key={
                                    registration.id
                                }
                                className="border rounded p-4 mb-4"
                            >
                                <h2 className="font-bold">
                                    {
                                        registration
                                            .event_category
                                            ?.event
                                            ?.title
                                    }
                                </h2>

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
                                    Progress:
                                    {displayCompleted} / {target} km
                                </p>

                                <div className="w-full bg-gray-200 rounded h-4 mt-2">
                                    <div
                                        className="bg-green-600 h-4 rounded"
                                        style={{
                                            width:
                                                `${percent}%`,
                                        }}
                                    />
                                </div>

                                <p className="mt-2">
                                    {percent.toFixed(
                                        0
                                    )}
                                    %
                                    Complete
                                </p>
                            </div>
                        );
                    }
                )}
            </div>
        </>
    );
}