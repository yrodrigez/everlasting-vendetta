'use client'
import React, {useCallback, useEffect, useRef} from "react";
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

const columns = [
    {name: "NAME", uid: "name"},
    {name: "ROLE", uid: "role"},
    {name: "STATUS", uid: "status"},
    {name: "DAYS", uid: "days"},
];
const days = ['Wed', 'Thur', 'Fri', 'Sat', 'Sun', 'Mon', 'Tue'];

export default function RaidParticipants({participants, raidId}: { participants: any[], raidId: string }) {
    const {supabase, selectedCharacter} = useSession()
    const stateParticipants = useParticipants(raidId, participants)
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
                                <span>{registration.position}</span>
                            </Tooltip>
                            <Image
                                alt="User avatar"
                                width={24}
                                height={24}
                                className={`w-8 h-8 rounded-full ${!registration.is_confirmed && 'grayscale'} border border-gold`}
                                src={avatar}
                            />
                            <div className="flex flex-col">
                                <h5 className="text-gold font-bold">{name} {(name === selectedCharacter?.name) ? '(You)' : null}</h5>
                            </div>
                        </div>
                    </Link>
                );
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

                        name === 'Aoriad' ? <Chip color={'warning'} size="sm" variant="flat">Late</Chip> :
                            <Chip className="capitalize" color={color}
                                  size="sm"
                                  variant="flat">
                                {registrationDetails.status}
                            </Chip>

                    );
                }

                return (
                    name === 'Aoriad' ? <Chip color={'warning'} size="sm" variant="flat">Late</Chip> :
                        <Chip className="capitalize" color={registration.is_confirmed ? 'success' : 'danger'} size="sm"
                              variant="flat">
                            {registration.is_confirmed ? 'Confirmed' : 'Declined'}
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
                            const isToday = day === new Date().toString().substring(0, 3);
                            const isDayRegistered = (registrationDetails?.days ?? []).indexOf(day) !== -1;
                            return (
                                <Chip
                                    key={day}
                                    className={isToday ? 'border-2 border-gold' : ''}
                                    color={isDayRegistered ? 'success' : 'danger'}
                                    size="sm"
                                    variant="flat">
                                    {day.substring(0, 2)}
                                </Chip>
                            )
                        })}
                    </div>
                );

            default:
                return <></>;
        }
    }, [selectedCharacter, supabase]);

    return (
        <div className={'flex flex-1 mt-2 max-h-[500px]'}>
            <Table isHeaderSticky>
                <TableHeader columns={columns}>
                    {(column) => (
                        <TableColumn key={column.uid} align={"start"}>
                            {column.name}
                        </TableColumn>
                    )}
                </TableHeader>
                <TableBody
                    className="scrollbar-pill"
                    emptyContent={"No one like us."}
                    items={stateParticipants.sort((a: any, b: any) => {
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
        </div>
    );
}
