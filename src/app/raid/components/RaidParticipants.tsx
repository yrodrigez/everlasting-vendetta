'use client'
import { getClassIcon, getRoleIcon } from "@/app/apply/components/utils";
import { RaidParticipant } from "@/app/raid/api/types";
import AdminActions from "@/app/raid/components/admin-actions";
import BenchParticipant from "@/app/raid/components/BenchParticipant";
import { getSubscriptionStatusText } from "@/app/raid/components/get-status-text";
import { MoveParticipant } from "@/app/raid/components/move-participant";
import { useParticipants } from "@/app/raid/components/useParticipants";
import { useScrollToRaidParticipant } from "@/app/raid/components/useScrollToRaidParticipant";
import { RAID_STATUS } from "@/app/raid/components/utils";
import { Button } from "@/components/Button";
import { useCharacterStore } from "@/components/characterStore";
import GearScore from "@/components/GearScore";
import { useAuth } from "@/context/AuthContext";
import { useSupabase } from "@/context/SupabaseContext";
import { sendActionEvent } from '@/hooks/usePageEvent';
import useScreenSize from '@/hooks/useScreenSize';
import { GUILD_NAME } from '@/util/constants';
import { createRosterMemberRoute } from "@/util/create-roster-member-route";
import { useMessageBox } from '@/util/msgBox';
import {
    faChair,
    faCircleCheck, faCircleQuestion, faCircleXmark, faClock,
    faCrown,
    faInfoCircle,
    faTrash
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Avatar, Chip, Table, TableBody, TableCell, TableColumn, TableHeader, TableRow, Tooltip } from "@heroui/react";
import { useQuery } from "@tanstack/react-query";
import moment from "moment";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useCallback, useEffect, useState } from "react";
import { useShallow } from "zustand/react/shallow";


const GuildMemberIndicator = (character: any) => {
    const isGuildie = character.guild?.name === GUILD_NAME;
    const guildName = character.guild?.name || 'Not guilded';
    return (
        <Tooltip content={guildName} placement={'top'} isDisabled={isGuildie}>
            <Chip
                className={`text-${isGuildie ? 'success' : 'warning'}`}
                color={isGuildie ? 'success' : 'warning'} size="sm" variant="flat">
                {isGuildie ? 'Yes' : 'No'}
            </Chip>
        </Tooltip>
    )
}

type RaidParticipantWithPosition = RaidParticipant & {
    position: number;
}

