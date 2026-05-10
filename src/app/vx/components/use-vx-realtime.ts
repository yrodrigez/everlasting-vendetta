import { safeChannel, useSupabase } from "@/context/SupabaseContext";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo } from "react";

export function useVxRealtime(enabled: boolean, bettableMarketIds: string[]) {
    const supabase = useSupabase();

    const queryClient = useQueryClient();
    const marketIdsKey = useMemo(
        () => [...new Set(bettableMarketIds)].sort().join(","),
        [bettableMarketIds],
    );

    /* useMemo(async () => {
        const { data: markets } = await supabase.schema('evx').from("prediction_markets").select("id");
        console.log("Fetched markets for VX realtime test:", markets);
        const { data: outcomes } = await supabase.schema('evx').from("prediction_outcomes").select("id, market_id");
        console.log("Fetched outcomes for VX realtime test:", outcomes);
        const { data: pledges } = await supabase.schema('evx').from("prediction_pledges").select("id, market_id");
        console.log("Fetched pledges for VX realtime test:", pledges);
    }, [supabase]); */


    useEffect(() => {
        if (!enabled || !marketIdsKey) {
            return;
        }
        console.log("Setting up VX exchange realtime subscription for market IDs:", marketIdsKey);

        const marketIds = new Set(marketIdsKey.split(","));

        const invalidateEvx = () => {
            void Promise.all([
                queryClient.invalidateQueries({ queryKey: ["evx", "wallet", "me"] }),
                queryClient.invalidateQueries({ queryKey: ["evx", "markets"] }),
                queryClient.invalidateQueries({ queryKey: ["evx", "bets", "me"] }),
                queryClient.invalidateQueries({ queryKey: ["evx", "leaderboard"] }),
            ]);
        };

        const invalidateIfVisible = (payload: { new?: Record<string, unknown>; old?: Record<string, unknown>, type?: string }) => {
            console.log("Received VX exchange realtime update:", payload);
            const record = payload.new ?? payload.old;
            const marketId = String(record?.market_id ?? record?.id ?? "");

            if (marketIds.has(marketId)) {
                invalidateEvx();
            }
        };

        const channel = safeChannel(supabase, "vx-exchange-bettable");

        channel
            .on("postgres_changes", { event: "*", schema: "evx", table: "prediction_markets" }, invalidateIfVisible)
            .on("postgres_changes", { event: "*", schema: "evx", table: "prediction_outcomes" }, invalidateIfVisible)
            .on("postgres_changes", { event: "*", schema: "evx", table: "prediction_pledges" }, invalidateIfVisible);

        channel.subscribe(
            (status) => {
                if (status === "SUBSCRIBED") {
                    console.log("Subscribed to VX exchange updates for market IDs:", marketIds);
                } else if (status === "TIMED_OUT" || status) {
                    console.error("VX exchange realtime subscription error:", status);
                }
            },
        );

        return () => {
            supabase.removeChannel(channel);
        };
    }, [enabled, marketIdsKey, queryClient, supabase]);
}
