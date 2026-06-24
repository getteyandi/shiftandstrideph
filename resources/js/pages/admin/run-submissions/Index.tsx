import { router } from '@inertiajs/react';

export default function Index({
    submissions,
}: any) {
    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-6">
                Run Submissions
            </h1>

            {submissions.map(
                (submission: any) => (
                    <div
                        key={submission.id}
                        className="border p-4 rounded mb-4"
                    >
                        <p>
                            Runner:
                            {' '}
                            {submission.user.first_name}
                            {' '}
                            {submission.user.last_name}
                        </p>

                        <p>
                            Distance:
                            {' '}
                            {submission.distance}
                            km
                        </p>

                        <p>
                            Status:
                            {' '}
                            {submission.status}
                        </p>

                        <p>
                            Notes:
                            {' '}
                            {submission.notes}
                        </p>

                        <img
                            src={`/storage/${submission.photo}`}
                            alt="Run Proof"
                            className="mt-2 h-48 rounded"
                        />

                        {submission.status ===
                            'pending' && (
                            <div className="flex gap-2 mt-4">
                                <button
                                    onClick={() =>
                                        router.patch(
                                            `/admin/run-submissions/${submission.id}/approve`
                                        )
                                    }
                                    className="bg-green-600 text-white px-4 py-2 rounded"
                                >
                                    Approve
                                </button>

                                <button
                                    onClick={() =>
                                        router.patch(
                                            `/admin/run-submissions/${submission.id}/reject`
                                        )
                                    }
                                    className="bg-red-600 text-white px-4 py-2 rounded"
                                >
                                    Reject
                                </button>
                            </div>
                        )}
                    </div>
                )
            )}
        </div>
    );
}