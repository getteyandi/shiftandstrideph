export default function Index({
    runs,
}: any) {
    return (
        <div className="p-6">
            <h1 className="text-3xl font-bold mb-6">
                My Runs
            </h1>

            {runs.length === 0 && (
                <p>
                    No run submissions yet.
                </p>
            )}

            {runs.map((run: any) => (
                <div
                    key={run.id}
                    className="border rounded p-4 mb-4"
                >
                    <p>
                        Distance:
                        {' '}
                        {run.distance}
                        {' '}
                        KM
                    </p>

                    <p>
                        Status:
                        {' '}
                        {run.status}
                    </p>

                    <p>
                        Notes:
                        {' '}
                        {run.notes || '-'}
                    </p>

                    <p>
                        Submitted:
                        {' '}
                        {new Date(
                            run.created_at
                        ).toLocaleDateString()}
                    </p>

                    {run.photo && (
                        <img
                            src={`/storage/${run.photo}`}
                            alt="Run Proof"
                            className="mt-3 h-48 rounded"
                        />
                    )}
                </div>
            ))}
        </div>
    );
}