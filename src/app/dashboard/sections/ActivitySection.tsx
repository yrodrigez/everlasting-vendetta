import { Card, CardBody, CardHeader } from "@/components/card";
import { WebEventsRepository } from "../web-events.repository";
import TopUsersTable from "../components/TopUsersTable";
import RecentEventsFeed from "../components/RecentEventsFeed";

interface Props {
    repository: WebEventsRepository;
}

export default async function ActivitySection({ repository }: Props) {
    const [topUsersWithProfiles, recentEvents] = await Promise.all([
        repository.getTopUsersWithProfiles(),
        repository.getRecentEvents(),
    ]);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card className="bg-dark border border-dark-100 p-4">
                <CardHeader>
                    <h2 className="text-xl font-bold text-gray-400">Top Active Users</h2>
                </CardHeader>
                <CardBody>
                    <TopUsersTable users={topUsersWithProfiles} />
                </CardBody>
            </Card>

            <Card className="bg-dark border border-dark-100 p-4">
                <CardHeader>
                    <h2 className="text-xl font-bold text-gray-400">Recent Events</h2>
                </CardHeader>
                <CardBody>
                    <RecentEventsFeed events={recentEvents} />
                </CardBody>
            </Card>
        </div>
    );
}
