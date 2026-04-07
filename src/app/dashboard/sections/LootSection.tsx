import { Card, CardBody, CardHeader } from "@/components/card";
import { WebEventsRepository } from "../web-events.repository";
import TopLootByRaid from "../components/TopLootByRaid";

interface Props {
    repository: WebEventsRepository;
    guildMembersPromise: Promise<Awaited<ReturnType<WebEventsRepository["getGuildMembers"]>>>;
}

export default async function LootSection({ repository, guildMembersPromise }: Props) {
    const guildMembers = await guildMembersPromise;
    const topLootByRaid = await repository.getTopLootByRaid(guildMembers);

    return (
        <Card className="bg-dark border border-dark-100 p-4">
            <CardHeader>
                <h2 className="text-xl font-bold text-gray-400">Top Loot Receivers (by Raid)</h2>
            </CardHeader>
            <CardBody>
                <TopLootByRaid raids={topLootByRaid} />
            </CardBody>
        </Card>
    );
}
