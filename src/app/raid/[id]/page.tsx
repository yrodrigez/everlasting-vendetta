
import moment from "moment/moment";


import { ChatContainer } from "@/app/raid/[id]/chat/components/ChatContainer";
import AssistActions from "@/app/raid/components/AssistActions";
import { ClassSummary } from "@/app/raid/components/ClassSummary";
import { DiscordLink } from "@/app/raid/components/DiscordLink";
import { IsLowGsModal } from "@/app/raid/components/IsLowGsModal";
import { KpisView } from "@/app/raid/components/KpisView";
import { LockRaidButton } from "@/app/raid/components/LockRaidButton";
import ParticipantsManager from "@/app/raid/components/ParticipantsManager";
import { RaidOptions } from "@/app/raid/components/RaidOptions";
import RaidParticipants from "@/app/raid/components/RaidParticipants";
import RaidTimeInfo from "@/app/raid/components/RaidTimeInfo";
import { Button } from "@/components/Button";
import { SomethingWentWrong } from "@/components/something-went-wrong";
import { PageEvent } from '@/hooks/usePageEvent';
import { GUILD_REALM_SLUG, ROLE } from '@/util/constants';
import createServerSession from '@/util/supabase/createServerSession';
import { faArrowLeftLong, faCartPlus, faGift } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { MemberRolesRepository } from "../api/member-roles.repository";
import { ParticipantsService } from "../api/participants.service";
import { RaidResetViewDIContainer } from "../raid-reset-view-di.container";

export const dynamic = 'force-dynamic'
export const maxDuration = 60;

export { generateMetadata } from './generate-metadata';

const emptyRrs = { participantScores: [] }

