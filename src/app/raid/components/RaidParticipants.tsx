'use client'
import {useCallback, useEffect, useState} from "react";
import {Chip, Table, TableBody, TableCell, TableColumn, TableHeader, TableRow, Tooltip} from "@nextui-org/react";
import Link from "next/link";
import {getClassIcon, getRoleIcon} from "@/app/apply/components/utils";
import {useSession} from "@/app/hooks/useSession";
import Image from "next/image";
import useScreenSize from "@/app/hooks/useScreenSize";
import moment from "moment";
import {useParticipants} from "@/app/raid/components/useParticipants";
import {GUILD_NAME, REGISTRATION_SOURCES} from "@/app/util/constants";
import {Button} from "@/app/components/Button";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faPersonCircleCheck, faPersonCircleXmark, faTrash} from "@fortawesome/free-solid-svg-icons";
import {RaidParticipant} from "@/app/raid/api/types";


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
                <path d="M32 256c0 28.3 15.9 53 39.4 65.4c6.8 3.6 10.1 11.5 7.8 18.8c-7.8 25.4-1.6 54.1 18.4 74.1s48.7 26.2 74.1 18.4c7.3-2.3 15.2 1 18.8 7.8C203 464.1 227.7 480 256 480s53-15.9 65.4-39.4c3.6-6.8 11.5-10.1 18.8-7.8c25.4 7.8 54.1 1.6 74.1-18.4s26.2-48.7 18.4-74.1c-2.3-7.3 1-15.2 7.8-18.8C464.1 309 480 284.3 480 256s-15.9-53-39.4-65.4c-6.8-3.6-10.1-11.5-7.8-18.8c7.8-25.4 1.6-54.1-18.4-74.1s-48.7-26.2-74.1-18.4c-7.3 2.3-15.2-1-18.8-7.8C309 47.9 284.3 32 256 32s-53 15.9-65.4 39.4c-3.6 6.8-11.5 10.1-18.8 7.8c-25.4-7.8-54.1-1.6-74.1 18.4s-26.2 48.7-18.4 74.1c2.3 7.3-1 15.2-7.8 18.8C47.9 203 32 227.7 32 256zm116.7-11.3c6.2-6.2 16.4-6.2 22.6 0L224 297.4 340.7 180.7c6.2-6.2 16.4-6.2 22.6 0s6.2 16.4 0 22.6l-128 128c-6.2 6.2-16.4 6.2-22.6 0l-64-64c-6.2-6.2-6.2-16.4 0-22.6z" />
                <path
                    className="text-white"
                    d="M190.6 71.4C203 47.9 227.7 32 256 32s53 15.9 65.4 39.4c3.6 6.8 11.5 10.1 18.8 7.8c25.4-7.8 54.1-1.6 74.1 18.4s26.2 48.7 18.4 74.1c-2.3 7.3 1 15.2 7.8 18.8C464.1 203 480 227.7 480 256s-15.9 53-39.4 65.4c-6.8 3.6-10.1 11.5-7.8 18.8c7.8 25.4 1.6 54.1-18.4 74.1s-48.7 26.2-74.1 18.4c-7.3-2.3-15.2 1-18.8 7.8C309 464.1 284.3 480 256 480s-53-15.9-65.4-39.4c-3.6-6.8-11.5-10.1-18.8-7.8c-25.4 7.8-54.1 1.6-74.1-18.4s-26.2-48.7-18.4-74.1c2.3-7.3-1-15.2-7.8-18.8C47.9 309 32 284.3 32 256s15.9-53 39.4-65.4c6.8-3.6 10.1-11.5 7.8-18.8c-7.8-25.4-1.6-54.1 18.4-74.1s48.7-26.2 74.1-18.4c7.3 2.3 15.2-1 18.8-7.8zM256 0c-36.1 0-68 18.1-87.1 45.6c-33-6-68.3 3.8-93.9 29.4s-35.3 60.9-29.4 93.9C18.1 188 0 219.9 0 256s18.1 68 45.6 87.1c-6 33 3.8 68.3 29.4 93.9s60.9 35.3 93.9 29.4C188 493.9 219.9 512 256 512s68-18.1 87.1-45.6c33 6 68.3-3.8 93.9-29.4s35.3-60.9 29.4-93.9C493.9 324 512 292.1 512 256s-18.1-68-45.6-87.1c6-33-3.8-68.3-29.4-93.9s-60.9-35.3-93.9-29.4C324 18.1 292.1 0 256 0zM363.3 203.3c6.2-6.2 6.2-16.4 0-22.6s-16.4-6.2-22.6 0L224 297.4l-52.7-52.7c-6.2-6.2-16.4-6.2-22.6 0s-6.2 16.4 0 22.6l64 64c6.2 6.2 16.4 6.2 22.6 0l128-128z" />
            </g>

        </svg>
    );
};


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
    participants: RaidParticipant[],
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
    const [columns, setColumns] = useState(initialColumns)
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

    const renderCell = useCallback((registration: { member: RaidParticipant } & any, columnKey: React.Key) => {
        const {name, avatar, playable_class} = registration.member?.character
        const {registration_source} = registration.member
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
                            <div
                                className="relative overflow-visible"
                            >
                                <img
                                    alt="User avatar"
                                    width={24}
                                    height={24}
                                    className={`w-8 h-8 rounded-full ${!registration.is_confirmed && 'grayscale'} border border-gold`}
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
                        <div className="flex gap-1">
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
                    <div className="w-full flex items-center gap-2">
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
            classNames={{
                th: 'relative',
                wrapper: "border border-wood-100 scrollbar-pill",

            }}
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
