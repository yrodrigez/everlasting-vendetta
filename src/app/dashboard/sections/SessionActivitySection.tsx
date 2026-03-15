import { Card, CardBody, CardHeader } from "@/components/card";
import { WebEventsRepository } from "../web-events.repository";
import SessionActivityChart from "../components/SessionActivityChart";

interface Props {
    repository: WebEventsRepository;
}

export default async function SessionActivitySection({ repository }: Props) {
    const { refreshTrend, revokeTrend } = await repository.getSessionActivity();

    return (
        <Card className="bg-dark border border-dark-100 p-4">
            <CardHeader>
                <h2 className="text-xl font-bold text-gray-400">Session Activity (30d)</h2>
            </CardHeader>
            <CardBody>
                <SessionActivityChart refreshData={refreshTrend} revokeData={revokeTrend} />
            </CardBody>
        </Card>
    );
}
