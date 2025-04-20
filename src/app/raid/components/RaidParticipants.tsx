'use client'
import React, {useCallback, useEffect, useState} from "react";
import {Chip, Table, TableBody, TableCell, TableColumn, TableHeader, TableRow, Tooltip} from "@heroui/react";
import Link from "next/link";
import {getClassIcon, getRoleIcon} from "@/app/apply/components/utils";
import {useSession} from "@/app/hooks/useSession";
import useScreenSize from "@/app/hooks/useScreenSize";
import moment from "moment";
import {useParticipants} from "@/app/raid/components/useParticipants";
import {GUILD_ID, GUILD_NAME, REGISTRATION_SOURCES} from "@/app/util/constants";
import {Button} from "@/app/components/Button";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {
    faChair,
    faCircleCheck, faCircleQuestion, faCircleXmark, faClock,
    faPersonCircleCheck,
    faPersonCircleXmark,
    faTrash, faTriangleExclamation
} from "@fortawesome/free-solid-svg-icons";
import {RaidParticipant} from "@/app/raid/api/types";
import GearScore from "@/app/components/GearScore";
import BenchParticipant from "@/app/raid/components/BenchParticipant";
import {RAID_STATUS} from "@/app/raid/components/utils";
import {useMessageBox} from "@utils/msgBox";
import {useQuery} from "@tanstack/react-query";


const BadgeCheckIcon = ({className}: { className: string }) => {
    const c = "fadl";

    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 512 512"
            role="img"
            aria-labelledby={c}
            className={className}
            fill="currentColor"
        >
            <g>
                <path
                    d="M32 256c0 28.3 15.9 53 39.4 65.4c6.8 3.6 10.1 11.5 7.8 18.8c-7.8 25.4-1.6 54.1 18.4 74.1s48.7 26.2 74.1 18.4c7.3-2.3 15.2 1 18.8 7.8C203 464.1 227.7 480 256 480s53-15.9 65.4-39.4c3.6-6.8 11.5-10.1 18.8-7.8c25.4 7.8 54.1 1.6 74.1-18.4s26.2-48.7 18.4-74.1c-2.3-7.3 1-15.2 7.8-18.8C464.1 309 480 284.3 480 256s-15.9-53-39.4-65.4c-6.8-3.6-10.1-11.5-7.8-18.8c7.8-25.4 1.6-54.1-18.4-74.1s-48.7-26.2-74.1-18.4c-7.3 2.3-15.2-1-18.8-7.8C309 47.9 284.3 32 256 32s-53 15.9-65.4 39.4c-3.6 6.8-11.5 10.1-18.8 7.8c-25.4-7.8-54.1-1.6-74.1 18.4s-26.2 48.7-18.4 74.1c2.3 7.3-1 15.2-7.8 18.8C47.9 203 32 227.7 32 256zm116.7-11.3c6.2-6.2 16.4-6.2 22.6 0L224 297.4 340.7 180.7c6.2-6.2 16.4-6.2 22.6 0s6.2 16.4 0 22.6l-128 128c-6.2 6.2-16.4 6.2-22.6 0l-64-64c-6.2-6.2-6.2-16.4 0-22.6z"/>
                <path
                    className="text-white"
                    d="M190.6 71.4C203 47.9 227.7 32 256 32s53 15.9 65.4 39.4c3.6 6.8 11.5 10.1 18.8 7.8c25.4-7.8 54.1-1.6 74.1 18.4s26.2 48.7 18.4 74.1c-2.3 7.3 1 15.2 7.8 18.8C464.1 203 480 227.7 480 256s-15.9 53-39.4 65.4c-6.8 3.6-10.1 11.5-7.8 18.8c7.8 25.4 1.6 54.1-18.4 74.1s-48.7 26.2-74.1 18.4c-7.3-2.3-15.2 1-18.8 7.8C309 464.1 284.3 480 256 480s-53-15.9-65.4-39.4c-3.6-6.8-11.5-10.1-18.8-7.8c-25.4 7.8-54.1 1.6-74.1-18.4s-26.2-48.7-18.4-74.1c2.3-7.3-1-15.2-7.8-18.8C47.9 309 32 284.3 32 256s15.9-53 39.4-65.4c6.8-3.6 10.1-11.5 7.8-18.8c-7.8-25.4-1.6-54.1 18.4-74.1s48.7-26.2 74.1-18.4c7.3 2.3 15.2-1 18.8-7.8zM256 0c-36.1 0-68 18.1-87.1 45.6c-33-6-68.3 3.8-93.9 29.4s-35.3 60.9-29.4 93.9C18.1 188 0 219.9 0 256s18.1 68 45.6 87.1c-6 33 3.8 68.3 29.4 93.9s60.9 35.3 93.9 29.4C188 493.9 219.9 512 256 512s68-18.1 87.1-45.6c33 6 68.3-3.8 93.9-29.4s35.3-60.9 29.4-93.9C493.9 324 512 292.1 512 256s-18.1-68-45.6-87.1c6-33-3.8-68.3-29.4-93.9s-60.9-35.3-93.9-29.4C324 18.1 292.1 0 256 0zM363.3 203.3c6.2-6.2 6.2-16.4 0-22.6s-16.4-6.2-22.6 0L224 297.4l-52.7-52.7c-6.2-6.2-16.4-6.2-22.6 0s-6.2 16.4 0 22.6l64 64c6.2 6.2 16.4 6.2 22.6 0l128-128z"/>
            </g>

        </svg>
    );
};


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

