'use client';

type UserRow = {
    userId: string;
    name: string;
    avatar: string;
    eventCount: number;
};

type Props = {
    users: UserRow[];
};

export default function TopUsersTable({ users }: Props) {
    if (users.length === 0) {
        return <p className="text-gray-400">No user activity data available.</p>;
    }

    return (
        <div className="overflow-x-auto max-h-[350px] overflow-y-auto scrollbar-pill">
            <table className="w-full text-sm">
                <thead className="sticky top-0 bg-dark">
                    <tr className="text-left text-gray-400 border-b border-dark-100">
                        <th className="pb-2 pr-4">#</th>
                        <th className="pb-2 pr-4">User</th>
                        <th className="pb-2 text-right">Events</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map((user, i) => (
                        <tr key={user.userId} className="border-b border-dark-100/50">
                            <td className="py-2 pr-4 text-gray-400">{i + 1}</td>
                            <td className="py-2 pr-4">
                                <div className="flex items-center gap-2">
                                    <img
                                        src={user.avatar || '/avatar-anon.png'}
                                        alt={user.name}
                                        width={28}
                                        height={28}
                                        className="rounded-full w-7 h-7 border border-dark-100"
                                    />
                                    <span className={`truncate max-w-[180px] text-default`}>{user.name}</span>
                                </div>
                            </td>
                            <td className="py-2 text-right font-mono text-gray-400">{user.eventCount.toLocaleString()}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
