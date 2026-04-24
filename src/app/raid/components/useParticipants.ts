import { RaidParticipant } from "@/app/raid/api/types";
import { safeChannel, useSupabase } from "@/context/SupabaseContext";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { MemberRolesRepository } from "../api/member-roles.repository";
import { ParticipantsService } from "../api/participants.service";

export function useParticipants(raidId: string, initialParticipants: RaidParticipant[]) {
	const supabase = useSupabase();
	const lastRefreshAtRef = useRef(0)

	const { data: participants = [], refetch, } = useQuery({
		queryKey: ['raid_participants', raidId],
		queryFn: () => {
			if (!supabase) return [] as RaidParticipant[]
			const memberRolesRepository = new MemberRolesRepository(supabase);
			const participantsService = new ParticipantsService(supabase, memberRolesRepository);
			return participantsService.fetchParticipantsWithRoles(raidId)
		},
		initialData: initialParticipants,
		enabled: !!supabase
	})

	const router = useRouter()

	useEffect(() => {
		if (!supabase) return
		const refreshParticipants = async () => {
			await refetch()

			const now = Date.now()
			if (now - lastRefreshAtRef.current < 2000) return

			lastRefreshAtRef.current = now
			router.refresh()
		}

		const participantChannelName = `raid_participants_${raidId}`

		const raidParticipantChannel = safeChannel(supabase, participantChannelName)
			.on('postgres_changes', {
				event: '*',
				schema: 'public',
				table: 'ev_raid_participant',
				filter: `raid_id=eq.${raidId}`
			}, refreshParticipants).subscribe((status, error) => {
				if (error) {
					console.error('Error subscribing to raid participants channel:', error)
				}
				console.log('Raid participants channel subscription status:', status)
			})

		return () => {
			supabase.removeChannel(raidParticipantChannel)
		}
	}, [raidId, supabase, refetch, router]);


	return participants
}
