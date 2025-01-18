import moment from "moment/moment";

import {type SupabaseClient} from "@supabase/supabase-js";
import {cookies} from "next/headers";
import React from "react";

import RaidParticipants from "@/app/raid/components/RaidParticipants";
import AssistActions from "@/app/raid/components/AssistActions";
import RaidTimeInfo from "@/app/raid/components/RaidTimeInfo";
import {KpisView} from "@/app/raid/components/KpisView";
import {faCartPlus, faGift} from "@fortawesome/free-solid-svg-icons";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import Link from "next/link";
import {RaidOptions} from "@/app/raid/components/RaidOptions";
import {Tooltip} from "@nextui-org/react";
import {faDiscord} from "@fortawesome/free-brands-svg-icons";
import {Metadata} from "next";
import createServerSession from "@utils/supabase/createServerSession";
import {Button} from "@/app/components/Button";
import {ChatContainer} from "@/app/raid/[id]/chat/components/ChatContainer";
import {fetchResetParticipants} from "@/app/raid/api/fetchParticipants";
import {ClassSummary} from "@/app/raid/components/ClassSummary";
import * as process from "node:process";
import {IsLowGsModal} from "@/app/raid/components/IsLowGsModal";
import ParticipantsManager from "@/app/raid/components/ParticipantsManager";

const raidResetAttr = 'raid_date, id, raid:ev_raid(name, min_level, image, min_gs), time, end_date, end_time, days, status'
export const dynamic = 'force-dynamic'

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
	const {data, error} = await supabase.rpc('reset_id_starts_with', {id_prefix: `${id}%`})

	if (error) {
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

export async function generateMetadata({params}: { params: Promise<{ id: string }> }): Promise<Metadata> {
	const {supabase} = await createServerSession({cookies})

	const {id: raidId} = await params
	// Fetch the raid data based on the ID
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

async function getCharacterGearScore(characterName: string) {
	const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/v1/services/member/character/${encodeURIComponent(characterName.toLowerCase())}/gs`)
	if (!response.ok) {
		console.error('Error fetching gear score:', response.status, response.statusText)
		return 99999
	}

	const data = await response.json()
	return data.gs
}

export default async function ({params}: { params: Promise<{ id: string }> }) {
	const {supabase, auth} = await createServerSession({cookies})
	const isLoggedInUser = await auth.getSession()
	const {id: raidId} = await params
	const {
		data: reset,
		error
	} = raidId === 'next' ? (await fetchNextReset(supabase)) : raidId === 'current' ? (await fetchCurrentReset(supabase)) : (await fetchResetFromId(supabase, raidId))

	if (error) {
		console.error('Error fetching reset', error)
		return <div>Could not find reset</div>
	}

	const participants = await fetchResetParticipants(supabase, reset.id)

	const {id, raid_date: raidDate, raid, time: raidTime, end_date, end_time: endTime, days, status} = reset
	const {name: raidName, min_level: min_lvl} = raid
	const raidStartDate = moment(raidDate)
	const raidEndDate = moment(end_date)
	const raidInProgress = moment().isBetween(raidStartDate, raidEndDate)

	const hasLoot = await supabase.from('ev_loot_history').select('id').eq('raid_id', id).limit(1)

	let hasLootReservations = false
	if (isLoggedInUser?.id) {
		hasLootReservations = !!(await supabase.from('raid_loot_reservation')
		.select('id')
		.eq('member_id', isLoggedInUser.id)
		.eq('reset_id', id)
		.limit(1))?.data?.length
	}

	const [previousReset, nextReset] = await findPreviousAndNextReset(supabase, raidDate)
	const raidStarted = moment().isAfter(raidStartDate)

	let isLoggedInUserLowGear = false
	let characterGearScore = 99999
	if (isLoggedInUser) {
		characterGearScore = await getCharacterGearScore(isLoggedInUser?.name)
		isLoggedInUserLowGear = characterGearScore < reset.raid.min_gs
	}

	return (
		<div className="w-full h-full flex flex-col relative scrollbar-pill grow-0 overflow-auto gap-4">
			<ParticipantsManager resetId={id} initialParticipants={participants}>
				<div className="w-full flex grow-0 gap-4">
					<div className="w-full h-full flex flex-col">
						<h4 className="font-bold text-large text-gold flex gap-2 items-center justify-start">{raidName} {status === 'offline' ? <span className="text-red-500 ml-2">Cancelled</span> : null}
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
							<ClassSummary raidId={id}/>
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
						<ChatContainer raidName={`${raidName} (${raidDate})`} resetId={id} showRedirect={true}/>
					</div>) : null}
				</div>
				{status !== 'offline' ? (
					<div className="absolute top-2 right-2 z-50 flex flex-col items-center gap-2 max-h-[200px]">
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
				) : null}
			</ParticipantsManager>
		</div>
	)
}
