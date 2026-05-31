import type { CharacterLogsData } from "@/lib/warcraft-logs/warcraft-logs.gateway";

function getRankPercentColor(rankPercent: number) {
    if (rankPercent === 100) return 'text-relic'
    if (rankPercent === 99) return 'text-pink'
    if (rankPercent >= 90) return 'text-legendary'
    if (rankPercent >= 75) return 'text-epic'
    if (rankPercent >= 45) return 'text-rare'
    if (rankPercent > 20) return 'text-uncommon'

    return 'text-gray-500'
}

export function CharacterLogs({ logs }: { logs: CharacterLogsData | null }) {
    const zoneRankings = logs?.character?.zoneRankings

    if (!zoneRankings) {
        return (
            <div className="flex h-full min-h-48 w-full items-center justify-center rounded border border-wood-100 bg-wood p-8 text-center text-muted">
                Warcraft Logs rankings are unavailable for this character.
            </div>
        )
    }

    const bestPerformanceAverage = Math.floor(zoneRankings.bestPerformanceAverage)
    const rankings = zoneRankings.rankings ?? []

    return (
        <div className="flex h-full min-h-0 w-full flex-col gap-4 overflow-auto rounded border border-wood-100 bg-wood p-4 scrollbar-pill sm:p-6">
            <section className="rounded-lg border border-wood-100 bg-wood-900 p-4">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-gold/80">Best performance average</p>
                <p className={`${getRankPercentColor(bestPerformanceAverage)} mt-2 text-5xl font-bold leading-none`}>
                    {bestPerformanceAverage}
                </p>
            </section>

            <section className="min-h-0 rounded-lg border border-wood-100 bg-wood-900">
                <div className="grid grid-cols-[minmax(0,1fr)_120px_72px] gap-3 border-b border-wood-100 px-4 py-3 text-xs font-bold uppercase tracking-[0.14em] text-muted">
                    <span>Encounter</span>
                    <span>Spec</span>
                    <span className="text-right">Rank</span>
                </div>

                {rankings.length ? rankings.map((ranking) => {
                    const rankPercent = Math.floor(ranking.rankPercent)

                    return (
                        <div
                            key={`${ranking.encounter.id}-${ranking.spec}`}
                            className="grid grid-cols-[minmax(0,1fr)_120px_72px] gap-3 border-b border-wood-100 px-4 py-3 last:border-b-0"
                        >
                            <span className={`truncate text-primary flex gap-1.5 items-center ${getRankPercentColor(rankPercent)}`}>
                                <img
                                    src={`https://assets.rpglogs.com/img/warcraft/bosses/${ranking.encounter.id - 100_000}-icon.jpg?v=4`}
                                    alt={ranking.encounter.name}
                                    width={28}
                                    height={28}
                                    className={`h-8 w-8 flex-shrink-0 rounded-md object-cover ${getRankPercentColor(rankPercent).replace('text-', 'border-')} border`}
                                />
                                {ranking.encounter.name}
                                </span>
                            <span className="truncate text-muted">{ranking.spec}</span>
                            <span className={`${getRankPercentColor(rankPercent)} text-right font-bold`}>
                                {rankPercent}
                            </span>
                        </div>
                    )
                }) : (
                    <div className="px-4 py-8 text-center text-muted">No rankings found for this character.</div>
                )}
            </section>
        </div>
    )
}
