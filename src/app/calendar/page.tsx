import moment from "moment-timezone";

import {RaidResetCard} from "@/app/calendar/components/RaidResetCard";
import {cookies} from "next/headers";

import {Metadata} from "next";
import {redirect} from "next/navigation";
import {Button} from "@/app/components/Button";
import Link from "next/link";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faAdd, faArrowLeft, faArrowRight, faHeart, faShield} from "@fortawesome/free-solid-svg-icons";
import {type SupabaseClient} from "@supabase/supabase-js";
import createServerSession from "@/app/util/supabase/createServerSession";
import {fetchResetParticipants} from "@/app/raid/api/fetchParticipants";
import Refresher from "@/app/calendar/components/Refresher";
import {CalendarSkeleton} from "@/app/calendar/CalendarSkeleton";
import {Skeleton} from "@heroui/react";
import React from "react";
import {DpsIcon} from "@/app/raid/components/KpisView";
import CreateNewCard from "@/app/calendar/components/CreateNewCard";

export const dynamic = 'force-dynamic'

const MAX_RAID_RESETS = 9

async function fetchMaxRaidResets(supabase: SupabaseClient, date: string | undefined, options: {
    isCurrent: boolean;
    isPrevious: boolean;
    isNext: boolean
}) {
    const raidResets = await supabase.from('raid_resets')
        .select('raid_date, id, raid:ev_raid(name, min_level, image), time, end_date, modifiedBy:ev_member!modified_by(character), modified_at, end_time, status')[
        options.isCurrent && !options.isPrevious && !options.isNext ? 'gte' :
            options.isPrevious ? 'lt' : 'gt'
        ](options.isPrevious ? 'raid_date' : 'end_date', moment(date).format('YYYY-MM-DD'))
        .order('raid_date', {ascending: !options.isPrevious})
        .order('raid_id', {ascending: false})
        .limit(MAX_RAID_RESETS)
        .returns<{
            raid_date: string;
            id: string;
            raid: { name: string, min_level: number, image: string };
            time: string;
            end_date: string;
            modifiedBy: { character: { name: string } }
            modified_at: string
            end_time: string
            status?: 'online' | 'offline'
        }[]>();


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
                    url: new URL('/banner.webp', metadataBase).toString(),
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
            images: new URL('/banner.webp', metadataBase).toString(),
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

export default async function Page({searchParams}: { searchParams: Promise<{ d?: string, p?: string, n?: string }> }) {
    const currentDate = moment().tz('Europe/Madrid').format('YYYY-MM-DD')
    const {d, p, n} = await searchParams
    if (!d || !dateIsValid(d) || (p && n)) {
        redirect(`/calendar?d=${currentDate}`)
    }

    if (p && !dateIsValid(p) || (n && !dateIsValid(n))) {
        redirect(`/calendar?d=${currentDate}`)
    }

    const {supabase, auth} = await createServerSession({cookies})
    const user = await auth.getSession()
    const {p: previous, n: next, d: current} = await searchParams
    const raidResets = await Promise.all((await fetchMaxRaidResets(supabase, (previous || next || current), {
        isPrevious: !!previous,
        isNext: !!next,
        isCurrent: !!current
    })).map(async (raidReset) => {
        const raidRegistrations = await fetchResetParticipants(supabase, raidReset.id)

        return {
            ...raidReset,
            raidRegistrations,
            registrationStatus: raidRegistrations.find(r => r.member.id === user?.id)?.details?.status
        }
    }))

    const previousWeeksPath = getPreviousWeeks(currentDate, raidResets[0]?.raid_date)
    const nextWeeksPath = getNextWeeks(currentDate, raidResets[raidResets.length - 1]?.end_date)
    const canCreate = user?.permissions?.some(p => p === 'reset.create')

    return <main className="flex justify-center items-center relative">
        <div className={
            `absolute top-0 lg:-left-8 -left-1 h-full`
        }>
            <div className="fixed sticky top-0">
                <Button as="a" href={previousWeeksPath} isIconOnly>
                    <FontAwesomeIcon icon={faArrowLeft}/>
                </Button>
            </div>
        </div>
        <div className="flex gap-3 flex-col lg:ml-9 items-center md:flex-wrap md:flex-row w-full h-full">

            {raidResets.map((raidReset, index: number) => {
                return <RaidResetCard
                    raidEndDate={raidReset.end_date}
                    isEditable={user?.permissions?.some(p => p === 'reset.edit') && moment(raidReset.raid_date + 'T' + raidReset.time).isAfter(moment())}
                    id={raidReset.id}
                    key={index}
                    raidName={raidReset.raid.name}
                    raidImage={`/${raidReset.raid.image}`}
                    raidDate={raidReset.raid_date}
                    raidTime={raidReset.time}
                    raidRegistrations={raidReset.raidRegistrations}
                    modifiedBy={raidReset.modifiedBy?.character?.name}
                    lastModified={raidReset.modified_at}
                    endTime={raidReset.end_time}
                    registrationStatus={raidReset.registrationStatus}
                    status={raidReset.status}
                />
            })}
            {raidResets.length < 9 && (<CreateNewCard/>)}
        </div>
        <div className={
            `absolute top-0 lg:-right-8 -right-1 h-full`
        }>
            <div className="sticky top-0  flex flex-col gap-2">
                <Button href={nextWeeksPath} as="a" isIconOnly>
                    <FontAwesomeIcon icon={faArrowRight}/>
                </Button>
                {canCreate &&
                    <Button href={'/calendar/new'} as="a" isIconOnly>
                        <FontAwesomeIcon icon={faAdd}/>
                    </Button>}
            </div>
        </div>
        <Refresher/>
    </main>
}
