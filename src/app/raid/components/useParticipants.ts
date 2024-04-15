import {useEffect, useState} from "react";
import {useSession} from "@/app/hooks/useSession";

export function useParticipants(raidId: string, initialParticipants: any[]) {
    const [participants, setParticipants] = useState(initialParticipants)
    const {supabase} = useSession()

    useEffect(() => {
        if (!supabase) return
        const raidParticipantChannel = supabase.channel(`raid_participants${raidId}`)
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'ev_raid_participant',
                filter: `raid_id=eq.${raidId}`
            }, async ({}) => {
                const {error, data} = await supabase
                    .from('ev_raid_participant')
                    .select('member:ev_member(character), is_confirmed, details, raid_id, created_at')
                    .eq('raid_id', raidId)
                if (error) {
                    console.error(error)
                }
                setParticipants(data)
            }).subscribe()
        return () => {
            supabase.removeChannel(raidParticipantChannel)
        }
    }, [raidId, supabase]);

    return participants
}
