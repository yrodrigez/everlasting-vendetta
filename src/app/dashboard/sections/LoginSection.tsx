import { Card, CardBody, CardHeader } from "@/components/card";
import { WebEventsRepository } from "../web-events.repository";
import LoginBreakdownChart from "../components/LoginBreakdownChart";

interface Props {
    repository: WebEventsRepository;
}

export default async function LoginSection({ repository }: Props) {
    const { totalBnet, totalDiscord } = await repository.getLoginBreakdown();

    return (
        <Card className="bg-dark border border-dark-100 p-4">
            <CardHeader>
                <h2 className="text-xl font-bold text-gray-400">Login Methods (30d)</h2>
            </CardHeader>
            <CardBody>
                <LoginBreakdownChart bnet={totalBnet} discord={totalDiscord} />
            </CardBody>
        </Card>
    );
}