export default function RaidParticipants({ participants, resetId, raidId, minGs, currentResets, createdById, raidSize = 10, isRaidOver, raidStartDate, raidEndDate }: {
    participants: RaidParticipant[],
    resetId: string,
    raidId: string,
    raidInProgress: boolean
    minGs: number,
    currentResets: { id: string, raid_date: string, raid_time: string }[],
    sanctifiedData?: { characterName: string, count: number, characterId: string }[],
    createdById: number,
    raidSize: number,
    isRaidOver: boolean,
    raidStartDate: string,
    raidEndDate: string,
}) {
    const { user } = useAuth()
    const supabase = useSupabase();
    const selectedCharacter = useCharacterStore(useShallow(state => ({ ...state.selectedCharacter })));
    const router = useRouter();

    const stateParticipants = useParticipants(resetId, participants)
    const { isMobile } = useScreenSize()
    const sortedParticipants: RaidParticipantWithPosition[] = [...(stateParticipants ?? [])]
        .sort((a, b) => {

            if (a.details?.status === 'confirmed' && b.details?.status !== 'confirmed') {
                return -1
            }
            if (a.details?.status !== 'confirmed' && b.details?.status === 'confirmed') {
                return 1
            }

            const isARaidLeader = a.roles?.includes('RAID_LEADER') || createdById === (a.member.character?.id || 0)
            const isBRaidLeader = b.roles?.includes('RAID_LEADER') || createdById === (b.member.character?.id || 0)
            if (isARaidLeader && !isBRaidLeader) {
                return -1
            }
            if (!isARaidLeader && isBRaidLeader) {
                return 1
            }

            const aIsGuildie = a.member.character.guild?.name === GUILD_NAME
            const bIsGuildie = b.member.character.guild?.name === GUILD_NAME

            if (aIsGuildie && !bIsGuildie) {
                return -1
            }
            if (!aIsGuildie && bIsGuildie) {
                return 1
            }

            const aIsPriority = a.roles ? ['GUILD_MASTER', 'COMRADE', 'RAID_LEADER', 'LOOT_MASTER', 'RAIDER'].some(r => a.roles?.includes(r)) : false
            const bIsPriority = b.roles ? ['GUILD_MASTER', 'COMRADE', 'RAID_LEADER', 'LOOT_MASTER', 'RAIDER'].some(r => b.roles?.includes(r)) : false

            if (aIsPriority && !bIsPriority) {
                return -1
            }
            if (!aIsPriority && bIsPriority) {
                return 1
            }



            const aCreated = new Date(a.created_at)
            const bCreated = new Date(b.created_at)
            return aCreated.getTime() - bCreated.getTime()
        })
        .map((participant, index) => ({
            ...participant,
            position: index + 1
        }))
    const isSelectedParticipantPresent = sortedParticipants.some((participant) => participant.member.character.id === selectedCharacter?.id)
    const { focusedParticipantId, isFocusActive } = useScrollToRaidParticipant({
        participantId: selectedCharacter?.id,
        isParticipantPresent: isSelectedParticipantPresent,
    })
    const initialColumns = [
        { name: "NAME", uid: "name" },
        { name: "ROLE", uid: "role" },
        { name: "STATUS", uid: "status" },
    ]
    const [columns, setColumns] = useState(initialColumns)
    useEffect(() => {
        if (isMobile) {
            setColumns(initialColumns)
        } else {
            setColumns([
                ...initialColumns,
                { name: "GEAR SCORE", uid: "gs" },
            ])
            if (user?.isAdmin) {
                setColumns(cols => [
                    ...cols,
                    { name: "ADMIN", uid: "admin" },
                ])
            }
        }
    }, [isMobile, user, selectedCharacter]);

    const { yesNo } = useMessageBox()
    const { data: guildEvent } = useQuery({
        queryKey: ['guildEvent', resetId],
        queryFn: async () => {
            const { data = [], error = false } = (await supabase?.from('guild_events_participants').select('*')
                .eq('event_id', 1)
                .eq('position', 1))
                ?? {}

            if (error) {
                console.error('Error fetching guild event', error)
                return []
            }

            return data
        },
        enabled: !!resetId && !!supabase,
        staleTime: 1000 * 60 * 5, // 5 minutes
        retry: 3,
    })

    const renderCell = useCallback((registration: { member: RaidParticipant } & any, columnKey: React.Key, isOverflow: boolean) => {
        const { name, avatar, playable_class, id, realm = { slug: 'living-flame' } } = registration.member?.character
        const registrationDetails = registration.details
        const roles = registration.roles || []
        const isPriority = ['GUILD_MASTER', 'COMRADE', 'RAID_LEADER', 'LOOT_MASTER', 'RAIDER'].some(r => roles.includes(r))
        const isRaidLeader = roles.includes('RAID_LEADER') || createdById === registration.member.character.id
        const isYourself = selectedCharacter?.id === id

        const isGuildie = registration.member.character.guild?.name === GUILD_NAME

        switch (columnKey) {

            case "gs":
                return (
                    <GearScore realm={realm.slug} characterName={name} min={minGs}
                        allowForce={user?.isAdmin || (selectedCharacter?.id || 0) === registration?.member?.character?.id} />
                )
            case "name":
                return (
                    <Tooltip
                        className="border border-wood-100"
                        isDisabled={!isOverflow}
                        showArrow
                        content={<>
                            <div className="flex items-center gap-2 max-w-72 flex-col p-2">
                                <FontAwesomeIcon icon={faChair} />
                                <span>This spot exceeds the raid size limit of <strong>{raidSize}</strong>. If the raid is full, this participant may be moved to other raid or be benched.</span>
                                <span className="text-gray-500 text-xs flex gap-1 flex-col">
                                    <span className="flex items-center gap-1"><FontAwesomeIcon icon={faInfoCircle} /> Bench priority (lowest priority gets benched first):</span>
                                    <ol className="list-decimal list-inside ml-2">
                                        <li>Confirmed participants over tentative/pending</li>
                                        <li>Raiders</li>
                                        <li>Guild members</li>
                                        <li>Non-guild members</li>
                                        <li>Earlier sign-ups over later ones</li>
                                    </ol>
                                </span>
                            </div>
                        </>} placement="top">
                        <Link
                            href={createRosterMemberRoute(name, realm.slug)}
                            target={'_blank'}
                            className="relative"
                        >
                            <div className="flex flex-row items-center gap-2">
                                {isGuildie ? (
                                    <Tooltip showArrow content={<div>
                                        <div className="flex gap-4 flex-col">
                                            <div className="flex items-center gap-1">
                                                <FontAwesomeIcon icon={faCircleCheck} className="text-success" />
                                                {`Guild member rank: ${isRaidLeader ? 'Raid Leader' : isPriority ? 'Raider' : 'Guildie'}`}
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <FontAwesomeIcon icon={faClock} />
                                                Confirmed at: {moment(registration.created_at).format('MMM Do, h:mm:ss a')}
                                            </div>

                                            <span className="text-gray-500 text-xs flex gap-1"><FontAwesomeIcon icon={faInfoCircle} />Guild members have priority for raid spots.</span>
                                        </div>
                                    </div>} placement="top">
                                        <div
                                            className="relative flex items-center justify-center"
                                        >
                                            <FontAwesomeIcon className={`w-3 h-3 ${isRaidLeader ? 'text-legendary' : isPriority ? 'text-yellow-400' : 'text-moss-100'} `} icon={faCrown} />
                                            {isRaidLeader && (<div
                                                className={`shadow-sm shadow-legendary rounded-full absolute top-0 left-0 w-full h-full flex items-center justify-center`}
                                            >
                                                <div
                                                    className={`rounded-full absolute top-0 left-0 w-full h-full bg-legendary/50`}
                                                />
                                            </div>)}
                                        </div>
                                    </Tooltip>
                                ) : <div className="w-4" />}
                                <div
                                    className="relative overflow-visible"
                                >
                                    <Avatar
                                        alt="User avatar"
                                        className={`min-w-7 min-h-7 max-w-7 max-h-7 rounded-full ${!registration.is_confirmed && 'grayscale'} border border-gold`}
                                        src={avatar}
                                    />
                                </div>
                                <div className="flex items-center break-all w-full gap-1">

                                    <h5 className={`text-${playable_class?.name?.toLowerCase() ?? 'gold'} mr-2`}>{name} {isYourself ? '(You)' : null}</h5>
                                    {isYourself && registration.position ? (
                                        <Chip color="warning" size="sm" variant="flat" className="text-gold">
                                            #{registration.position}
                                        </Chip>
                                    ) : null}
                                </div>
                            </div>
                        </Link>
                    </Tooltip>
                )
                    ;
            case "role":
                if (registrationDetails) {
                    return (
                        <div className="flex w-12 h-8 gap-0.5">
                            <div className="relative group">
                                <img
                                    className="
                                    w-6 h-6
                                    rounded-full
                                    border border-wood-100 shadow shadow-wood-100
                                "
                                    src={getClassIcon(playable_class?.name)}
                                    alt={playable_class?.name}
                                />
                                {registrationDetails.role.split('-').map((roleValue: string, i: number, arr: string[]) => (
                                    <img
                                        key={roleValue}
                                        className={`
                                        absolute top-0 ${(i === 0 && arr.length === 1) ? 'left-5' : i === 0 ? 'left-3' : 'left-6'}
                                        w-6 h-6
                                        rounded-full
                                        transition-all duration-300
                                        border border-wood-100 shadow shadow-wood-100
                                        ${(i === 0 && arr.length === 1) ? '' : (i === 0) ? 'group-hover:translate-x-2.5 group-hover:-translate-y-3' : 'group-hover:-translate-x-0.5 group-hover:translate-y-3'}
                                        
                                    `}
                                        src={getRoleIcon(roleValue)}
                                        alt={roleValue}
                                    />
                                ))}
                            </div>
                        </div>
                    );
                }
                return (
                    <div className="flex flex-col">
                        <img
                            className="w-6 h-6 rounded-full border border-gold"
                            src={getClassIcon(playable_class?.name)}
                            alt={playable_class?.name}
                        />
                    </div>
                );
            case "status":
                if (registrationDetails) {
                    const color = ((status: string) => {
                        switch (status) {
                            case RAID_STATUS.CONFIRMED:
                                return 'success'
                            case RAID_STATUS.TENTATIVE:
                                return 'secondary'
                            case RAID_STATUS.DECLINED:
                                return 'default'
                            default:
                                return 'warning'
                        }
                    })(registrationDetails?.status);

                    const statusIcon = (status: string) => {
                        switch (status) {
                            case RAID_STATUS.CONFIRMED:
                                return faCircleCheck
                            case RAID_STATUS.DECLINED:
                                return faCircleXmark
                            case RAID_STATUS.LATE:
                                return faClock
                            case RAID_STATUS.BENCH:
                                return faChair
                            default:
                                return faCircleQuestion
                        }
                    };

                    return (
                        <Chip
                            className={`capitalize text-${registrationDetails.status === RAID_STATUS.TENTATIVE ? 'default' : color || 'default'}`}
                            color={color}
                            size="sm"
                            variant="flat">
                            <span
                                className="mr-1"
                            ><FontAwesomeIcon icon={statusIcon(registrationDetails.status)} /></span>
                            {getSubscriptionStatusText(registrationDetails.status)}
                        </Chip>
                    );
                }
                return (
                    <Chip color={'warning'} size="sm" variant="flat" className="text-warning">
                        Pending
                    </Chip>
                );

            case "is_guildie":
                return <GuildMemberIndicator {...registration.member.character} />

            case "admin":
                return (
                    <div className="w-full flex items-center gap-2">
                        <AdminActions>
                            <BenchParticipant
                                resetId={resetId}
                                memberId={registration.member.character.id}
                                currentStatus={registrationDetails?.status}
                                supabase={supabase}
                                currentDetails={registrationDetails}
                            />
                            <MoveParticipant
                                memberId={registration.member.character.id}
                                raidId={raidId}
                                currentResets={(currentResets ?? []).filter(r => r.id !== resetId)}
                                resetId={resetId}
                                onSuccess={router.refresh}
                                raidStartDate={raidStartDate}
                                raidEndDate={raidEndDate}
                            />
                            <div
                                className="flex items-center gap-2 justify-between w-full p-2 border text-red-600 border-red-600 hover:bg-red-700 hover:text-default rounded-lg transition-all duration-200"
                            >
                                <span>Remove from raid</span>
                                <Button
                                    size="sm"
                                    isIconOnly
                                    className="bg-red-800 border border-red-600 text-white rounded"
                                    onPress={() => {
                                        const memberId = registration.member.character.id
                                        const raidId = registration.raid_id
                                        yesNo({
                                            message: `Are you sure you want to delete ${registration.member.character.name} from this raid?`,
                                            modYes: 'danger',
                                            title: `Delete ${registration.member.character.name}`,
                                            modNo: 'default',
                                            noText: 'No',
                                            yesText: 'Yes'
                                        }).then((response) => {
                                            if (response !== 'yes') return
                                            sendActionEvent('raid_remove_player', { raidId, memberId, playerName: registration.member.character.name });
                                            supabase?.from('ev_raid_participant')
                                                .delete()
                                                .eq('member_id', memberId)
                                                .eq('raid_id', raidId)
                                                .then((response) => {
                                                    const { error: err } = response
                                                    if (err) {
                                                        alert('Error deleting participant');
                                                        console.error('Error deleting participant', err)
                                                        return
                                                    }
                                                })
                                        })
                                    }}
                                >
                                    <FontAwesomeIcon icon={faTrash} />
                                </Button>
                            </div>
                        </AdminActions>
                    </div>
                )

            default:
                return <></>;
        }
    }, [selectedCharacter, supabase, guildEvent, yesNo, user]);

    return (
        <Table
            classNames={{
                th: 'relative',
                wrapper: "border border-wood-100 scrollbar-pill",
            }}
            className="w-full h-full flex flex-col gap-2 scrollbar-pill overflow-auto"
            isHeaderSticky
        >
            <TableHeader
                className="shadow-gold shadow"
                columns={columns}>
                {(column) => (
                    <TableColumn key={column.uid} align={"start"}>
                        <div className="border-y border-moss-100 absolute h-full w-full top-0 left-0 inline-block" />
                        {column.name}
                    </TableColumn>
                )}
            </TableHeader>
            <TableBody
                className="scrollbar-pill"
                emptyContent={"No one signed up yet."}
                items={sortedParticipants}>
                {(item: any) => {
                    const isOverflow = item.position > raidSize
                    const isThreshold = item.position === raidSize
                    const isYourself = selectedCharacter?.id === item.member.character.id
                    const isFocusedParticipant = focusedParticipantId === item.member.character.id
                    return (
                        <TableRow
                            key={item.member.character.id}
                            id={`participant-${item.member.character.id}`}
                            className={`transition-all duration-300 ${isThreshold ? 'border-b-wood-100' : ''} ${isOverflow ? 'opacity-50' : ''} ${isFocusActive && !isFocusedParticipant ? 'blur-[1px] opacity-35' : ''} ${isFocusActive && isFocusedParticipant ? 'bg-gold/30 border-gold/70 shadow-md shadow-gold/20' : ''}`}
                        >
                            {(columnKey) => <TableCell>{renderCell(item, columnKey, isOverflow)}</TableCell>}
                        </TableRow>
                    )
                }}
            </TableBody>
        </Table>

    );
}
