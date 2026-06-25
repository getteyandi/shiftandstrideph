export default function Index({
    categories,
}: any) {
    return (
        <div className="p-6">
            <h1 className="text-3xl font-bold mb-6">
                Leaderboards
            </h1>

            {categories.map(
                (category: any) => {

                    const rankings =
                        [...category.registrations]
                            .sort(
                                (
                                    a: any,
                                    b: any
                                ) =>
                                    Number(
                                        b
                                            .progress
                                            ?.completed_km ??
                                            0
                                    ) -
                                    Number(
                                        a
                                            .progress
                                            ?.completed_km ??
                                            0
                                    )
                            );

                    return (
                        <div
                            key={category.id}
                            className="border rounded p-4 mb-6"
                        >
                            <h2 className="text-xl font-bold">
                                {
                                    category.event
                                        ?.title
                                }
                            </h2>

                            <p className="mb-4">
                                {
                                    category.name
                                }
                            </p>

                            {rankings.map(
                                (
                                    registration: any,
                                    index: number
                                ) => (
                                    <div
                                        key={
                                            registration.id
                                        }
                                        className="flex justify-between border-b py-2"
                                    >
                                        <span>
                                            #
                                            {index +
                                                1}
                                            {' '}
                                            {
                                                registration
                                                    .user
                                                    ?.first_name
                                            }
                                            {' '}
                                            {
                                                registration
                                                    .user
                                                    ?.last_name
                                            }
                                        </span>

                                        <span>
                                            {
                                                registration
                                                    .progress
                                                    ?.completed_km ??
                                                    0
                                            }
                                            {' '}
                                            KM
                                        </span>
                                    </div>
                                )
                            )}
                        </div>
                    );
                }
            )}
        </div>
    );
}