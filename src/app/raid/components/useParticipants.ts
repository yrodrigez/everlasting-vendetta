import { useEffect, useMemo } from "react";
import { fetchResetParticipants } from "@/app/raid/api/fetchParticipants";
import { useQuery } from "@tanstack/react-query";
import { RaidParticipant } from "@/app/raid/api/types";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";
import { createClientComponentClient } from "@/app/util/supabase/createClientComponentClient";

export function useParticipants(raidId: string, initialParticipants: RaidParticipant[]) {
	const { accessToken } = useAuth()
	const supabase = useMemo(() => createClientComponentClient(accessToken), [accessToken]);

	const { data: participants, refetch, } = useQuery({
		queryKey: ['raid_participants', raidId],
		queryFn: () => {
			if (!supabase) return [] as RaidParticipant[]
			return fetchResetParticipants(supabase, raidId)
		},
		initialData: initialParticipants,
		enabled: !!supabase
	})

	const router = useRouter()

	useEffect(() => {
		if (!supabase) return
		
		const participantChannelName = `raid_participants_${raidId}`
		const resetChannelName = `reset_channel_${raidId}`
		
		// Remove existing channels first to avoid mismatch errors
		const existingParticipantChannel = supabase.getChannels().find(c => c.topic === `realtime:${participantChannelName}`)
		const existingResetChannel = supabase.getChannels().find(c => c.topic === `realtime:${resetChannelName}`)
		
		if (existingParticipantChannel) {
			supabase.removeChannel(existingParticipantChannel)
		}
		if (existingResetChannel) {
			supabase.removeChannel(existingResetChannel)
		}
		
		const raidParticipantChannel = supabase.channel(participantChannelName)
			.on('postgres_changes', {
				event: '*',
				schema: 'public',
				table: 'ev_raid_participant',
				filter: `raid_id=eq.${raidId}`
			}, async () => {
				refetch()
				router.refresh()
			}).subscribe((status, error)=>{
				if(error) {
					console.error('Error subscribing to raid participants channel:', error)
				}
				console.log('Raid participants channel subscription status:', status)
			})

		const resetChannel = supabase.channel(resetChannelName)
			.on('postgres_changes', {
				event: '*',
				schema: 'public',
				table: 'raid_resets',
				filter: `id=eq.${raidId}`
			}, async () => {
				refetch()
				router.refresh()
			}).subscribe()
		return () => {
			supabase.removeChannel(raidParticipantChannel)
			supabase.removeChannel(resetChannel)
		}
	}, [raidId, supabase]);


	return participants
}
