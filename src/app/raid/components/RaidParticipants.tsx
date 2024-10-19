'use client'
import React, {useCallback, useEffect, useState} from "react";
import {
    Table,
    TableHeader,
    TableColumn,
    TableBody,
    TableRow,
    TableCell,
    Chip,
    Tooltip
} from "@nextui-org/react";
import Link from "next/link";
import {getClassIcon, getRoleIcon} from "@/app/apply/components/utils";
import {useSession} from "@/app/hooks/useSession";
import Image from "next/image";
import useScreenSize from "@/app/hooks/useScreenSize";
import moment from "moment";
import {useParticipants} from "@/app/raid/components/useParticipants";
import {GUILD_NAME} from "@/app/util/constants";
import {Button} from "@/app/components/Button";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faPersonCircleCheck, faPersonCircleXmark, faTrash} from "@fortawesome/free-solid-svg-icons";

const GuildMemberIndicator = (character: any) => {

    const isGuildie = character.guild?.name === GUILD_NAME;
    const guildName = character.guild?.name || 'Not guilded';
    return (
        <Tooltip content={guildName} placement={'top'}>
            <Chip
                className={`text-${isGuildie ? 'success' : 'warning'}`}
                color={isGuildie ? 'success' : 'warning'} size="sm" variant="flat">
                {isGuildie ? 'Yes' : 'No'}
            </Chip>
        </Tooltip>
    )
}

