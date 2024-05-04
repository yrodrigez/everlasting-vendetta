import moment from "moment";

import {RaidResetCard} from "@/app/calendar/components/RaidResetCard";
import {cookies} from "next/headers";
import {createServerComponentClient, type SupabaseClient} from "@supabase/auth-helpers-nextjs";
import {isUserInGuild} from "@/app/lib/isUserInGuild";
import NotLoggedInView from "@/app/components/NotLoggedInView";

const START_DATE = '2024-04-03'
const RAID_RESET_DAYS = 7
const MAX_RAID_RESETS = 9
const CURRENT_RAID_NAME = 'Sunken Temple'
const CURRENT_MAX_LEVEL = 50
const CURRENT_RAID_IMAGE = '/sunken_temple-raid.webp'
const PROPOSED_RAID_TIME = '20:30'

function createNextMaxRaidResetsDates(startDate: string, maxResets: number) {
    const raidResets = []
    let nextRaidDate = moment(startDate)

    for (let i = 0; i < maxResets; i++) {
        raidResets.push(nextRaidDate.add(RAID_RESET_DAYS, 'days').format('YYYY-MM-DD'))
    }

    return raidResets
}

async function fetchRaidMembers(id: string, supabase: SupabaseClient) {
    const {
        data,
    } = await supabase.from('ev_raid_participant').select('member:ev_member(*), is_confirmed, raid_id, details').eq('raid_id', id)

    return data

}

async function fetchMaxRaidResets(supabase: SupabaseClient) {
    const raidResets = await supabase.from('raid_resets')
        .select('raid_date, id, name, min_lvl, image_url, time, end_date')
        .gte('end_date', moment().format('YYYY-MM-DD'))
        .order('raid_date', {ascending: true})
        .limit(MAX_RAID_RESETS)

    if (raidResets.error) {
        console.error(moment().format('YYYY-MM-DD') + ' - Error fetching raid resets: ' + JSON.stringify(raidResets) + ', on date: ' + new Date().toLocaleString())
        return []
    }

    return raidResets.data.length === MAX_RAID_RESETS ? raidResets.data : []
}

async function fetchNextRaidResets(supabase: SupabaseClient) {

    const raidResets = await fetchMaxRaidResets(supabase)

    if (raidResets.length >= MAX_RAID_RESETS) {
        return raidResets
    }

    const lastRaidDate = raidResets[raidResets.length - 1]?.raid_date ?? START_DATE
    const newRaidResets = createNextMaxRaidResetsDates(lastRaidDate, MAX_RAID_RESETS - raidResets.length)
    await supabase.from('raid_resets').insert(newRaidResets.map(raid_date => ({
        raid_date,
        name: CURRENT_RAID_NAME,
        min_lvl: CURRENT_MAX_LEVEL,
        image_url: CURRENT_RAID_IMAGE,
        time: PROPOSED_RAID_TIME
    })))

    return fetchMaxRaidResets(supabase)
}


export default async function Page() {
    const token = cookies().get(process.env.BNET_COOKIE_NAME!)
    if (!token) {
        return (
            <NotLoggedInView/>
        )
    }

    const supabase = createServerComponentClient({cookies})

    const raidResets = await Promise.all((await fetchNextRaidResets(supabase)).map(async (raidReset: any) => {
        const raidRegistrations = await fetchRaidMembers(raidReset.id, supabase)
        return {...raidReset, raidRegistrations}
    }))

    return <main className="flex gap-3 flex-col justify-center items-center md:flex-wrap md:flex-row">
        {raidResets.map((raidReset: any, index: number) => {

            return <RaidResetCard
                raidEndDate={raidReset.end_date}
                id={raidReset.id}
                key={index}
                raidName={raidReset.name}
                raidImage={raidReset.image_url ?? '/sunken_temple-raid.webp'}
                raidDate={raidReset.raid_date}
                raidTime={raidReset.time}
                raidRegistrations={raidReset.raidRegistrations}/>
        })}
    </main>
}
