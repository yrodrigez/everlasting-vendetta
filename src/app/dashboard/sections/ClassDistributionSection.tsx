import { Card, CardBody, CardHeader } from "@/components/card";
import { WebEventsRepository } from "../web-events.repository";
import ClassDistributionChart from "../components/ClassDistributionChart";

interface Props {
    repository: WebEventsRepository;
}

export default async function ClassDistributionSection({ repository }: Props) {
    const guildMembers = await repository.getGuildMembers();
    const classDistribution = repository.getClassDistribution(guildMembers);

    return (
        <Card className="bg-dark border border-dark-100 p-4">
            <CardHeader>
                <h2 className="text-xl font-bold text-gray-400">Class Distribution (Guild only)</h2>
            </CardHeader>
            <CardBody>
                <ClassDistributionChart data={classDistribution} />
            </CardBody>
        </Card>
    );
}
