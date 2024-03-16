import moment from "moment";
import {createClient} from "@supabase/supabase-js";
import {RaidResetCard} from "@/app/calendar/components/RaidResetCard";
import {cookies} from "next/headers";

const START_DATE = '2024-03-14'
const RAID_RESET_DAYS = 3
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

async function fetchNextSevenRaidResets() {

    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
        console.error('Error fetching raid resets: Supabase URL not found')
        return []
    }
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
        console.error('Error fetching raid resets: Supabase Service Role Key not found')
        return []
    }

    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY,
    )
    let raidResets = [] as any
    try {
        raidResets = await supabase.from('raid_resets')
            .select('raid_date,id')
            .gte('raid_date', moment().format('YYYY-MM-DD'))
            .order('raid_date', {ascending: true})
            .limit(MAX_RAID_RESETS)
        console.log('raidResets:', raidResets, 'success')
    } catch (error) {
        console.error('Error fetching raid resets: ' + JSON.stringify(error, undefined, 2))
        return []
    }


    if (raidResets.data.length === 0 || raidResets.data.length < MAX_RAID_RESETS) {
        const lastRaidDate = raidResets.data[raidResets.data.length - 1]?.raid_date
        const nextRaidDate = lastRaidDate ? moment(lastRaidDate).add(RAID_RESET_DAYS, 'days').format('YYYY-MM-DD') : START_DATE
        const newRaidResets = createNextMaxRaidResets(nextRaidDate, MAX_RAID_RESETS - raidResets.data.length)
        const {error} = await supabase.from('raid_resets').upsert(newRaidResets.map(raid_date => ({raid_date})))

        if (error) {
            console.error('Error inserting new raid resets:', JSON.stringify(error, undefined, 2))
            throw new Error('Error inserting new raid resets: ' + error)
        }

        return fetchNextSevenRaidResets()
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
    const raidResets = await fetchNextSevenRaidResets()
    return <main className="flex gap-3 flex-col justify-center items-center md:flex-wrap md:flex-row">
        {raidResets.map((raidReset: any, index: number) => (
            <RaidResetCard
                id={raidReset.id}
                key={index}
                raidName="Gnomeregan"
                raidImage="/gnomeregan-raid.webp"
                raidDate={raidReset.raid_date}
                loggedInUser={token}
            />
        ))}
    </main>
}