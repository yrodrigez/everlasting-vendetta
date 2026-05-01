'use client'
import { getClassIcon, getRoleIcon } from "@/app/apply/components/utils";
import { RaidParticipant } from "@/app/raid/api/types";
import AdminActions from "@/app/raid/components/admin-actions";
import BenchParticipant from "@/app/raid/components/BenchParticipant";
import ChangeParticipantRole from "@/app/raid/components/ChangeParticipantRole";
import ChangeParticipantStatus from "@/app/raid/components/ChangeParticipantStatus";
import { getSubscriptionStatusText } from "@/app/raid/components/get-status-text";
import { MoveParticipant } from "@/app/raid/components/move-participant";
import { RrsBadge } from "@/app/raid/components/RrsBadge";
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
import type { RaidParticipantRrsScore } from "@/lib/api";
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
import { Avatar, Chip, Table, TableBody, TableCell, TableColumn, TableHeader, TableRow } from "@heroui/react";
import { useQuery } from "@tanstack/react-query";
import moment from "moment";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useShallow } from "zustand/react/shallow";
import { createParticipantScoreKey, getRaidReadinessScore, sortParticipantsByComposition } from "../raid-priority-comparator";
import type { CompositionRole, RaidComposition } from "../raid-priority-comparator";
import { Tooltip } from "@/components/tooltip";


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
    hasCompositionSpot?: boolean;
    assignedCompositionRole?: CompositionRole;
    isCompositionBucketStart?: boolean;
    isCompositionBucketEnd?: boolean;
}

const compositionRoleLabels: Record<CompositionRole, string> = {
    tank: 'Tank',
    healer: 'Healer',
    dps: 'DPS',
}

