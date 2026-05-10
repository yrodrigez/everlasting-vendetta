import { Button } from "@/components/Button";
import type { PredictionMarketDetails, PredictionPledgeDetails } from "@/lib/api";
import { MarketCard } from "./market-card";
import type { MarketFilter } from "./vx-exchange.types";

export function MarketGrid({
    markets,
    totalMarketCount,
    filter,
    availableFilters,
    bets,
    onFilterChange,
    onOpenMarket,
}: {
    markets: PredictionMarketDetails[];
    totalMarketCount: number;
    filter: MarketFilter;
    availableFilters: MarketFilter[];
    bets: PredictionPledgeDetails[] | undefined;
    onFilterChange: (filter: MarketFilter) => void;
    onOpenMarket: (marketId: string) => void;
}) {
    return (
        <section className="space-y-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-wrap gap-2">
                    {availableFilters.map((item) => (
                        <Button
                            key={item}
                            size="sm"
                            onPress={() => onFilterChange(item)}
                            className={filter === item ? "border-moss-100 bg-moss text-gold" : "border-wood-100 bg-wood text-default/70 hover:text-gold"}
                        >
                            {item}
                        </Button>
                    ))}
                </div>
                <p className="text-xs font-semibold text-default/50">{markets.length} of {totalMarketCount} markets</p>
            </div>

            {markets.length ? (
                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                    {markets.map((market) => (
                        <MarketCard key={market.id} market={market} bets={bets} onOpen={() => onOpenMarket(market.id)} />
                    ))}
                </div>
            ) : (
                <div className="rounded-2xl border border-dashed border-wood-100 bg-wood p-10 text-center text-default/60">
                    No markets match this filter.
                </div>
            )}
        </section>
    );
}
