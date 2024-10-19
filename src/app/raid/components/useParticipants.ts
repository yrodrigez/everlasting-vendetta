import {useEffect} from "react";
import {useSession} from "@/app/hooks/useSession";
import {fetchResetParticipants} from "@/app/raid/api/fetchParticipants";
import {useQuery} from "@tanstack/react-query";
import {RaidParticipant} from "@/app/raid/api/types";

export function useParticipants(raidId: string, initialParticipants: RaidParticipant[]) {
    const {supabase} = useSession()

    const {data: participants, refetch,} = useQuery({
        queryKey: ['raid_participants', raidId],
        queryFn: () => {
            if (!supabase) return [] as RaidParticipant[]
            return fetchResetParticipants(supabase, raidId)
        },
        initialData: initialParticipants,
        enabled: !!supabase
    })

    useEffect(() => {
        if (!supabase) return
        const raidParticipantChannel = supabase.channel(`raid_participants${raidId}`)
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'ev_raid_participant',
                filter: `raid_id=eq.${raidId}`
            }, async ({}) => {
                refetch()
            }).subscribe()
        return () => {
            supabase.removeChannel(raidParticipantChannel)
        }
    }, [raidId, supabase]);

    return participants
}