export default function RaidParticipants({participants, raidId, raidInProgress, days, minGs, sanctifiedData}: {
    participants: RaidParticipant[],
    raidId: string,
    raidInProgress: boolean
    days: string[],
    minGs: number,
    sanctifiedData?: { characterName: string, count: number, characterId: string }[]
}) {
    const {supabase, selectedCharacter, session} = useSession()
    const {isAdmin} = session ?? {isAdmin: false}
    console.log('session', session)
    const stateParticipants = useParticipants(raidId, participants)
    const {isMobile} = useScreenSize()
    const initialColumns = [
        {name: "NAME", uid: "name"},
        {name: "ROLE", uid: "role"},
        {name: "STATUS", uid: "status"},
    ]
    const [columns, setColumns] = useState(initialColumns)
    useEffect(() => {
        if (isMobile) {
            setColumns(initialColumns)
        } else {
            setColumns([
                ...initialColumns,
                {name: "GEAR SCORE", uid: "gs"},
                (sanctifiedData ? {name: "SANCT", uid: "sanctified"} : {name: "GUILDIE", uid: "is_guildie"}),
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
    const {yesNo} = useMessageBox()
    const {data: guildEvent} = useQuery({
        queryKey: ['guildEvent', raidId],
        queryFn: async () => {
            const {data = [], error = false} = (await supabase?.from('guild_events_participants').select('*')
                .eq('event_id', 1)
                .eq('position', 1))
            ?? {}

            if (error) {
                console.error('Error fetching guild event', error)
                return []
            }

            return data
        },
        enabled: !!raidId && !!supabase,
        staleTime: 1000 * 60 * 5, // 5 minutes
        retry: 3,
    })

    const renderCell = useCallback((registration: { member: RaidParticipant } & any, columnKey: React.Key) => {
        const {name, avatar, playable_class, id} = registration.member?.character
        const {registration_source} = registration.member
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
                                                     className="text-red-600 absolute -right-4" beat/>
                                )}
                            </span>
                        </div>
                    </Tooltip>

                )
            case "gs":
                return (
                    session?.guild?.id === GUILD_ID ? (
                        <GearScore characterName={name} min={minGs}
                                   allowForce={isAdmin || selectedCharacter?.id === registration?.member?.character?.id}/>
                    ) : (
                        <Tooltip
                            content={`Gear score is available only for guild members`}
                            placement="top"
                        >
                            <Chip variant="flat"
                                    color="warning"
                                  className="text-warning"
                                  size="sm"
                                  startContent={
                                      <FontAwesomeIcon icon={faCircleQuestion}/>}
                            >
                                EV-only
                            </Chip>
                        </Tooltip>
                    )
                )
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
                                    className="min-w-4 flex flex-row-reverse"
                                >{registration.position}</span>
                            </Tooltip>
                            <div
                                className="relative overflow-visible"
                            >
                                <img
                                    alt="User avatar"
                                    width={24}
                                    height={24}
                                    className={`min-w-8 min-h-8 max-w-8 max-h-8 rounded-full ${!registration.is_confirmed && 'grayscale'} border border-gold`}
                                    src={avatar}
                                />
                                {registration_source === REGISTRATION_SOURCES.BNET_OAUTH && (
                                    <div className="absolute -bottom-0.5 -right-1 w-3 h-3">
                                        <Tooltip
                                            content="Loged in using Battle.net"
                                            placement="top"
                                        >
                                            <BadgeCheckIcon
                                                className="text-battlenet text-xs"
                                            />
                                        </Tooltip>
                                    </div>
                                )}
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
                                return 'danger'
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
                            ><FontAwesomeIcon icon={statusIcon(registrationDetails.status)}/></span>
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
                    <div className="w-full flex items-center gap-2">
                        <BenchParticipant
                            resetId={raidId}
                            memberId={registration.member.character.id}
                            currentStatus={registrationDetails?.status}
                            supabase={supabase}
                            currentDetails={registrationDetails}
                        />
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
    }, [selectedCharacter, supabase, guildEvent, isAdmin, yesNo, session]);

    return (
        <Table
            classNames={{
                th: 'relative',
                wrapper: "border border-wood-100 scrollbar-pill",
            }}
            className="w-full h-full flex flex-col gap-2 scrollbar-pill overflow-auto"
            isHeaderSticky
            topContent={<div className="flex flex-row items-center gap-2 justify-center">
                <Button
                    className="flex-1"
                    onPress={() => setOnlyConfirmed(true)}
                    isDisabled={onlyConfirmed}
                >
                    {onlyConfirmed ? 'Showing only confirmed' : 'Show only confirmed '}
                    <FontAwesomeIcon icon={faPersonCircleCheck}/>
                </Button>
                <Button
                    className="flex-1"
                    onPress={() => setOnlyConfirmed(false)}
                    isDisabled={!onlyConfirmed}
                >
                    {onlyConfirmed ? 'Show all ' : 'Showing all '}
                    <FontAwesomeIcon icon={faPersonCircleXmark}/>
                </Button>
            </div>}
            topContentPlacement="outside"
        >
            <TableHeader
                className="shadow-gold shadow"
                columns={columns}>
                {(column) => (
                    <TableColumn key={column.uid} align={"start"}>
                        <div className="border-y border-moss-100 absolute h-full w-full top-0 left-0 inline-block"/>
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
