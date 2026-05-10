"use client";

import { useAuth } from "@/context/AuthContext";
import { createAPIService, type CreatePredictionMarketInput } from "@/lib/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useMessageBox } from "@/util/msgBox";
import { CreateMarketForm } from "./create-market-form";
import { MarketDetailView } from "./market-detail-view";
import { MarketGrid } from "./market-grid";
import { TopBar } from "./top-bar";
import { useVxRealtime } from "./use-vx-realtime";
import type { MarketFilter } from "./vx-exchange.types";
import { filterMarkets, getErrorMessage, isMarketBettable, sortMarkets } from "./vx-exchange.utils";

type VxExchangeProps = {
    isGuildMaster: boolean;
    headingClassName: string;
};

const apiService = createAPIService();

export default function VxExchange({ isGuildMaster, headingClassName }: VxExchangeProps) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const openedMarketId = searchParams.get("marketId");

    const { authReady, accessToken } = useAuth();
    const { yesNo } = useMessageBox();
    const queryClient = useQueryClient();
    const [marketFilter, setMarketFilter] = useState<MarketFilter>("ALL");
    const [amount, setAmount] = useState(100);
    const [outcomeId, setOutcomeId] = useState("");

    const canFetch = useMemo(() => authReady && !!accessToken, [authReady, accessToken]);

    const walletQuery = useQuery({
        queryKey: ["evx", "wallet", "me"],
        queryFn: () => apiService.evx.getMyWallet(),
        enabled: canFetch,
    });

    const marketsQuery = useQuery({
        queryKey: ["evx", "markets"],
        queryFn: () => apiService.evx.getMarkets(),
        enabled: canFetch,
    });

    const betsQuery = useQuery({
        queryKey: ["evx", "bets", "me"],
        queryFn: () => apiService.evx.getMyPledges(),
        enabled: canFetch,
    });

    const markets = marketsQuery.data ?? [];
    const visibleMarkets = useMemo(
        () => filterMarkets(sortMarkets(markets), marketFilter, betsQuery.data, isGuildMaster),
        [markets, marketFilter, betsQuery.data, isGuildMaster],
    );
    
    useVxRealtime(canFetch, visibleMarkets.map((market) => market.id));
    const openedMarket = markets.find((market) => market.id === openedMarketId) ?? null;
    const openMarketCount = markets.filter(isMarketBettable).length;
    const existingBet = betsQuery.data?.find((bet) => bet.marketId === openedMarket?.id);

    useEffect(() => {
        if (openedMarket) {
            if (existingBet) {
                setOutcomeId(existingBet.outcomeId);
                setAmount(existingBet.amount);
            } else {
                setOutcomeId(openedMarket.outcomes.slice().sort((a, b) => a.sortOrder - b.sortOrder)[0]?.id ?? "");
                setAmount(100);
            }
        }
    }, [openedMarket?.id, existingBet]);

    function openMarket(id: string | null) {
        const params = new URLSearchParams(searchParams.toString());
        if (id) {
            params.set("marketId", id);
        } else {
            params.delete("marketId");
        }
        const query = params.toString();
        router.push(query ? `${pathname}?${query}` : pathname);
    }

    async function invalidateEvx() {
        await Promise.all([
            queryClient.invalidateQueries({ queryKey: ["evx", "wallet", "me"] }),
            queryClient.invalidateQueries({ queryKey: ["evx", "markets"] }),
            queryClient.invalidateQueries({ queryKey: ["evx", "bets", "me"] }),
        ]);
    }

    const betMutation = useMutation({
        mutationFn: () => {
            if (!openedMarket) throw new Error("No market selected.");
            return apiService.evx.createPledge(openedMarket.id, { outcomeId, amount });
        },
        onSuccess: async () => {
            toast.success("Bet placed.");
            await invalidateEvx();
        },
        onError: (error) => toast.error(getErrorMessage(error)),
    });

    const createMarketMutation = useMutation({
        mutationFn: (input: CreatePredictionMarketInput) => apiService.evx.createMarket(input),
        onSuccess: async (market) => {
            toast.success("Draft market created.");
            openMarket(market.id);
            await invalidateEvx();
        },
        onError: (error) => toast.error(getErrorMessage(error)),
    });

    const openMarketMutation = useMutation({
        mutationFn: () => {
            if (!openedMarket) throw new Error("No market selected.");
            return apiService.evx.openMarket(openedMarket.id);
        },
        onSuccess: async () => {
            toast.success("Market opened.");
            await invalidateEvx();
        },
        onError: (error) => toast.error(getErrorMessage(error)),
    });

    const finalizeMarketMutation = useMutation({
        mutationFn: () => {
            if (!openedMarket) throw new Error("No market selected.");
            return apiService.evx.finalizeMarket(openedMarket.id, outcomeId);
        },
        onSuccess: async () => {
            toast.success("Market finalized.");
            await invalidateEvx();
        },
        onError: (error) => toast.error(getErrorMessage(error)),
    });

    const cancelMarketMutation = useMutation({
        mutationFn: () => {
            if (!openedMarket) throw new Error("No market selected.");
            return apiService.evx.cancelMarket(openedMarket.id);
        },
        onSuccess: async () => {
            toast.success("Market cancelled.");
            await invalidateEvx();
        },
        onError: (error) => toast.error(getErrorMessage(error)),
    });

    async function confirmFinalizeSelectedOutcome() {
        if (!openedMarket) {
            toast.error("No market selected.");
            return;
        }

        const selectedOutcome = openedMarket.outcomes.find((outcome) => outcome.id === outcomeId);
        if (!selectedOutcome) {
            toast.error("Select an outcome before finalizing the market.");
            return;
        }

        const confirmation = await yesNo({
            title: "Finalize selected outcome?",
            message: (
                <div className="space-y-3 text-default">
                    <p>This will resolve the market and pay winning bets.</p>
                    <div className="rounded border border-gold/40 bg-wood p-3">
                        <p className="text-xs font-black uppercase tracking-[0.18em] text-gold/75">Selected outcome</p>
                        <p className="mt-1 text-lg font-black text-gold">{selectedOutcome.label}</p>
                    </div>
                    <p className="text-sm text-default/65">This action cannot be undone from this screen.</p>
                </div>
            ),
            yesText: "Finalize outcome",
            noText: "Cancel",
            modYes: "default",
            modNo: "danger",
        });

        if (confirmation !== "yes") return;
        finalizeMarketMutation.mutate();
    }

    const isInitialLoading = !authReady || walletQuery.isLoading || marketsQuery.isLoading || betsQuery.isLoading;
    const loadError = walletQuery.error ?? marketsQuery.error ?? betsQuery.error;
    const availableFilters: MarketFilter[] = isGuildMaster
        ? ["ALL", "OPEN", "DRAFT", "RESOLVED", "CANCELLED", "MY BETS"]
        : ["ALL", "OPEN", "RESOLVED", "CANCELLED", "MY BETS"];

    return (
        <main className="flex h-full w-full flex-col gap-4 overflow-auto px-2 py-3 text-default sm:px-4">
            <TopBar
                headingClassName={headingClassName}
                balance={walletQuery.data?.balance}
                marketCount={markets.length}
                openMarketCount={openMarketCount}
                betCount={betsQuery.data?.length ?? 0}
            />

            {loadError ? <div className="rounded-2xl border border-red-500/30 bg-red-950/30 p-4 text-center text-red-200">{getErrorMessage(loadError)}</div> : null}

            {isInitialLoading ? (
                <div className="rounded-2xl border border-wood-100 bg-wood p-10 text-center text-default/60">Opening VX...</div>
            ) : openedMarket ? (
                <MarketDetailView
                    market={openedMarket}
                    amount={amount}
                    outcomeId={outcomeId}
                    isGuildMaster={isGuildMaster}
                    isPending={betMutation.isPending}
                    adminPending={openMarketMutation.isPending || finalizeMarketMutation.isPending || cancelMarketMutation.isPending}
                    existingBet={existingBet}
                    onAmountChange={setAmount}
                    onOutcomeChange={setOutcomeId}
                    onBet={() => betMutation.mutate()}
                    onBack={() => openMarket(null)}
                    onOpen={() => openMarketMutation.mutate()}
                    onFinalize={confirmFinalizeSelectedOutcome}
                    onCancel={() => cancelMarketMutation.mutate()}
                />
            ) : (
                <>
                    <MarketGrid
                        markets={visibleMarkets}
                        totalMarketCount={markets.length}
                        filter={marketFilter}
                        availableFilters={availableFilters}
                        bets={betsQuery.data}
                        onFilterChange={setMarketFilter}
                        onOpenMarket={openMarket}
                    />
                    {isGuildMaster ? <CreateMarketForm onCreate={(input) => createMarketMutation.mutateAsync(input)} isPending={createMarketMutation.isPending} /> : null}
                </>
            )}
        </main>
    );
}