export default function RaidParticipants({participants, raidId, raidInProgress, days}: {
    participants: any[],
    raidId: string,
    raidInProgress: boolean
    days: string[]
}) {
    const {supabase, selectedCharacter, session: {isAdmin} = {}} = useSession()

    const stateParticipants = useParticipants(raidId, participants)
    const {isMobile} = useScreenSize()
    const initialColumns = [
        {name: "NAME", uid: "name"},
        {name: "ROLE", uid: "role"},
        {name: "STATUS", uid: "status"},
    ]
    const [columns, setColumns] = React.useState(initialColumns)
    useEffect(() => {
        if (isMobile) {
            setColumns(initialColumns)
        } else {
            setColumns([
                ...initialColumns,
                {name: "DAYS", uid: "days"},
                {name: "GUILDIE", uid: "is_guildie"},
            ])
            if (isAdmin) {
                setColumns(cols => [
                    ...cols,
                    {name: "ADMIN", uid: "admin"},
                ])
            }
        }
    }, [isMobile, isAdmin, selectedCharacter]);

    const [onlyConfirmed, setOnlyConfirmed] = useState(true)

    const renderCell = useCallback((registration: any, columnKey: React.Key) => {
        const {name, avatar, playable_class} = registration.member?.character
        const registrationDetails = registration.details

        switch (columnKey) {
            case "name":
                return (
                    <Link
                        href={`/roster/${name.toLowerCase()}`}
                        target={'_blank'}
                    >
                        <div className="flex flex-row items-center gap-2">
                            <Tooltip
                                content={`Confirmed at: ${moment(registration.created_at).format('MMM Do, h:mm:ss a')}`}>
                                <span
                                    className="w-4 flex flex-row-reverse"
                                >{registration.position}</span>
                            </Tooltip>
                            <Image
                                alt="User avatar"
                                width={24}
                                height={24}
                                className={`w-8 h-8 rounded-full ${!registration.is_confirmed && 'grayscale'} border border-gold`}
                                src={avatar}
                            />
                            <div className="flex items-center">
                                <h5 className="text-gold font-bold mr-2">{name} {(name === selectedCharacter?.name) ? '(You)' : null}</h5>
                            </div>
                        </div>
                    </Link>
                )
                    ;
            case "role":
                if (registrationDetails) {
                    return (
                        <div className="flex gap">
                            <img
                                className="w-6 h-6 rounded-full border border-gold"
                                src={getClassIcon(playable_class?.name)}
                                alt={playable_class?.name}
                            />
                            <Tooltip content={registrationDetails.role} placement={'top'}>
                                <img
                                    className="w-6 h-6 rounded-full border border-gold"
                                    src={getRoleIcon(registrationDetails.role)}
                                    alt={registrationDetails.role}
                                />
                            </Tooltip>
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
                            case 'confirmed':
                                return 'success'
                            case 'tentative':
                                return 'secondary'
                            case 'declined':
                                return 'danger'
                            default:
                                return 'warning'
                        }
                    })(registrationDetails?.status);
                    return (
                        <Chip className={`capitalize text-${color || 'default'}`} color={color}
                              size="sm"
                              variant="flat">
                            {registrationDetails.status}
                        </Chip>
                    );
                }
                return (
                    <Chip color={'warning'} size="sm" variant="flat" className="text-warning">
                        Pending
                    </Chip>
                );

            case "days":
                return (
                    <div className="flex gap">
                        {(days).sort((a: string, b: string) => {
                            //sorts the dates starting on Wednesday
                            const days = ['Wed', 'Thur', 'Fri', 'Sat', 'Sun', 'Mon', 'Tue'];
                            return days.indexOf(a) - days.indexOf(b);
                        }).map((day: string) => {
                            const isToday = day.indexOf(moment().format('ddd')) >= 0;
                            const isDayRegistered = (registrationDetails?.days ?? []).find((d: string) => day.indexOf(d) >= 0);
                            return (
                                <Chip
                                    key={day}
                                    className={`text-${isDayRegistered ? 'success' : 'danger'}` + ((raidInProgress && isToday) ? 'border-2 border-gold' : '')}
                                    color={isDayRegistered ? 'success' : 'danger'}
                                    size="sm"
                                    variant="flat">
                                    {day.substring(0, 2)}
                                </Chip>
                            )
                        })}
                    </div>
                );

            case "is_guildie":
                return <GuildMemberIndicator {...registration.member.character}/>

            case "admin":
                return (
                    <div
                        className="w-full flex items-center gap-2"
                    >
                        <Button
                            size="sm"
                            isIconOnly
                            onClick={() => {
                                const memberId = registration.member.character.id
                                const raidId = registration.raid_id
                                const confirm = window.confirm(`Are you sure you want to delete ${registration.member.character.name} from this raid?`)
                                if (!confirm) return
                                supabase?.from('ev_raid_participant')
                                    .delete()
                                    .eq('member_id', memberId)
                                    .eq('raid_id', raidId)
                                    .then((response) => {
                                        const {data, error: err} = response
                                        if (err) {
                                            console.error('Error deleting participant', err)
                                            return
                                        }
                                        console.log('Deleted participant', data)
                                    })
                            }}
                        >
                            <FontAwesomeIcon icon={faTrash}/>
                        </Button>
                    </div>
                )

            default:
                return <></>;
        }
    }, [selectedCharacter, supabase]);

    return (
        <Table
            className="w-full flex flex-col gap-2 scrollbar-pill overflow-auto"
            isHeaderSticky
            topContent={<div className="flex flex-row items-center gap-2 justify-center">
                <Button
                    className="flex-1"
                    onClick={() => setOnlyConfirmed(true)}
                    isDisabled={onlyConfirmed}
                >
                    {onlyConfirmed ? 'Showing only confirmed' : 'Show only confirmed '}
                    <FontAwesomeIcon icon={faPersonCircleCheck}/>
                </Button>
                <Button
                    className="flex-1"
                    onClick={() => setOnlyConfirmed(false)}
                    isDisabled={!onlyConfirmed}
                >
                    {onlyConfirmed ? 'Show all ' : 'Showing all '}
                    <FontAwesomeIcon icon={faPersonCircleXmark}/>
                </Button>
            </div>}
            topContentPlacement="outside"
        >
            <TableHeader columns={columns}>
                {(column) => (
                    <TableColumn key={column.uid} align={"start"}>
                        {column.name}
                    </TableColumn>
                )}
            </TableHeader>
            <TableBody
                className="scrollbar-pill"
                emptyContent={"No one signed up yet."}
                items={stateParticipants?.filter((x: any) => !onlyConfirmed || x.details.status === 'confirmed')
                    .sort((a: any, b: any) => {
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
                    return (
                        <TableRow
                            key={item.member.character.id}>
                            {(columnKey) => <TableCell>{renderCell(item, columnKey)}</TableCell>}
                        </TableRow>
                    )
                }}
            </TableBody>
        </Table>
    );
}
