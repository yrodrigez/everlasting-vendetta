import moment from "moment";

import {RaidResetCard} from "@/app/calendar/components/RaidResetCard";
import {cookies} from "next/headers";

import {Metadata} from "next";
import {redirect} from "next/navigation";
import {Button} from "@/app/components/Button";
import Link from "next/link";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faAdd, faArrowLeft, faArrowRight} from "@fortawesome/free-solid-svg-icons";
import {createServerComponentClient} from "@/app/util/supabase/createServerComponentClient";
import {type SupabaseClient} from "@supabase/auth-helpers-nextjs";

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

async function fetchMaxRaidResets(supabase: SupabaseClient, date: string | undefined, options: {
    isCurrent: boolean;
    isPrevious: boolean;
    isNext: boolean
}) {
    const raidResets = await supabase.from('raid_resets')
        .select('raid_date, id, raid:ev_raid(name, min_level, image), time, end_date')[
            options.isPrevious ? 'lt' : 'gt'
        ](options.isPrevious ? 'raid_date' : 'end_date', moment(date).format('YYYY-MM-DD'))
        .order('raid_date', {ascending: !options.isPrevious})
        .order('raid_id', {ascending: false})
        .limit(MAX_RAID_RESETS)

    if (raidResets.error) {
        console.error('Error fetching raid resets: ' + JSON.stringify(raidResets))
        return []
    }

    return (raidResets.data ?? []).sort((a: any, b: any) => {
        return moment(a.raid_date).diff(moment(b.raid_date))
    })
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

const getPreviousWeeks = (date: string, previousTo: string) => {

    return (`/calendar?d=${date}&p=${previousTo}`)
}

const getNextWeeks = (date: string, nextTo: string) => {

    return (`/calendar?d=${date}&n=${nextTo}`)
}

function dateIsValid(date: string) {

    return /\d{4}-\d{2}-\d{2}/.test(date) && moment(date, 'YYYY-MM-DD').isValid()
}

export default async function Page({searchParams}: { searchParams: { d?: string, p?: string, n?: string } }) {
    const currentDate = moment().format('YYYY-MM-DD')
    if (!searchParams.d || !dateIsValid(searchParams.d) || (searchParams.p && searchParams.n)) {
        redirect(`/calendar?d=${currentDate}`)
    }

    if(searchParams.p && !dateIsValid(searchParams.p) || searchParams.n && !dateIsValid(searchParams.n)) {
        redirect(`/calendar?d=${currentDate}`)
    }

    const supabase = createServerComponentClient({cookies})
    const {p: previous, n: next, d: current} = searchParams
    const raidResets = await Promise.all((await fetchMaxRaidResets(supabase, (previous || next || current), {
        isPrevious: !!previous,
        isNext: !!next,
        isCurrent: !!current
    })).map(async (raidReset: any) => {
        const raidRegistrations = await fetchRaidMembers(raidReset.id, supabase)
        return {...raidReset, raidRegistrations}
    }))

    return <main className="flex justify-center items-center relative">
        <div
            className="absolute top-0 -left-8"
        >
            <Link
                href={getPreviousWeeks(currentDate, raidResets[0]?.raid_date)}
            >
                <Button
                    isIconOnly
                >
                    <FontAwesomeIcon icon={faArrowLeft} />
                </Button>
            </Link>
        </div>
        <div className="flex gap-3 flex-col justify-center items-center md:flex-wrap md:flex-row w-full">
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
        </div>
        {
            // visible only if the current date is displaying a current or future raid

            <div
            className="absolute top-0 -right-8 flex flex-col gap-2"
        >{
                !moment().isBefore(moment(raidResets[0]?.end_date)) &&
            <Link
                href={getNextWeeks(currentDate, raidResets[raidResets.length - 1]?.end_date)}>
                <Button
                  isIconOnly
                >
                  <FontAwesomeIcon icon={faArrowRight} />
                </Button>
            </Link>
            }
            <Link href={'/calendar/new'}>
                <Button isIconOnly>
                    <FontAwesomeIcon icon={faAdd}/>
                </Button>
            </Link>
        </div>}
    </main>
}
