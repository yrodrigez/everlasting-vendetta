import { useAuth } from "@/context/AuthContext";
import { useSupabase, safeChannel } from "@/context/SupabaseContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export const useReservationsRealtime = (
    resetId: string,
    onReservationsChange: (payload: any) => void,
    onResetChange: (payload: any) => void,
    onExtraReserveUpdate: (payload: any) => void,
    onHardReserveChange: (payload: any) => void,
    onRaidLootChange: (payload: any) => void,
) => {
    const { isAuthenticated } = useAuth();
    const supabase = useSupabase();
    const router = useRouter()

    const reservationsChannelName = `reservations-realtime:${resetId}`;

    useEffect(() => {
        if (!supabase || !resetId || !isAuthenticated) return;

        const reservationsChannel = safeChannel(supabase, reservationsChannelName)
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'raid_loot_reservation',
                //filter: `reset_id=eq.${resetId}`, // bug in supabase this does not work with delete events
            }, onReservationsChange)
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'raid_resets',
            }, onResetChange)
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'ev_extra_reservations',
            }, onExtraReserveUpdate)
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'raid_loot',
            }, async (payload) => {
                onRaidLootChange(payload)
                router.refresh()
            }).on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'raid_loot_item_rules',
            }, async (data) => {
                onHardReserveChange(data)
                router.refresh()
            }).subscribe((status, err) => {
                console.log(`Subscription to ${reservationsChannelName} status:`, status);
                if (err) {
                    console.error(`Error subscribing to ${reservationsChannelName}:`, err);
                }
            });

        return () => {
            console.log('Unsubscribing from realtime channels for resetId:', resetId);

            supabase.removeChannel(reservationsChannel);
        };
    }, [resetId, supabase, onReservationsChange, onResetChange, onExtraReserveUpdate, isAuthenticated, router]);
};
