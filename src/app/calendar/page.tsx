import moment from "moment";

import {RaidResetCard} from "@/app/calendar/components/RaidResetCard";
import {cookies} from "next/headers";
import {createServerComponentClient} from "@supabase/auth-helpers-nextjs";
import {isUserInGuild} from "@/app/lib/isUserInGuild";

const START_DATE = '2024-03-14'
const RAID_RESET_DAYS = 7
const MAX_RAID_RESETS = 9

function createNextMaxRaidResets(startDate: string, maxResets: number) {
    const raidResets = []
    let nextRaidDate = moment(startDate)

    for (let i = 0; i < maxResets; i++) {
        raidResets.push(nextRaidDate.format('YYYY-MM-DD'))
        nextRaidDate = nextRaidDate.add(RAID_RESET_DAYS, 'days')
    }

    return raidResets
}

async function fetchNextRaidResets() {
    const supabase = createServerComponentClient({cookies})

    const raidResets = await supabase.from('raid_resets')
        .select('raid_date,id')
        .gte('raid_date', moment().format('YYYY-MM-DD'))
        .order('raid_date', {ascending: true})
        .limit(MAX_RAID_RESETS)


    if (raidResets.error) {
        console.error(moment().format('YYYY-MM-DD') + ' - Error fetching raid resets: ' + JSON.stringify(raidResets) + ', on date: ' + new Date().toLocaleString())
        return []
    }


    if (raidResets.data.length === 0 || raidResets.data.length < MAX_RAID_RESETS) {
        const lastRaidDate = raidResets.data[raidResets.data.length - 1]?.raid_date
        const nextRaidDate = lastRaidDate ? moment(lastRaidDate).add(RAID_RESET_DAYS, 'days').format('YYYY-MM-DD') : START_DATE
        const newRaidResets = createNextMaxRaidResets(nextRaidDate, MAX_RAID_RESETS - raidResets.data.length)
        const {error} = await supabase.from('raid_resets').upsert(newRaidResets.map(raid_date => ({raid_date})))

        if (error) {
            console.error('Error inserting new raid resets:', JSON.stringify(error, undefined, 2))
            //throw new Error('Error inserting new raid resets: ' + error)
            return newRaidResets
        }

        return fetchNextRaidResets()
    }

    return raidResets.data
}


export default async function Page() {
    const token = cookies().get(process.env.BNET_COOKIE_NAME!)
    if (!token) {
        return (
            <main className="flex gap-3 flex-col justify-center items-center md:flex-wrap md:flex-row h-full">
                <h1 className="text-2xl font-bold text-center">You must be logged in to see this page</h1>
            </main>
        )
    }

    const belongsToGuild = await isUserInGuild(token)
    if (!belongsToGuild) {
        return (
            <main className="flex gap-3 flex-col justify-center items-center md:flex-wrap md:flex-row h-full">
                <h1 className="text-2xl font-bold text-center">You must be in the guild to see this page</h1>
            </main>
        )
    }

    const raidResets = await fetchNextRaidResets()
    return <main className="flex gap-3 flex-col justify-center items-center md:flex-wrap md:flex-row">
        {raidResets.map((raidReset: any, index: number) => {
            const newRaidDate = '2024-04-17'
            const isOldRaid = moment(newRaidDate).isSameOrAfter(raidReset.raid_date)
            return <RaidResetCard
                id={raidReset.id}
                key={index}
                raidName={isOldRaid ? 'Gnomeregan' : 'Sunken Temple'}
                raidImage={isOldRaid ? '/gnomeregan-raid.webp' : '/sunken_temple-raid.webp'}
                raidDate={raidReset.raid_date}
                loggedInUser={token}
            />
        })}
    </main>
}
