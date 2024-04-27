import moment from "moment/moment";
import {createServerComponentClient} from "@supabase/auth-helpers-nextjs";
import {cookies, headers} from "next/headers";
import React from "react";

import RaidParticipants from "@/app/raid/components/RaidParticipants";
import AssistActions from "@/app/raid/components/AssistActions";
import RaidTimeInfo from "@/app/raid/components/RaidTimeInfo";
import {KpisView} from "@/app/raid/components/KpisView";
import {redirect} from "next/navigation";
import {faGift} from "@fortawesome/free-solid-svg-icons";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import Link from "next/link";

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
        if (error.message.indexOf('Not valid base64url') > -1) {
            const referer = headers().get('Referer')
            const host = referer?.split('/').slice(0, 3).join('/')

            redirect(host + '/api/v1/oauth/bnet/auth',)
        }
        return <div>
            {JSON.stringify(error)}
        </div>
    }
    const {data: participants, error: participantsError} = await supabase
        .from('ev_raid_participant')
        .select('member:ev_member(character), is_confirmed, details, raid_id, created_at')
        .eq('raid_id', data.id)

    if (participantsError) {
        if (participantsError.message.indexOf('Not valid base64url') > -1) {
            const host = headers().get('Referer')
            redirect(host + '/api/v1/oauth/bnet/auth',)
        }
        return <div>
            {JSON.stringify(participantsError)}
        </div>
    }

    const {id, raid_date: raidDate, name: raidName, min_lvl, image_url, time: raidTime, end_date} = data
    const raidStartDate = moment(raidDate)
    const raidEndDate = moment(end_date)
    const raidInProgress = moment().isBetween(raidStartDate, raidEndDate)

    const hasLoot = await supabase.from('ev_loot_history').select('id').eq('raid_id', id).limit(1)

    return (
        <div className="w-full h-full flex flex-col relative">
            <h4 className="font-bold text-large text-gold">{raidName}</h4>
            <small className="text-primary">Start {raidDate} - {raidTime}</small>
            <small className="text-primary">End: {end_date}</small>
            <KpisView
                raidInProgress={raidInProgress}
                participants={participants}
                raidId={id}
            />
            <RaidTimeInfo
                raidTime={raidTime}
                raidDate={raidDate}
            />
            <AssistActions raidId={id} minLvl={min_lvl} endDate={end_date} participants={participants}/>
            <RaidParticipants
                raidInProgress={raidInProgress}
                participants={participants}
                raidId={id}
            />
            {!hasLoot?.error && hasLoot?.data?.length && <Link
                href={`/raid/${id}/loot`}
                className="absolute top-4 right-4 px-2 py-1"
            >
                <FontAwesomeIcon icon={faGift} />
            </Link>}
        </div>
    )
}