async function getCharacterGearScore(characterName: string | undefined, realmSlug: string = GUILD_REALM_SLUG): Promise<number> {
    if (!characterName) return 99999
    const response = await fetch(`${process.env.NEXT_PUBLIC_EV_API_URL}/gearscore`, {
        method: 'POST',
        body: JSON.stringify({ characters: [{ name: characterName, realm: realmSlug }] }),
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

export default async function ({ params }: { params: Promise<{ id: string }> }) {
    const { getSupabase, auth, apiService } = await createServerSession();
    const isLoggedInUser = await auth.getSession()
    const { id: raidId } = await params
    const supabase = await getSupabase();
    const { raidResetViewService } = new RaidResetViewDIContainer(supabase);
    const { data: reset, error } = await raidResetViewService.getResetByResetId(raidId);

    if (error) {
        console.error('Error fetching reset', error)
        return <SomethingWentWrong
            header="Raid Not Found"
            body={error instanceof Error ? error.message : 'An unknown error occurred while fetching the raid reset.'}
            footer={<>
                <Button href="/calendar" as="a" className="bg-moss text-default font-bold rounded">Back to Raids</Button>
            </>}
        />
    }

    const memberRolesRepository = new MemberRolesRepository(supabase);
    const participantsService = new ParticipantsService(supabase, memberRolesRepository);

    const [participants, { previous: previousReset, next: nextReset }, hasLootReservations, hasLootHistory, characterGearScore, currentResets, resetRrs] = await Promise.all([
        participantsService.fetchParticipantsWithRoles(reset.id),
        raidResetViewService.findPreviousAndNext(reset.raid_date),
        raidResetViewService.hasCharacterReservations(reset.id, isLoggedInUser?.selectedCharacter?.id),
        raidResetViewService.hasResetLootHistory(reset.id),
        getCharacterGearScore(isLoggedInUser?.selectedCharacter?.name, reset?.realm),
        raidResetViewService.findResetsCurrentResetsFromSameRaid(reset.raid_id, reset.id),
        apiService.raids.getResetRrs(reset.id).catch((error) => {
            console.error('Error fetching reset RRS', error)
            return emptyRrs
        }),
    ])

    const { id, raid_date: raidDate, raid, time: raidTime, end_date, end_time: endTime, status, realm, is_reservations_allowed, created_by } = reset
    const { name: raidName, min_level: min_lvl } = raid
    const raidStartDate = moment(raidDate + ' ' + raidTime)
    const raidEndDate = moment(end_date + ' ' + endTime)
    const raidInProgress = moment().isBetween(raidStartDate, raidEndDate)
    const isRaidOver = moment().isAfter(raidEndDate)

    const raidStarted = moment().isAfter(raidStartDate)

    let isLoggedInUserLowGear = false
    if (isLoggedInUser) {
        isLoggedInUserLowGear = characterGearScore < reset.raid.min_gs
    }

    const canLockReset = !!(isLoggedInUser && (
        isLoggedInUser.isAdmin ||
        isLoggedInUser.roles?.includes(ROLE.RAID_LEADER) ||
        isLoggedInUser.roles?.includes(ROLE.LOOT_MASTER) ||
        isLoggedInUser.roles?.includes(ROLE.ADMIN) ||
        isLoggedInUser.selectedCharacter?.id === created_by
    ) && moment(end_date + ' ' + endTime).isAfter(moment()))

    return (
        <div className="w-full h-full flex flex-col relative scrollbar-pill grow-0 gap-4">
            <PageEvent name="raid" metadata={{ raidId: id, raidName }} />
            <ParticipantsManager resetId={id} initialParticipants={participants}>
                <div className="w-full flex grow-0 gap-4">
                    <div className="w-full h-full flex flex-col">
                        <h4 className="font-bold text-large text-gold flex gap-2 items-center justify-start">{raidName} {status === 'offline' ?
                            <span className="text-red-500 ml-2">Cancelled</span> : (
                                status === 'locked' ? <span className="text-yellow-500 ml-2">Locked</span> : null
                            )}
                            {isLoggedInUserLowGear && <IsLowGsModal
                                isLowGs={isLoggedInUserLowGear}
                                characterGearScore={characterGearScore}
                                minGs={reset?.raid?.min_gs}
                            />}
                        </h4>
                        <span className="text-lg font-bold">Starts: {raidStartDate.format('dddd, MMMM D')} at {raidTime.split(':').slice(0, 2).join(':')} </span>
                        <small className="text-primary">Ends: {endTime.split(':').slice(0, 2).join(':')}</small>
                        <KpisView
                            participants={participants}
                            raidId={id}
                            raidSize={reset?.raid?.size}
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
                        realm={realm}
                        status={status}
                        hasLootReservations={hasLootReservations || !is_reservations_allowed} // if reservations are not allowed, show as if the user has reservations to encourage them to join
                        raidId={id}
                        minLvl={min_lvl}
                        endDate={end_date}
                        participants={participants}
                        endTime={endTime}
                    />
                </div>
                <div className="w-full h-full flex gap-2 lg:flex-row flex-col-reverse overflow-auto">
                    <RaidParticipants
                        raidInProgress={raidInProgress}
                        participants={participants}
                        currentResets={currentResets.data ?? []}
                        resetId={id}
                        participantScores={resetRrs.participantScores}
                        raidId={reset.raid_id}
                        minGs={reset.raid.min_gs}
                        createdById={created_by}
                        raidSize={reset.raid.size}
                        isRaidOver={isRaidOver}
                        raidStartDate={raidStartDate.toISOString()}
                        raidEndDate={raidEndDate.toISOString()}
                    />
                    {!!isLoggedInUser ? (<div className="w-full lg:max-w-80 flex-grow-0 max-h-fit">
                        <ChatContainer realmslug={realm} raidName={`${raidName} (${raidDate})`} resetId={id} showRedirect={true} />
                    </div>) : null}
                </div>
                {status !== 'offline' ? (
                    <div className="absolute top-2 right-2 z-50 flex flex-col items-center gap-2 max-h-[200px]">
                        <RaidOptions
                            currentResetId={id}
                            hasLoot={hasLootHistory}
                            previousResetId={previousReset?.data?.id}
                            nextResetId={nextReset?.data?.id}
                            raidStarted={raidStarted}
                            raidSize={reset.raid.size}
                            createdById={created_by}
                            participantScores={resetRrs.participantScores}
                        />
                        <DiscordLink raidId={id} />
                        {is_reservations_allowed && (
                            <div
                                className="relative overflow-visible"
                            >
                                <Button
                                    tooltip={{
                                        content: "SR",
                                        placement: "right"
                                    }}
                                    href={`/raid/${id}/soft-reserv`}
                                    as="a"
                                    className={`bg-moss text-default font-bold rounded ${!hasLootReservations && isLoggedInUser ? 'shadow-2xl shadow-gold border-2 animate-blink-and-glow' : ''}`}
                                    isIconOnly>
                                    <FontAwesomeIcon icon={faCartPlus} />
                                </Button>
                                {!hasLootReservations && isLoggedInUser && (
                                    <div className="animate-attention-arrow pointer-events-none absolute left-14 top-1/2 z-50 mr-2 flex items-center gap-2 whitespace-nowrap">
                                        <FontAwesomeIcon
                                            icon={faArrowLeftLong}
                                            className="text-xl text-gold drop-shadow-[0_0_8px_rgba(248,113,113,0.9)]"
                                        />
                                        <span className="rounded-full border border-gold-100 bg-gold px-2 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-default shadow-lg shadow-gold/40">
                                            Reserve
                                        </span>
                                    </div>
                                )}
                            </div>)}
                        {hasLootHistory && (
                            <Button
                                tooltip={{
                                    content: 'Loot',
                                    placement: 'right'
                                }}
                                as="a"
                                href={`/raid/${id}/loot`}
                                className="bg-moss text-default font-bold rounded" isIconOnly>
                                <FontAwesomeIcon icon={faGift} />
                            </Button>
                        )}
                        {canLockReset && (
                            <LockRaidButton resetId={id} currentStatus={status} />
                        )}
                    </div>
                ) : null}
            </ParticipantsManager>
        </div>
    )
}
