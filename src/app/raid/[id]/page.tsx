
import moment from "moment/moment";

import { type SupabaseClient } from "@supabase/supabase-js";
import React from "react";

import RaidParticipants from "@/app/raid/components/RaidParticipants";
import AssistActions from "@/app/raid/components/AssistActions";
import RaidTimeInfo from "@/app/raid/components/RaidTimeInfo";
import { KpisView } from "@/app/raid/components/KpisView";
import { faCartPlus, faGift } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { RaidOptions } from "@/app/raid/components/RaidOptions";
import { Tooltip } from "@heroui/react";
import { faDiscord } from "@fortawesome/free-brands-svg-icons";
import { Metadata } from "next";
import createServerSession from "@utils/supabase/createServerSession";
import { Button } from "@/app/components/Button";
import { ChatContainer } from "@/app/raid/[id]/chat/components/ChatContainer";
import { fetchResetParticipants } from "@/app/raid/api/fetchParticipants";
import { ClassSummary } from "@/app/raid/components/ClassSummary";
import * as process from "node:process";
import { IsLowGsModal } from "@/app/raid/components/IsLowGsModal";
import ParticipantsManager from "@/app/raid/components/ParticipantsManager";
import axios from "axios";
import { GUILD_REALM_SLUG } from "@/app/util/constants";

const raidResetAttr = 'raid_date, id, raid:ev_raid(name, min_level, image, min_gs), time, end_date, end_time, days, status'
export const dynamic = 'force-dynamic'
export const maxDuration = 60;

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
        .order('raid_date', { ascending: true })
        .limit(1)
        .single()
}

async function fetchCurrentReset(supabase: any) {
    return supabase.from('raid_resets')
        .select(raidResetAttr)
        .gte('end_date', moment().format('YYYY-MM-DD'))
        .order('raid_date', { ascending: true })
        .limit(1)
        .single()
}


async function fetchResetFromId(supabase: any, id: string) {
    const { data, error } = await supabase.rpc('reset_id_starts_with', { id_prefix: `${id}%` })

    if (error) {
        return { error }
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
            .order('raid_date', { ascending: false })
            .limit(1)
            .single(),
        supabase.from('raid_resets')
            .select('id')
            .gt('raid_date', resetDate)
            .order('raid_date', { ascending: true })
            .limit(1)
            .single()
    ])
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {

    const { id: raidId } = await params
    // Fetch the raid data based on the ID
    const { getSupabase } = await createServerSession();
    const supabase = await getSupabase();
    const {
        data,
        error
    } = raidId === 'next' ? (await fetchNextReset(supabase)) : raidId === 'current' ? (await fetchCurrentReset(supabase)) : (await fetchResetFromId(supabase, raidId));

    if (error) {
        return {
            title: 'Raid Not Found | Everlasting Vendetta',
            description: 'The raid you are looking for does not exist or cannot be found.',
        };
    }

    const { raid, raid_date: raidDate, time: raidTime, end_date } = data;
    const { name: raidName, image } = raid;

    const raidStartDate = moment(raidDate).format('MMMM D, YYYY');
    const raidEndDate = moment(end_date).format('MMMM D, YYYY');

    const title = `${raidName} Raid - ${raidStartDate} | Everlasting Vendetta`
    const description = `Join the ${raidName} raid starting on ${raidStartDate} at ${raidTime}. Participate in epic battles and secure your loot until ${raidEndDate}.`
    const keywords = `wow, world of warcraft, raid, raiding, pve, pvp, guild, guild events, loot, soft reservations, ${raidName}, ${raidStartDate}`
    const metadataBase = new URL('/raid/' + raidId, process.env.NEXT_PUBLIC_BASE_URL)
    const metadataImage = new URL(`/${image}`, metadataBase).toString()

    return {
        title,
        description,
        keywords,
        openGraph: {
            title,
            description,
            images: [
                {
                    url: metadataImage,
                    width: 600,
                    height: 400,
                    alt: 'Everlasting Vendetta Raid',
                },
            ],
        },
        twitter: {
            card: 'summary_large_image',
            title,
            description,
            images: metadataImage,
        }
    };
}

async function getCharacterGearScore(characterName: string | undefined) {
    if (!characterName) return 99999
    const response = await fetch(`${process.env.NEXT_PUBLIC_EV_API_URL}/gearscore`, {
        method: 'POST',
        body: JSON.stringify({ characters: [{ name: characterName, realm: GUILD_REALM_SLUG }] }),
        headers: {
            'Authorization': `Bearer ${process.env.NEXT_PUBLIC_EV_ANON_TOKEN}`
        }
    })
    if (!response.ok) {
        console.error('Error fetching gear score:', response.status, response.statusText)
        return 99999
    }

    const { data: [{ score: gs }] = [] } = await response.json()
    return gs as number
}

async function fetchHasLootReservations(supabase: any, resetId: string, memberId: number | undefined) {
    if (!memberId) return false
    return !!(await supabase.from('raid_loot_reservation')
        .select('id')
        .eq('member_id', memberId)
        .eq('reset_id', resetId)
        .limit(1))?.data?.length

}

async function getCharactersSanctifiedCount(characterNames: string[] | undefined) {
    if (!characterNames || !characterNames.length) return undefined
    const { data } = await axios.post(`${process.env.NEXT_PUBLIC_BASE_URL}/api/v1/services/wow/sanctified/count`, characterNames)
    return data as { characterName: string; count: number; characterId: string; }[] | undefined
}

