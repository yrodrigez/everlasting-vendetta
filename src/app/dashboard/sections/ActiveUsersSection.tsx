import { Card, CardBody, CardHeader } from "@/components/card";
import { WebEventsRepository } from "../web-events.repository";
import ActiveUsersChart from "../components/ActiveUsersChart";

interface Props {
    repository: WebEventsRepository;
}

export default async function ActiveUsersSection({ repository }: Props) {
    const [stats, dailyActiveUsers, raidSchedule] = await Promise.all([
        repository.getActiveUserStats(),
        repository.getDailyActiveUsers(),
        repository.getRaidSchedule(),
    ]);

    return (
        <Card className="bg-dark border border-dark-100 p-4">
            <CardHeader>
                <h2 className="text-xl font-bold text-default">Active Users (30d)</h2>
            </CardHeader>
            <CardBody>
                <div className="flex gap-6 mb-4 text-sm">
                    <div>
                        <span className="text-gray-400">DAU</span>
                        <p className="text-xl font-bold text-default">{stats.dau}</p>
                    </div>
                    <div>
                        <span className="text-gray-400">WAU</span>
                        <p className="text-xl font-bold text-default">{stats.wau}</p>
                    </div>
                    <div>
                        <span className="text-gray-400">MAU</span>
                        <p className="text-xl font-bold text-default">{stats.mau}</p>
                    </div>
                </div>
                <ActiveUsersChart data={dailyActiveUsers} raidSchedule={raidSchedule} />
            </CardBody>
        </Card>
    );
}
