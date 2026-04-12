'use client'

import useCreateRaidStore from "@/app/calendar/new/Components/useCreateRaidStore";
import { Button } from "@/components/Button";
import { useCallback } from "react";
import { useRouter } from "next/navigation";
import moment from "moment";
import { useShallow } from "zustand/shallow";
import { useCharacterStore } from "@/components/characterStore";
import { useSupabase } from "@/context/SupabaseContext";

export function CreateRaidButton() {
    const { raid, endTime, startTime, startDate, endDate, days, allowSoftReserves, softReservesAmmount, onTimeBonusExtraEnabled, onTimeBonusExtraAmmount, onTimeBonusCutoffHours, createdById } = useCreateRaidStore(useShallow(state => ({
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
    })))

    const supabase = useSupabase();
    const selectedCharacter = useCharacterStore(useShallow(state => state.selectedCharacter));
    const realm = useCreateRaidStore(state => state.realm);

    const router = useRouter()

    const createReset = useCallback(async () => {
        if (!raid || !startTime || !endTime || !startDate || !endDate || !days?.length || !supabase || !selectedCharacter || !realm || !createdById) return

        const shouldAddADay = (
            moment(`${startDate}T${startTime}`).isAfter(
                moment(`${endDate}T${endTime}`).toDate())
        )

        const payload = {
            raid_id: raid.id,
            time: startTime,
            end_time: endTime,
            raid_date: moment(startDate).format('YYYY-MM-DD'),
            end_date: moment(endDate).add(+shouldAddADay, 'days').format('YYYY-MM-DD'),
            min_lvl: raid.min_level,
            created_by: createdById,
            modified_by: selectedCharacter?.id,
            days,
            realm,
            is_reservations_allowed: allowSoftReserves,
            reserve_ammount: softReservesAmmount,
            on_time_bonus_enabled: onTimeBonusExtraEnabled,
            on_time_bonus_extra_reservations: onTimeBonusExtraAmmount,
            on_time_bonus_cutoff_hours: onTimeBonusCutoffHours,
            name: raid.name,
        }

        const { data, error } = await supabase.from('raid_resets').insert(payload)
            .select('id')

        if (error) {
            console.error('Error creating raid', error)
            alert('Error creating raid: ' + error.message)
        }

        alert('Raid created successfully')

        router.push('/raid/' + data?.[0].id)

    }, [raid, endTime, startTime, startDate, endDate, days, selectedCharacter, realm, supabase, router, allowSoftReserves, softReservesAmmount, onTimeBonusExtraEnabled, onTimeBonusExtraAmmount, onTimeBonusCutoffHours, createdById])

    return (
        <Button
            isDisabled={!raid || !startTime || !endTime || !startDate || !endDate || !days?.length || !selectedCharacter || !realm || !createdById}
            onPress={createReset}
        >
            Create Raid
        </Button>
    )
}