export default async function ({ params }: { params: Promise<{ id: string }> }) {
    const { getSupabase, auth } = await createServerSession();
    const isLoggedInUser = await auth.getSession()
    const { id: raidId } = await params
    const supabase = await getSupabase();
    const {
        data: reset,
        error
    } = raidId === 'next' ? (await fetchNextReset(supabase)) : raidId === 'current' ? (await fetchCurrentReset(supabase)) : (await fetchResetFromId(supabase, raidId))

    if (error) {
        console.error('Error fetching reset', error)
        return <div>Could not find reset</div>
    }

    const [participants, [previousReset, nextReset], hasLootReservations, hasLootHistory, characterGearScore] = await Promise.all([
        fetchResetParticipants(supabase, reset.id),
        findPreviousAndNextReset(supabase, reset.raid_date),
        fetchHasLootReservations(supabase, reset.id, isLoggedInUser?.selectedCharacter?.id),
        supabase.from('ev_loot_history').select('id').eq('raid_id', reset.id).limit(1),
        getCharacterGearScore(isLoggedInUser?.selectedCharacter?.name)
    ])


    const { id, raid_date: raidDate, raid, time: raidTime, end_date, end_time: endTime, days, status } = reset
    const { name: raidName, min_level: min_lvl } = raid
    const raidStartDate = moment(raidDate)
    const raidEndDate = moment(end_date)
    const raidInProgress = moment().isBetween(raidStartDate, raidEndDate)

    const raidStarted = moment().isAfter(raidStartDate)

    let isLoggedInUserLowGear = false
    if (isLoggedInUser) {
        isLoggedInUserLowGear = characterGearScore < reset.raid.min_gs
    }

    return (
        <div className="w-full h-full flex flex-col relative scrollbar-pill grow-0 overflow-auto gap-4">
            <ParticipantsManager resetId={id} initialParticipants={participants}>
                <div className="w-full flex grow-0 gap-4">
                    <div className="w-full h-full flex flex-col">
                        <h4 className="font-bold text-large text-gold flex gap-2 items-center justify-start">{raidName} {status === 'offline' ?
                            <span className="text-red-500 ml-2">Cancelled</span> : null}
                            {isLoggedInUserLowGear && <IsLowGsModal
                                isLowGs={isLoggedInUserLowGear}
                                characterGearScore={characterGearScore}
                                minGs={reset?.raid?.min_gs}
                            />}
                        </h4>
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
                            raidEndTime={endTime}
                        />
                    </div>
                    <div className="flex w-full h-40 mr-14 justify-end">
                        <div className="h-full flex flex-wrap w-32">
                            <ClassSummary raidId={id} />
                        </div>
                    </div>
                </div>
                <div className="flex w-full">
                    <AssistActions
                        status={status}
                        hasLootReservations={hasLootReservations}
                        raidId={id}
                        minLvl={min_lvl}
                        endDate={end_date}
                        participants={participants}
                        days={days}
                        endTime={endTime}
                    />
                </div>
                <div className="w-full h-full flex gap-2 lg:flex-row flex-col-reverse overflow-auto">
                    <RaidParticipants
                        raidInProgress={raidInProgress}
                        participants={participants}
                        raidId={id}
                        days={days}
                        minGs={reset.raid.min_gs}
                    />
                    {!!isLoggedInUser ? (<div className="w-full lg:max-w-80 flex-grow-0 max-h-fit">
                        <ChatContainer raidName={`${raidName} (${raidDate})`} resetId={id} showRedirect={true} />
                    </div>) : null}
                </div>
                {status !== 'offline' ? (
                    <div className="absolute top-2 right-2 z-50 flex flex-col items-center gap-2 max-h-[200px]">
                        <RaidOptions
                            currentResetId={id}
                            hasLoot={!!hasLootHistory?.data?.length}
                            previousResetId={previousReset?.data?.id}
                            nextResetId={nextReset?.data?.id}
                            raidStarted={raidStarted}
                        />

                        <Tooltip
                            content="Discord"
                            placement="right"
                        >
                            <Button
                                target={'_blank'}
                                href={`https://discord.gg/fYw9WCNFDU`}
                                as="a"
                                className={`bg-moss text-default font-bold rounded`} isIconOnly>
                                <FontAwesomeIcon icon={faDiscord} />
                            </Button>
                        </Tooltip>
                        <Tooltip
                            content="Soft Reservations"
                            placement="right"
                        >
                            <Button
                                href={`/raid/${id}/soft-reserv`}
                                as="a"
                                className={`bg-moss text-default font-bold rounded ${!hasLootReservations && isLoggedInUser ? 'shadow-2xl shadow-gold border-2 animate-blink-and-glow' : ''}`}
                                isIconOnly>
                                <FontAwesomeIcon icon={faCartPlus} />
                            </Button>
                        </Tooltip>
                        {!!hasLootHistory?.data?.length && (
                            <Tooltip
                                content="Loot"
                                placement="right"
                            >
                                <Button
                                    as="a"
                                    href={`/raid/${id}/loot`}
                                    className="bg-moss text-default font-bold rounded" isIconOnly>
                                    <FontAwesomeIcon icon={faGift} />
                                </Button>
                            </Tooltip>
                        )}
                    </div>
                ) : null}
            </ParticipantsManager>
        </div>
    )
}
