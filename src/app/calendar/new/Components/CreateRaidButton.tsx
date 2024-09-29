'use client'


import useCreateRaidStore from "@/app/calendar/new/Components/useCreateRaidStore";
import {Button} from "@/app/components/Button";
import {useSession} from "@/app/hooks/useSession";
import {useCallback} from "react";
import {useRouter} from "next/navigation";

export function CreateRaidButton() {
    const {raid, endTime, startTime, startDate, endDate, days} = useCreateRaidStore(state => state)
    const {supabase} = useSession()
    const router = useRouter()

    const createReset = useCallback(async () => {
        if (!raid || !startTime || !endTime || !startDate || !endDate || !days?.length || !supabase) return
        const {data, error} = await supabase.from('raid_resets').insert({
            raid_id: raid.id,
            time: startTime,
            end_time: endTime,
            raid_date: startDate,
            end_date: endDate,
            min_lvl: raid.min_level,
            days
        })

        if (error) {
            console.error('Error creating raid', error)
        }

        console.log('Raid created', data)

        router.push('/calendar')

    }, [raid, endTime, startTime, startDate, endDate, days])

    return (
        <Button
            isDisabled={!raid || !startTime || !endTime || !startDate || !endDate || !days?.length}
            onClick={createReset}
        >
            Create Raid
        </Button>
    )
}
