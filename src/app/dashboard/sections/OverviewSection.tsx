import { WebEventsRepository } from "../web-events.repository";
import OverviewCards from "../components/OverviewCards";

interface Props {
    repository: WebEventsRepository;
}

export default async function OverviewSection({ repository }: Props) {
    const [overview, stats] = await Promise.all([
        repository.getOverviewCounts(),
        repository.getActiveUserStats(),
    ]);

    return (
        <OverviewCards
            eventsToday={overview.eventsToday}
            events7d={overview.events7d}
            events30d={overview.events30d}
            uniqueUsers={stats.mau}
            pageViews={overview.pageViews30d}
        />
    );
}
