'use client'

import useCreateRaidStore from "@/app/calendar/new/Components/useCreateRaidStore";
import { getCompositionCount } from "@/app/calendar/new/Components/useCreateRaidStore";
import { Button } from "@/components/Button";
import { useCallback } from "react";
import { useRouter } from "next/navigation";
import moment from "moment";
import { useShallow } from "zustand/shallow";
import { useCharacterStore } from "@/components/characterStore";
import { useSupabase } from "@/context/SupabaseContext";
import { useMessageBox } from '@/util/msgBox';

export function EditRaidButton({ reset }: { reset: { raid_id: string, id: string } }) {
    const { raid, endTime, startTime, startDate, endDate, days, realm, allowSoftReserves, softReservesAmmount, onTimeBonusExtraEnabled, onTimeBonusExtraAmmount, onTimeBonusCutoffHours, createdById, composition } = useCreateRaidStore(useShallow(state => ({
        raid: state.raid,
        endTime: state.endTime,
        startTime: state.startTime,
        startDate: state.startDate,
        endDate: state.endDate,
        days: state.days,
        realm: state.realm,
        allowSoftReserves: state.allowSoftReserves,
        softReservesAmmount: state.softReservesAmmount,
        onTimeBonusExtraEnabled: state.onTimeBonusExtraEnabled,
        onTimeBonusExtraAmmount: state.onTimeBonusExtraAmmount,
        onTimeBonusCutoffHours: state.onTimeBonusCutoffHours,
        createdById: state.createdById,
        composition: state.composition,
    })))
    const supabase = useSupabase();

    const selectedCharacter = useCharacterStore(state => state.selectedCharacter);
    const router = useRouter()

    const { alert, yesNo } = useMessageBox()

    const createReset = useCallback(async () => {
        if (!raid || !startTime || !endTime || !startDate || !endDate || !days?.length || !supabase || !selectedCharacter || !createdById || !composition || getCompositionCount(composition) !== raid.size) return

        if (raid.id !== reset.raid_id) {
            const confirmation = await yesNo({
                title: 'Change Raid',
                message: 'You have changed the raid for this reset. This will remove all existing participants and reservations. Do you want to continue?',
                yesText: 'Yes, change raid',
                noText: 'No, keep current raid',
            })
            if (confirmation !== 'yes') return
            const { error: errorParticipants } = await supabase
                .from('ev_raid_participant')
                .delete()
                .eq('raid_id', reset.id)

            if (errorParticipants) {
                console.error('Error updating raid participants', errorParticipants)
                alert({ message: 'Error updating raid participants: ' + errorParticipants.message, type: 'error' })
            }

            const { error: errorReservations } = await supabase
                .from('raid_loot_reservation')
                .delete()
                .eq('reset_id', reset.id)

            if (errorReservations) {
                console.error('Error updating raid reservations', errorReservations)
                alert({ message: 'Error updating raid reservations: ' + errorReservations.message, type: 'error' })
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
            created_by: createdById,
            modified_by: selectedCharacter?.id,
            modified_at: new Date().toISOString(),
            days,
            is_reservations_allowed: allowSoftReserves,
            reserve_ammount: softReservesAmmount,
            on_time_bonus_enabled: onTimeBonusExtraEnabled,
            on_time_bonus_extra_reservations: onTimeBonusExtraAmmount,
            on_time_bonus_cutoff_hours: onTimeBonusCutoffHours,
            composition: {
                ...composition,
                raid_lead: 1,
            },
        }


        const { data, error } = await supabase
            .from('raid_resets')
            .update(payload)
            .eq('id', reset.id)
            .select('id')
            .single()
            .overrideTypes<{ id: string }>()

        if (error) {
            console.error('Error editing raid', error)
            alert({ message: 'Error editing raid: ' + error.message, type: 'error' })
        }

        const confirmation = await yesNo({ message: 'Raid edited successfully', title: 'Success', yesText: 'Go to raid', noText: 'Stay on page' })

        if (confirmation === 'yes') {
            router.push('/raid/' + data?.id)
        }

    }, [raid, endTime, startTime, startDate, endDate, days, reset.id, selectedCharacter, realm, allowSoftReserves, softReservesAmmount, onTimeBonusExtraEnabled, onTimeBonusExtraAmmount, onTimeBonusCutoffHours, createdById, composition])

    const isCompositionValid = !!raid && !!composition && getCompositionCount(composition) === raid.size

    return (
        <Button
            isDisabled={!raid || !startTime || !endTime || !startDate || !endDate || !days?.length || !createdById || !isCompositionValid}
            onPress={createReset}
        >
            Edit Raid
        </Button>
    )
}
