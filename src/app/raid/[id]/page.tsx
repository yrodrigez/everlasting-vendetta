import moment from "moment/moment";
import {createServerComponentClient} from "@supabase/auth-helpers-nextjs";
import {cookies} from "next/headers";
import React from "react";

import RaidParticipants from "@/app/raid/components/RaidParticipants";
import AssistActions from "@/app/raid/components/AssistActions";
import RaidTimeInfo from "@/app/raid/components/RaidTimeInfo";

const raidResetAttr = 'raid_date, id, name, min_lvl, image_url, time, end_date'

function findNextWednesday() {
    if (moment().day() === 3) {
        return moment().format('YYYY-MM-DD')
    }
    const currentDay = moment()
    while (currentDay.day() !== 3) {
        currentDay.add(1, 'day')
    }

    return currentDay.format('YYYY-MM-DD')
}

async function fetchNextReset(supabase: any) {
    const nextWednesday = findNextWednesday()

    return supabase.from('raid_resets')
        .select(raidResetAttr)
        .gte('end_date', moment().format('YYYY-MM-DD'))
        .gte('raid_date', nextWednesday)
        .order('raid_date', {ascending: true})
        .limit(1)
        .single()
}

async function fetchCurrentReset(supabase: any) {
    return supabase.from('raid_resets')
        .select(raidResetAttr)
        .gte('end_date', moment().format('YYYY-MM-DD'))
        .order('raid_date', {ascending: true})
        .limit(1)
        .single()
}


async function fetchResetFromId(supabase: any, id: string) {
    return supabase.from('raid_resets')
        .select(raidResetAttr)
        .eq('id', id)
        .limit(1)
        .single()
}

export default async function ({params}: { params: { id: string } }) {
    const isLoggedInUser = cookies().get('evToken')
    if (!isLoggedInUser) {
        return <div>
            You are not logged in
        </div>
    }

    const supabase = createServerComponentClient({cookies}, {
        options: {
            global: {
                headers: {
                    Authorization: `Bearer ${isLoggedInUser.value}`
                }
            }
        }
    })

    const {
        data,
        error
    } = params.id === 'next' ? (await fetchNextReset(supabase)) : params.id === 'current' ? (await fetchCurrentReset(supabase)) : (await fetchResetFromId(supabase, params.id))


    if (error) {
        return <div>
            {JSON.stringify(error)}
        </div>
    }
    const {data: participants, error: participantsError} = await supabase
        .from('ev_raid_participant')
        .select('member:ev_member(character), is_confirmed, details, raid_id, created_at')
        .eq('raid_id', data.id)

    if (participantsError) {
        return <div>
            {JSON.stringify(participantsError)}
        </div>
    }

    const {id, raid_date: raidDate, name: raidName, min_lvl, image_url, time: raidTime, end_date} = data

    return (
        <div className="w-full h-full flex flex-col">
            <h4 className="font-bold text-large text-gold">{raidName}</h4>
            <small className="text-primary">Start {raidDate} - {raidTime}</small>
            <small className="text-primary">End: {end_date}</small>
            <RaidTimeInfo
                raidTime={raidTime}
                raidDate={raidDate}
            />
            <AssistActions raidId={id} minLvl={min_lvl} endDate={end_date} participants={participants}/>
            <h1 className="text-primary">Participants:</h1>
            <RaidParticipants participants={participants} raidId={id}/>
        </div>
    )
}
