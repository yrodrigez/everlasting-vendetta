import { WebEventsRepository } from "../web-events.repository";
import OverviewCards from "../components/OverviewCards";

interface Props {
    repository: WebEventsRepository;
    activeUserStatsPromise: Promise<{ dau: number; wau: number; mau: number }>;
}

export default async function OverviewSection({ repository, activeUserStatsPromise }: Props) {
    const [overview, stats] = await Promise.all([
        repository.getOverviewCounts(),
        activeUserStatsPromise,
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
