'use client'

import useCreateRaidStore from "@/app/calendar/new/Components/useCreateRaidStore";
import { Button } from "@/app/components/Button";
import { useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import moment from "moment";
import { useShallow } from "zustand/shallow";
import { useCharacterStore } from "@/app/components/characterStore";
import { useAuth } from "@/app/context/AuthContext";
import { createClientComponentClient } from "@/app/util/supabase/createClientComponentClient";

export function EditRaidButton({ reset }: { reset: any }) {
    const { raid, endTime, startTime, startDate, endDate, days, realm } = useCreateRaidStore(useShallow(state => ({
        raid: state.raid,
        endTime: state.endTime,
        startTime: state.startTime,
        startDate: state.startDate,
        endDate: state.endDate,
        days: state.days,
        realm: state.realm,
    })))
    const { accessToken } = useAuth();
    const supabase = useMemo(() => createClientComponentClient(accessToken), [accessToken]);

    const selectedCharacter = useCharacterStore(state => state.selectedCharacter);
    const router = useRouter()

    const createReset = useCallback(async () => {
        if (!raid || !startTime || !endTime || !startDate || !endDate || !days?.length || !supabase || !selectedCharacter) return

        if (raid.id !== reset.raid_id) {
            const confirmation = confirm('Changing the raid will delete all participants and reservations. Are you sure you want to continue?')
            if (!confirmation) return
            const { error: errorParticipants } = await supabase
                .from('ev_raid_participant')
                .delete()
                .eq('raid_id', reset.id)

            if (errorParticipants) {
                console.error('Error updating raid participants', errorParticipants)
                alert('Error updating raid participants: ' + errorParticipants.message)
            }

            const { error: errorReservations } = await supabase
                .from('raid_loot_reservation')
                .delete()
                .eq('reset_id', reset.id)

            if (errorReservations) {
                console.error('Error updating raid reservations', errorReservations)
                alert('Error updating raid reservations: ' + errorReservations.message)
            }
        }

        const payload = {
            realm,
            raid_id: raid.id,
            time: startTime,
            end_time: endTime,
            raid_date: moment(startDate).format('YYYY-MM-DD'),
            end_date: moment(endDate).format('YYYY-MM-DD'),
            min_lvl: raid.min_level,
            modified_by: selectedCharacter?.id,
            modified_at: new Date().toISOString(),
            days,
        }
        
        const { data, error } = await supabase.from('raid_resets')
            .update(payload)
            .eq('id', reset.id)
            .select('id')

        if (error) {
            console.error('Error editing raid', error)
            alert('Error editing raid: ' + error.message)
        }

        alert('Raid edited successfully')

        router.push('/raid/' + data?.[0].id)

    }, [raid, endTime, startTime, startDate, endDate, days, reset.id, selectedCharacter, realm])

    return (
        <Button
            isDisabled={!raid || !startTime || !endTime || !startDate || !endDate || !days?.length}
            onPress={createReset}
        >
            Edit Raid
        </Button>
    )
}
