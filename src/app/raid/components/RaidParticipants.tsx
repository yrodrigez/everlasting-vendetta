'use client'
import { getClassIcon, getRoleIcon } from "@/app/apply/components/utils";
import { RaidParticipant } from "@/app/raid/api/types";
import AdminActions from "@/app/raid/components/admin-actions";
import BenchParticipant from "@/app/raid/components/BenchParticipant";
import { getSubscriptionStatusText } from "@/app/raid/components/get-status-text";
import { MoveParticipant } from "@/app/raid/components/move-participant";
import { useParticipants } from "@/app/raid/components/useParticipants";
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
    faPersonCircleCheck,
    faPersonCircleXmark,
    faTrash, faTriangleExclamation
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

export default function RaidParticipants({ participants, resetId, raidId, raidInProgress, days, minGs, sanctifiedData, currentResets }: {
    participants: RaidParticipant[],
    resetId: string,
    raidId: string,
    raidInProgress: boolean
    days: string[],
    minGs: number,
    currentResets: { id: string, raid_date: string }[],
    sanctifiedData?: { characterName: string, count: number, characterId: string }[]
}) {
    const { user } = useAuth()
    const supabase = useSupabase();
    const selectedCharacter = useCharacterStore(useShallow(state => ({ ...state.selectedCharacter })));
    const router = useRouter();

    const stateParticipants = useParticipants(resetId, participants)
    const { isMobile } = useScreenSize()
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
                (sanctifiedData ? { name: "SANCT", uid: "sanctified" } : { name: "GUILDIE", uid: "is_guildie" }),
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

    const renderCell = useCallback((registration: { member: RaidParticipant } & any, columnKey: React.Key) => {
        const { name, avatar, playable_class, id, realm = { slug: 'living-flame' } } = registration.member?.character
        const registrationDetails = registration.details
        const sanctifiedCount = sanctifiedData?.find(x => x.characterId === id)?.count

        switch (columnKey) {
            case "sanctified":
                return (

                    <Tooltip content={`Sanctified: ${sanctifiedCount}`}>
                        <div className="flex flex-row items-center gap-0.5">
                            <span
                                className="w-full h-full py-1 flex items-center justify-center bg-sanctified-900 border border-sanctified-50 text-xs font-bold text-sanctified rounded-full relative"
                            >{sanctifiedCount}
                                {sanctifiedCount !== undefined && sanctifiedCount < 8 && (
                                    <FontAwesomeIcon icon={faTriangleExclamation}
                                        className="text-red-600 absolute -right-4" beat />
                                )}
                            </span>
                        </div>
                    </Tooltip>

                )
            case "gs":
                return (
                    <GearScore realm={realm.slug} characterName={name} min={minGs}
                        allowForce={user?.isAdmin || (selectedCharacter?.id || 0) === registration?.member?.character?.id} />
                )
            case "name":
                return (
                    <Link
                        href={createRosterMemberRoute(name, realm.slug)}
                        target={'_blank'}
                    >
                        <div className="flex flex-row items-center gap-2">
                            <Tooltip
                                content={`Confirmed at: ${moment(registration.created_at).format('MMM Do, h:mm:ss a')}`}>
                                <span
                                    className="min-w-4 flex flex-row-reverse"
                                >{registration.position}</span>
                            </Tooltip>
                            <div
                                className="relative overflow-visible"
                            >
                                <Avatar
                                    alt="User avatar"
                                    className={`min-w-8 min-h-8 max-w-8 max-h-8 rounded-full ${!registration.is_confirmed && 'grayscale'} border border-gold`}
                                    src={avatar}
                                />
                            </div>
                            <div className="flex items-center break-all">
                                <h5 className={`text-gold font-bold mr-2`}>{name} {(name === selectedCharacter?.name) ? '(You)' : null}</h5>
                            </div>
                        </div>
                    </Link>
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
                                currentResets={currentResets ?? []}
                                resetId={resetId}
                                onSuccess={router.refresh}
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
                items={stateParticipants
                    ?.sort((a: any, b: any) => {
                        if (a.details?.status === 'confirmed' && b.details?.status !== 'confirmed') {
                            return -1
                        }
                        if (a.details?.status !== 'confirmed' && b.details?.status === 'confirmed') {
                            return 1
                        }

                        const aCreated = new Date(a.created_at)
                        const bCreated = new Date(b.created_at)
                        return aCreated.getTime() - bCreated.getTime()
                    }).map((x: any, index) => {
                        return {
                            ...x,
                            position: index + 1
                        }
                    }).reduce((acc, curr) => {
                        if (selectedCharacter?.id === curr.member.character.id) {
                            return [curr, ...acc]
                        }
                        return [...acc, curr]
                    }, [])}>
                {(item: any) => {
                    const isSpecial = guildEvent?.find((x: any) => x.member_id === item.member.character.id)
                    return (
                        <TableRow
                            key={item.member.character.id}
                            className={`${isSpecial ? 'border-legendary shadow-sm shadow-legendary bg-legendary/50' : ''}`}
                        >
                            {(columnKey) => <TableCell>{renderCell(item, columnKey)}</TableCell>}
                        </TableRow>
                    )
                }}
            </TableBody>
        </Table>

    );
}
