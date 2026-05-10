import { Card, CardBody } from "@/components/card";
import type { PredictionMarketDetails, PredictionPledgeDetails } from "@/lib/api";
import { StatusBadge } from "./status-badge";
import { formatEvx, getBetResult, getMarketBet, getResolvedOutcome, isMarketBettable } from "./vx-exchange.utils";

export function MarketCard({ market, bets, onOpen }: { market: PredictionMarketDetails; bets: PredictionPledgeDetails[] | undefined; onOpen: () => void }) {
    const outcomes = market.outcomes.slice().sort((a, b) => a.sortOrder - b.sortOrder);
    const topOutcomes = outcomes.slice(0, 2);
    const bettable = isMarketBettable(market);
    const resolvedOutcome = getResolvedOutcome(market);
    const bet = getMarketBet(market, bets);
    const betResult = getBetResult(market, bet);

    return (
        <Card
            isPressable
            onPress={onOpen}
            className="group min-h-[190px] border border-wood-100 bg-wood text-left shadow-lg shadow-black/20 transition hover:-translate-y-0.5 hover:border-gold/45 hover:shadow-gold hover:shadow-lg duration-300 rounded-md"
        >
            <CardBody className="flex h-full flex-col p-4 gap-4">
                <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                        <h2 className="line-clamp-2 text-base font-black leading-5 text-default">{market.title}</h2>
                        <div className="mt-2 flex flex-wrap items-center gap-2">
                            <StatusBadge status={market.status} outcome={resolvedOutcome?.label} />
                            {bettable ? <span className="text-xs font-bold text-emerald-300">Bettings open</span> : null}
                        </div>
                    </div>
                    <div className="shrink-0 text-right">
                        <p className="text-xl font-black text-default">{Math.round((outcomes[0]?.impliedProbability ?? 0) * 100)}%</p>
                    </div>
                </div>

                <div className="mt-4 space-y-2">
                    {topOutcomes.map((outcome) => (
                        <div key={outcome.id} className="flex items-center justify-between gap-3 text-sm">
                            <span className="line-clamp-1 font-semibold text-default/70">{outcome.label}</span>
                            <span className="font-black text-default">{Math.round(outcome.impliedProbability * 100)}%</span>
                        </div>
                    ))}
                </div>

                {bet ? (
                    <div className="mt-auto rounded-lg border border-gold bg-moss p-3 text-sm">
                        <div className="flex items-center justify-between gap-3">
                            <span className="line-clamp-1 font-bold text-default/75">Your bet: {bet.outcomeLabel}</span>
                            {betResult ? <span className={`font-black ${betResult.className}`}>{betResult.label}</span> : null}
                        </div>
                        <p className="mt-1 text-xs font-black text-gold">{`${formatEvx(bet.amount)}`}</p>
                    </div>
                ) : null}

                <div className="mt-auto">
                    <div className="flex items-center justify-between text-xs text-default/50">
                        <span>{formatEvx(market.totalPool)} Vol.</span>
                        <span>{market.pledgeCount} bets</span>
                    </div>
                </div>
            </CardBody>
        </Card>
    );
}
