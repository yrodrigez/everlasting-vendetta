import moment from "moment";

import {RaidResetCard} from "@/app/calendar/components/RaidResetCard";
import {cookies} from "next/headers";
import {createServerComponentClient, type SupabaseClient} from "@supabase/auth-helpers-nextjs";
import {Metadata} from "next";

export const dynamic = 'force-dynamic'

const MAX_RAID_RESETS = 9


async function fetchRaidMembers(id: string, supabase: SupabaseClient) {
    const {data, error} = await supabase.from('ev_raid_participant')
        .select('member:ev_member(*), is_confirmed, raid_id, details')
        .eq('raid_id', id);

    if (error) {
        console.error('Error fetching raid members:', error);
        return [];
    }

    return data;
}

async function fetchMaxRaidResets(supabase: SupabaseClient) {
    const raidResets = await supabase.from('raid_resets')
        .select('raid_date, id, raid:ev_raid(name, min_level, image), time, end_date')
        .gt('end_date', moment().format('YYYY-MM-DD'))
        .order('raid_date', {ascending: true})
        .order('raid_id', {ascending: false})
        .limit(MAX_RAID_RESETS)

    if (raidResets.error) {
        console.error('Error fetching raid resets: ' + JSON.stringify(raidResets))
        return []
    }

    return raidResets.data ?? []
}

export async function generateMetadata(): Promise<Metadata> {
    const metadataBase = new URL(process.env.NEXT_PUBLIC_BASE_URL!);

    return {
        title: 'Upcoming Raids | Everlasting Vendetta',
        description:
            'Check out the upcoming raids organized by Everlasting Vendetta. Join us for epic battles and adventures in World of Warcraft!',
        keywords:
            'wow, world of warcraft, raids, upcoming raids, raiding, pve, guild events, Everlasting Vendetta',
        openGraph: {
            title: 'Upcoming Raids | Everlasting Vendetta',
            description:
                'Join Everlasting Vendetta in our upcoming raids. Prepare for epic encounters and secure your place in the battle!',
            images: [
                {
                    url: new URL('/banner.png', metadataBase).toString(),
                    width: 800,
                    height: 600,
                    alt: 'Everlasting Vendetta Raid',
                },
            ],
        },
        twitter: {
            card: 'summary_large_image',
            title: 'Upcoming Raids | Everlasting Vendetta',
            description:
                'Get ready for the upcoming raids organized by Everlasting Vendetta. Don’t miss out on the action!',
            images: new URL('/banner.png', metadataBase).toString(),
        },
    };
}


export default async function Page() {

    const supabase = createServerComponentClient({cookies})

    const raidResets = await Promise.all((await fetchMaxRaidResets(supabase)).map(async (raidReset: any) => {
        const raidRegistrations = await fetchRaidMembers(raidReset.id, supabase)
        return {...raidReset, raidRegistrations}
    }))

    return <main className="flex gap-3 flex-col justify-center items-center md:flex-wrap md:flex-row">
        {raidResets.map((raidReset: any, index: number) => {

            return <RaidResetCard
                raidEndDate={raidReset.end_date}
                id={raidReset.id}
                key={index}
                raidName={raidReset.raid.name}
                raidImage={`/${raidReset.raid.image}`}
                raidDate={raidReset.raid_date}
                raidTime={raidReset.time}
                raidRegistrations={raidReset.raidRegistrations}/>
        })}
    </main>
}
