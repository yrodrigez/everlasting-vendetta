'use client'

import useCreateRaidStore from "@/app/calendar/new/Components/useCreateRaidStore";
import { Button } from "@/app/components/Button";
import { useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import moment from "moment";
import { useShallow } from "zustand/shallow";
import { useAuth } from "@/app/context/AuthContext";
import { useCharacterStore } from "@/app/components/characterStore";
import { createClientComponentClient } from "@/app/util/supabase/createClientComponentClient";



export function CreateRaidButton() {
    const { raid, endTime, startTime, startDate, endDate, days } = useCreateRaidStore(useShallow(state => ({
        raid: state.raid,
        endTime: state.endTime,
        startTime: state.startTime,
        startDate: state.startDate,
        endDate: state.endDate,
        days: state.days
    })))

    const { accessToken } = useAuth()
    const supabase = useMemo(() => createClientComponentClient(accessToken), [accessToken]);
    const selectedCharacter = useCharacterStore(useShallow(state => state.selectedCharacter));

    const router = useRouter()

    const createReset = useCallback(async () => {
        if (!raid || !startTime || !endTime || !startDate || !endDate || !days?.length || !supabase || !selectedCharacter) return

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
            created_by: selectedCharacter?.id,
            modified_by: selectedCharacter?.id,
            days
        }

        const { data, error } = await supabase.from('raid_resets').insert(payload)
            .select('id')

        if (error) {
            console.error('Error creating raid', error)
            alert('Error creating raid: ' + error.message)
        }

        alert('Raid created successfully')

        router.push('/raid/' + data?.[0].id)

    }, [raid, endTime, startTime, startDate, endDate, days, selectedCharacter])

    return (
        <Button
            isDisabled={!raid || !startTime || !endTime || !startDate || !endDate || !days?.length || !selectedCharacter}
            onClick={createReset}
        >
            Create Raid
        </Button>
    )
}
