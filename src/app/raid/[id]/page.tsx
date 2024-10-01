import moment from "moment/moment";
import {createServerComponentClient, SupabaseClient} from "@supabase/auth-helpers-nextjs";
import {cookies, headers} from "next/headers";
import React from "react";

import RaidParticipants from "@/app/raid/components/RaidParticipants";
import AssistActions from "@/app/raid/components/AssistActions";
import RaidTimeInfo from "@/app/raid/components/RaidTimeInfo";
import {KpisView} from "@/app/raid/components/KpisView";
import {redirect} from "next/navigation";
import {faCartPlus, faGift} from "@fortawesome/free-solid-svg-icons";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import Link from "next/link";
import {RaidOptions} from "@/app/raid/components/RaidOptions";
import {Button, Tooltip} from "@nextui-org/react";
import {getLoggedInUserFromAccessToken} from "@/app/util";
import {faDiscord} from "@fortawesome/free-brands-svg-icons";
import {Metadata} from "next";

const raidResetAttr = 'raid_date, id, raid:ev_raid(name, min_level, image), time, end_date, end_time, days'
export const dynamic = 'force-dynamic'
export type RaidResetFetch = {
    raid_date: string,
    id: string,
    raid: { name: string, min_level: number, image: string },
    time: string,
    end_date: string,
    end_time: string,
    days: string[]
}

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
    const {data, error} = await supabase.rpc('reset_id_starts_with', { id_prefix: `${id}%` })

    if(error) {
        return {error}
    }

    return supabase.from('raid_resets')
        .select(raidResetAttr)
        .eq('id', data[0]?.id)
        .limit(1)
        .single()
}

function findPreviousAndNextReset(supabase: SupabaseClient, resetDate: string) {

    return Promise.all([
        supabase.from('raid_resets')
            .select('id')
            .lt('raid_date', resetDate)
            .gte('raid_date', '2024-03-21')
            .order('raid_date', {ascending: false})
            .limit(1)
            .single(),
        supabase.from('raid_resets')
            .select('id')
            .gt('raid_date', resetDate)
            .order('raid_date', {ascending: true})
            .limit(1)
            .single()
    ])
}

export async function generateMetadata({params}: { params: { id: string } }): Promise<Metadata> {
    const supabase = createServerComponentClient({cookies});

    // Fetch the raid data based on the ID
    const {
        data,
        error
    } = params.id === 'next' ? (await fetchNextReset(supabase)) : params.id === 'current' ? (await fetchCurrentReset(supabase)) : (await fetchResetFromId(supabase, params.id));

    if (error) {
        return {
            title: 'Raid Not Found | Everlasting Vendetta',
            description: 'The raid you are looking for does not exist or cannot be found.',
        };
    }

    const {raid, raid_date: raidDate, time: raidTime, end_date} = data;
    const {name: raidName} = raid;

    const raidStartDate = moment(raidDate).format('MMMM D, YYYY');
    const raidEndDate = moment(end_date).format('MMMM D, YYYY');

    return {
        title: `${raidName} Raid - ${raidStartDate} | Everlasting Vendetta`,
        description: `Join the ${raidName} raid starting on ${raidStartDate} at ${raidTime}. Participate in epic battles and secure your loot until ${raidEndDate}.`,
        keywords: `wow, world of warcraft, raid, raiding, pve, pvp, guild, guild events, loot, soft reservations, ${raidName}, ${raidStartDate}`,
    };
}

export default async function ({params}: { params: { id: string } }) {
    const isLoggedInUser = cookies().get('evToken')

    const supabaseOptions = isLoggedInUser ? {
        options: {
            global: {
                headers: {
                    Authorization: `Bearer ${isLoggedInUser.value}`
                }
            }
        }
    } : {}

    const supabase = createServerComponentClient({cookies}, supabaseOptions)

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

    const {id, raid_date: raidDate, raid, time: raidTime, end_date, end_time: endTime, days} = data
    const {name: raidName, min_level: min_lvl} = raid
    const raidStartDate = moment(raidDate)
    const raidEndDate = moment(end_date)
    const raidInProgress = moment().isBetween(raidStartDate, raidEndDate)

    const hasLoot = await supabase.from('ev_loot_history').select('id').eq('raid_id', id).limit(1)

    let hasLootReservations = false
    if (isLoggedInUser) {
        const loggedInUser = getLoggedInUserFromAccessToken(isLoggedInUser.value)
        hasLootReservations = !!(await supabase.from('raid_loot_reservation')
            .select('id')
            .eq('member_id', loggedInUser?.id)
            .eq('reset_id', id)
            .limit(1))?.data?.length
    }

    const [previousReset, nextReset] = await findPreviousAndNextReset(supabase, raidDate)
    const raidStarted = moment().isAfter(raidStartDate)

    return (
        <div className="w-full h-full flex flex-col relative">
            <h4 className="font-bold text-large text-gold">{raidName}</h4>
            <small className="text-primary">Start {raidDate} - {raidTime} to {endTime}</small>
            <small className="text-primary">End: {end_date}</small>
            <KpisView
                raidInProgress={raidInProgress}
                participants={participants}
                raidId={id}
            />
            <RaidTimeInfo
                raidTime={raidTime}
                raidDate={raidDate}
                raidEndDate={end_date}
            />
            <AssistActions
                hasLootReservations={hasLootReservations}
                raidId={id}
                minLvl={min_lvl}
                endDate={end_date}
                participants={participants}
                days={days}
            />
            <RaidParticipants
                raidInProgress={raidInProgress}
                participants={participants}
                raidId={id}
                days={days}
            />
            <div className="absolute top-4 right-4 z-50 flex flex-col items-center gap-2">
                <RaidOptions
                    currentResetId={id}
                    hasLoot={!!hasLoot?.data?.length}
                    previousResetId={previousReset?.data?.id}
                    nextResetId={nextReset?.data?.id}
                    raidStarted={raidStarted}
                />
                <Link
                    target={'_blank'}
                    href={`https://discord.gg/fYw9WCNFDU`}>
                    <Tooltip
                        content="Discord"
                        placement="right"
                    >
                        <Button className={`bg-moss text-default font-bold rounded`} isIconOnly>
                            <FontAwesomeIcon icon={faDiscord}/>
                        </Button>
                    </Tooltip>
                </Link>
                <Link
                    href={`/raid/${id}/soft-reserv`}>
                    <Tooltip
                        content="Soft Reservations"
                        placement="right"
                    >
                        <Button
                            className={`bg-moss text-default font-bold rounded ${!hasLootReservations && isLoggedInUser ? 'shadow-2xl shadow-gold border-2 animate-blink-and-glow' : ''}`}
                            isIconOnly>
                            <FontAwesomeIcon icon={faCartPlus}/>
                        </Button>
                    </Tooltip>
                </Link>
                {!!hasLoot?.data?.length && (
                    <Link
                        href={`/raid/${id}/loot`}>
                        <Tooltip
                            content="Loot"
                            placement="right"
                        >
                            <Button className="bg-moss text-default font-bold rounded" isIconOnly>
                                <FontAwesomeIcon icon={faGift}/>
                            </Button>
                        </Tooltip>
                    </Link>
                )}
            </div>
        </div>
    )
}
