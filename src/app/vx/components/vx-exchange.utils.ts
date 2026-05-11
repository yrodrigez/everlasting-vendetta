import type { PredictionMarketDetails, PredictionMarketType, PredictionPledgeDetails } from "@/lib/api";
import type { MarketFilter } from "./vx-exchange.types";

export const MIN_BET = 50;
export const MAX_BET = 1000;

export function formatEvx(value: number | undefined) {
    return `${new Intl.NumberFormat("en-US").format(value ?? 0)} EVX`;
}

export function formatDate(value: string) {
    return new Intl.DateTimeFormat("en-GB", {
        dateStyle: "medium",
        timeStyle: "short",
    }).format(new Date(value));
}

export function formatMarketType(value: PredictionMarketType) {
    return value.replaceAll("_", " ");
}

export function isMarketBettable(market: PredictionMarketDetails) {
    return market.status === "OPEN" && new Date(market.closesAt).getTime() > Date.now();
}

export function getMarketMessage(market: PredictionMarketDetails) {
    if (market.status === "DRAFT") return "Draft market. A guild master must open it before bets are accepted.";
    if (market.status === "LOCKED") return "Locked market. Betting is closed while it awaits resolution.";
    if (market.status === "RESOLVED") return "Resolved market. Winning bets have been paid.";
    if (market.status === "CANCELLED") return "Cancelled market. Active bets were refunded.";
    if (!isMarketBettable(market)) return "Closed market. The close time has passed.";
    return "Open for bets until the close time.";
}

export function getErrorMessage(error: unknown) {
    const maybeError = error as { response?: { data?: { message?: string } }, message?: string };
    return maybeError.response?.data?.message ?? maybeError.message ?? "The exchange rejected the request.";
}

export function estimateReturn(market: PredictionMarketDetails, outcomeId: string, amount: number, isExistingBet: boolean = false) {
    const outcome = market.outcomes.find((item) => item.id === outcomeId);
    if (!outcome || amount <= 0) return 0;

    if (isExistingBet) {
        const currentPledged = outcome.totalPledged;
        const projectedPledged = currentPledged;
        if (projectedPledged <= 0) return 0;
        return Math.floor((amount / projectedPledged) * market.totalPool);
    }

    const projectedTotalPool = market.totalPool + amount;
    const projectedWinningPool = outcome.totalPledged + amount;

    if (projectedWinningPool <= 0) return 0;
    return Math.floor((amount / projectedWinningPool) * projectedTotalPool);
}

export function getStatusClass(status: PredictionMarketDetails["status"]) {
    switch (status) {
        case "OPEN":
            return "border-green-500/40 bg-green-950/35 text-green-300";
        case "DRAFT":
            return "border-gold/50 bg-gold/15 text-gold";
        case "LOCKED":
            return "border-sky/45 bg-sky/15 text-sky";
        case "RESOLVED":
            return "border-gold/60 bg-wood-900 text-gold";
        case "CANCELLED":
            return "border-red-500/45 bg-red-950/35 text-red-500";
    }
}

export function getResolvedOutcome(market: PredictionMarketDetails) {
    return market.outcomes.find((outcome) => outcome.id === market.resolvedOutcomeId);
}

export function getMarketBet(market: PredictionMarketDetails, bets: PredictionPledgeDetails[] | undefined) {
    return bets?.find((bet) => bet.marketId === market.id);
}

export function getBetResult(market: PredictionMarketDetails, bet: PredictionPledgeDetails | undefined) {
    if (!bet) return null;
    if (bet.status === "WON") return { label: "Won", className: "text-green-500" };
    if (bet.status === "LOST") return { label: "Lost", className: "text-red-600" };
    if (bet.status === "REFUNDED") return { label: "Refunded", className: "text-yellow-500" };
    if (bet.status === "CANCELLED") return { label: "Cancelled", className: "text-red-600" };
    if (market.status === "RESOLVED" && market.resolvedOutcomeId) {
        return bet.outcomeId === market.resolvedOutcomeId
            ? { label: "Won", className: "text-emerald-300" }
            : { label: "Lost", className: "text-red-600" };
    }
    return { label: "Active", className: "text-gold" };
}

export function filterMarkets(markets: PredictionMarketDetails[], filter: MarketFilter, bets: PredictionPledgeDetails[] | undefined, isGuildMaster: boolean) {
    if (filter === "ALL") return markets.filter((market) => market.status === "OPEN" || market.status === "RESOLVED");
    if (filter === "OPEN") return markets.filter(isMarketBettable);
    if (filter === "DRAFT") return isGuildMaster ? markets.filter((market) => market.status === "DRAFT") : [];
    if (filter === "CANCELLED") return markets.filter((market) => market.status === "CANCELLED");
    if (filter === "MY BETS") {
        if (!bets) return [];
        const betMarketIds = new Set(bets.map((bet) => bet.marketId));
        return markets.filter((market) => betMarketIds.has(market.id) && (isGuildMaster || market.status !== "DRAFT"));
    }
    return markets.filter((market) => market.status === filter);
}

export function sortMarkets(markets: PredictionMarketDetails[]) {
    return markets.slice().sort((a, b) => {
        if (isMarketBettable(a) && !isMarketBettable(b)) return -1;
        if (!isMarketBettable(a) && isMarketBettable(b)) return 1;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
}