export default function RaidParticipants({ participants, resetId, participantScores, raidId, minGs, currentResets, createdById, raidSize = 10, composition, isRaidOver, raidStartDate, raidEndDate }: {
    participants: RaidParticipant[],
    resetId: string,
    participantScores: RaidParticipantRrsScore[],
    raidId: string,
    raidInProgress: boolean
    minGs: number,
    currentResets: { id: string, raid_date: string, raid_time: string }[],
    sanctifiedData?: { characterName: string, count: number, characterId: string }[],
    createdById: number,
    raidSize: number,
    composition: RaidComposition,
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
    const participantScoreByCharacterKey = useMemo(() => new Map(
        participantScores.map((score) => [createParticipantScoreKey(score.characterName, score.realmSlug), score])
    ), [participantScores])

    const sortedParticipants: RaidParticipantWithPosition[] = useMemo(() => sortParticipantsByComposition(stateParticipants ?? [], participantScoreByCharacterKey, createdById, composition)
        .map((participant, index, allParticipants) => {
            const assignedCompositionRole = participant.assignedCompositionRole
            const previousRole = allParticipants[index - 1]?.assignedCompositionRole
            const nextRole = allParticipants[index + 1]?.assignedCompositionRole

            return {
                ...participant,
                position: index + 1,
                isCompositionBucketStart: !!assignedCompositionRole && assignedCompositionRole !== previousRole,
                isCompositionBucketEnd: !!assignedCompositionRole && assignedCompositionRole !== nextRole,
            }
        }), [stateParticipants, participantScoreByCharacterKey, createdById, composition])
    const isSelectedParticipantPresent = sortedParticipants.some((participant) => participant.member.character.id === selectedCharacter?.id)
    const { focusedParticipantId, isFocusActive } = useScrollToRaidParticipant({
        participantId: selectedCharacter?.id,
        isParticipantPresent: isSelectedParticipantPresent,
    })

    useEffect(() => {
        if (typeof document === 'undefined') return
        const rows = document.querySelectorAll<HTMLElement>('[id^="participant-"]')
        const blurClasses = ['blur-[1px]', 'opacity-35']
        const focusClasses = ['bg-gold/30', 'border-gold/70', 'shadow-md', 'shadow-gold/20']
        rows.forEach((row) => {
            const rowId = Number(row.id.replace('participant-', ''))
            const isRowFocused = focusedParticipantId !== null && rowId === focusedParticipantId
            const shouldBlur = isFocusActive && !isRowFocused
            const shouldHighlight = isFocusActive && isRowFocused
            blurClasses.forEach((cls) => row.classList.toggle(cls, shouldBlur))
            focusClasses.forEach((cls) => row.classList.toggle(cls, shouldHighlight))
        })
    }, [focusedParticipantId, isFocusActive, sortedParticipants])

    const initialColumns = [
        { name: "NAME", uid: "name" },
        { name: "ROLE", uid: "role" },
        { name: "STATUS", uid: "status" },
        { name: "RRS", uid: "reliability" },
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
    

    const renderCell = useCallback((registration: { member: RaidParticipant } & any, columnKey: React.Key, isOverflow: boolean) => {
        const { name, avatar, playable_class, id, realm = { slug: 'living-flame' } } = registration.member?.character
        const registrationDetails = registration.details
        const roles = registration.roles || []
        const isPriority = ['GUILD_MASTER', 'COMRADE', 'RAID_LEADER', 'LOOT_MASTER', 'RAIDER'].some(r => roles.includes(r))
        const isRaidLeader = roles.includes('RAID_LEADER') || createdById === registration.member.character.id
        const isYourself = selectedCharacter?.id === id

        const isGuildie = registration.member.character.guild?.name === GUILD_NAME
        const roleValues = registrationDetails?.role?.split('-') ?? []
        const assignedCompositionRole = registration.assignedCompositionRole as (CompositionRole | undefined)
        const assignedCompositionRoleLabel = assignedCompositionRole ? compositionRoleLabels[assignedCompositionRole] : ''
        const showAssignedRole = !!assignedCompositionRole && (
            roleValues.length > 1
        )

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
                                <span>
                                    This spot exceeds the raid size limit of <strong>{raidSize}</strong>. If the raid is full, this participant may be moved to another raid or benched.
                                </span>

                                <span className="text-gray-500 text-xs flex gap-1 flex-col">
                                    <span className="flex items-center gap-1">
                                        <FontAwesomeIcon icon={faInfoCircle} />
                                        Spot priority:
                                    </span>

                                    <ol className="list-decimal list-inside ml-2">
                                        <li>Main roles are picked before flex roles</li>
                                        <li>Flex role tie-breaks: tank, then healer, then DPS</li>
                                        <li>When role slots are full, remaining spots use RRS</li>
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
                                <div className="flex items-center min-w-0 gap-1.5 flex-nowrap">
                                    <h5 className={`text-${playable_class?.name?.toLowerCase() ?? 'gold'} truncate`}>{name} {isYourself ? '(You)' : null}</h5>
                                    {showAssignedRole && (
                                        <Tooltip
                                            showArrow
                                            content={`${name} signed up as ${roleValues.join('/')} and is being counted as ${assignedCompositionRoleLabel} for this raid composition.`}
                                            placement="top"
                                        >
                                            <img
                                                className="w-4 h-4 rounded-full"
                                                src={getRoleIcon(assignedCompositionRole!)}
                                                alt={assignedCompositionRoleLabel}
                                            />
                                        </Tooltip>
                                    )}
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
                                {roleValues.map((roleValue: string, i: number, arr: string[]) => (
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

            case "reliability": {
                const participantScore = participantScoreByCharacterKey.get(createParticipantScoreKey(name, realm.slug))
                const readinessScore = getRaidReadinessScore(registration, participantScoreByCharacterKey)

                return (
                    <RrsBadge participantScore={participantScore} readinessScore={readinessScore} />
                )
            }

            case "is_guildie":
                return <GuildMemberIndicator {...registration.member.character} />

            case "admin":
                return (
                    <div className="w-full flex items-center gap-2">
                        <AdminActions>
                            <ChangeParticipantRole
                                resetId={resetId}
                                memberId={registration.member.character.id}
                                supabase={supabase}
                                currentDetails={registrationDetails}
                            />
                            <ChangeParticipantStatus
                                resetId={resetId}
                                memberId={registration.member.character.id}
                                currentStatus={registrationDetails?.status}
                                supabase={supabase}
                                currentDetails={registrationDetails}
                            />
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
    }, [selectedCharacter, supabase, yesNo, user, participantScoreByCharacterKey, createdById]);

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
                    const isOverflow = item.hasCompositionSpot === false || item.position > raidSize
                    const isThreshold = item.position === raidSize
                    const isYourself = selectedCharacter?.id === item.member.character.id
                    const isSizeLimitExceeded = sortedParticipants.length > raidSize
                    
                    return (
                        <TableRow
                            key={item.member.character.id}
                            id={`participant-${item.member.character.id}`}
                            className={`transition-all duration-300  ${isYourself ? 'bg-gold/25' : ''} ${(isThreshold && isSizeLimitExceeded) ? 'border-b border-b-wood-100' : ''} ${isOverflow ? 'opacity-50' : ''}`}
                        >
                            {(columnKey) => <TableCell>{renderCell(item, columnKey, isOverflow)}</TableCell>}
                        </TableRow>
                    )
                }}
            </TableBody>
        </Table>

    );
}
