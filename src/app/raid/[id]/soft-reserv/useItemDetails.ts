import { useQuery } from '@tanstack/react-query';
import { useRaidItems } from './raid-items-context';
import { useAuth } from '@/app/context/AuthContext';
import { createClientComponentClient } from '@/app/util/supabase/createClientComponentClient';
import { useEffect, useMemo, useRef, useState } from 'react';

export function useItemDetails(itemId: number | null, resetId: string) {
    const { repository } = useRaidItems();
    const { accessToken, isAuthenticated } = useAuth();
    const supabase = useMemo(() => createClientComponentClient(accessToken), [accessToken]);
    const [realtimeError, setRealtimeError] = useState(false);
    const refetchRef = useRef<(() => void) | null>(null);

    const { data: lootHistory, isLoading: lootLoading } = useQuery({
        queryKey: ['item-loot-history', itemId],
        queryFn: () => repository.fetchLootHistoryByItemId(itemId!),
        enabled: !!itemId,
        staleTime: 60000,
    });

    const { data: itemRules, isLoading: rulesLoading, refetch: refetchRules } = useQuery({
        queryKey: ['item-rules', resetId, itemId],
        queryFn: () => repository.fetchItemRules(resetId, itemId!),
        enabled: !!itemId && !!resetId,
        staleTime: realtimeError ? 60000 : Infinity,
        refetchInterval: realtimeError ? 60000 : false,
    });

    refetchRef.current = refetchRules;

    useEffect(() => {
        if (!supabase || !itemId || !resetId || !isAuthenticated) return;

        const channelName = `item_rules:${resetId}:${itemId}`;

        const channel = supabase
            .channel(channelName)
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'raid_loot_item_rules',
            }, () => {
                refetchRef.current?.();
            })
            .subscribe((status, err) => {
                if (err) {
                    console.error('Error subscribing to raid_loot_item_rules:', err);
                    setRealtimeError(true);
                } else if (status === 'SUBSCRIBED') {
                    setRealtimeError(false);
                }
            });

        return () => {
            supabase.removeChannel(channel);
        };
    }, [supabase, itemId, resetId, isAuthenticated]);

    return {
        lootHistory: lootHistory ?? [],
        itemRules: itemRules ?? [],
        isLoading: lootLoading || rulesLoading,
        refetchRules,
    };
}
