import { useAuth } from "@/app/context/AuthContext";
import { createClientComponentClient } from "@/app/util/supabase/createClientComponentClient";
import { useRouter } from "next/navigation";
import { useEffect, useMemo } from "react";

export const useReservationsRealtime = (
    resetId: string,
    onReservationsChange: (payload: any) => void,
    onResetChange: (payload: any) => void,
    onExtraReserveUpdate: (payload: any) => void,
    onHardReserveChange: (payload: any) => void,
    onRaidLootChange: (payload: any) => void,
) => {
    const { isAuthenticated, accessToken } = useAuth();
    const supabase = useMemo(() => {
        return createClientComponentClient(accessToken);
    }, [accessToken]);
    const router = useRouter()

    const reservationsChannelName = `reservations:${resetId}`;
    const resetChannelName = `reset:${resetId}`;
    const extraReservationsChannelName = `ev_extra_reservations:reset_id=${resetId}`;
    const raidLootChannelName = `raid_loot:id=${resetId}`;
    const hardReserveChannelName = `hard_reserve:reset_id=${resetId}`;

    useEffect(() => {
        if (!supabase || !resetId || !isAuthenticated) return;
        supabase?.getChannels().forEach(channel => {
            const topic = channel.topic
            if (topic === `realtime:${reservationsChannelName}` ||
                topic === `realtime:${resetChannelName}` ||
                topic === `realtime:${extraReservationsChannelName}` ||
                topic === `realtime:${raidLootChannelName}` ||
                topic === `realtime:${hardReserveChannelName}`) {
                supabase.removeChannel(channel)
            }
        });
        const reservationsChannel = supabase
            .channel(reservationsChannelName)
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'raid_loot_reservation',
                    //filter: `reset_id=eq.${resetId}`, // bug in supabase this does not work with delete events
                }, onReservationsChange).subscribe((status, err) => {
                    console.log('Subscription to raid_loot_reservation status:', status);
                    if (err) {
                        console.error('Error subscribing to raid_loot_reservation:', err);
                    }
                });

        const resetChannel = supabase
            .channel(resetChannelName)
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'raid_resets',
                }, onResetChange).subscribe((status, err) => {
                    console.log('Subscription to raid_resets status:', status);
                    if (err) {
                        console.error('Error subscribing to raid_resets:', err);
                    }
                });

        const extraReservationsChannel = supabase.channel(extraReservationsChannelName)
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'ev_extra_reservations',
            }, onExtraReserveUpdate).subscribe((status, err) => {
                console.log('Subscription to ev_extra_reservations status:', status);
                if (err) {
                    console.error('Error subscribing to ev_extra_reservations:', err);
                }
            });

        const raid_loot = supabase.channel(raidLootChannelName)
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'raid_loot',
            }, async (payload) => {
                onRaidLootChange(payload)
                router.refresh()
            }).subscribe((status, err) => {
                console.log('Subscription to raid_loot status:', status);
                if (err) {
                    console.error('Error subscribing to raid_loot:', err);
                }
            });

        const hardReserveChannel = supabase.channel(hardReserveChannelName)
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'reset_hard_reserve',
                // filter: 'reset_id=eq.' + resetId
            }, async (data) => {
                onHardReserveChange(data)
                router.refresh()
            }).subscribe((status, err) => {
                console.log('Subscription to reset_hard_reserve status:', status);
                if (err) {
                    console.error('Error subscribing to reset_hard_reserve:', err);
                }
            });

        return () => {
            console.log('Unsubscribing from realtime channels for resetId:', resetId);

            supabase.removeChannel(reservationsChannel);
            supabase.removeChannel(resetChannel);
            supabase.removeChannel(extraReservationsChannel);
            supabase.removeChannel(raid_loot);
            supabase.removeChannel(hardReserveChannel);

        };
    }, [resetId, supabase, onReservationsChange, onResetChange, onExtraReserveUpdate, isAuthenticated, router]);
};
