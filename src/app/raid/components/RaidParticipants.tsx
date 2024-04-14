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

const columns = [
    {name: "NAME", uid: "name"},
    {name: "ROLE", uid: "role"},
    {name: "STATUS", uid: "status"},
    {name: "DAYS", uid: "days"},
];


export default function RaidParticipants({participants, raidId}: { participants: any[], raidId: string }) {
    const {supabase, selectedCharacter} = useSession()
    const [stateParticipants, setStateParticipants] = React.useState(participants)

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
                if (registrationDetails) {
                    return (
                        <div className="flex gap">
                            {registrationDetails.days.sort((a: string, b: string) => {
                                //sorts the dates starting on Wednesday
                                const days = ['Wed', 'Thur', 'Fri', 'Sat', 'Sun', 'Mon', 'Tues'];
                                return days.indexOf(a) - days.indexOf(b);
                            }).map((day: string) => (
                                <Chip key={day} color={'success'} size="sm" variant="flat">{day.substring(0, 2)}</Chip>
                            ))}
                        </div>
                    );
                }
                return <></>;

            default:
                return <></>;
        }
    }, [selectedCharacter, supabase]);

    useEffect(() => {
        if (!supabase) return
        const raidParticipantChannel = supabase.channel(`raid_participants${raidId}`)
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'ev_raid_participant',
                filter: `raid_id=eq.${raidId}`
            }, async ({}) => {
                const {error, data} = await supabase
                    .from('ev_raid_participant')
                    .select('member:ev_member(character), is_confirmed, details, raid_id')
                    .eq('raid_id', raidId)
                if (error) {
                    console.error(error)
                }
                setStateParticipants(data)
            }).subscribe()
        return () => {
            supabase.removeChannel(raidParticipantChannel)
        }
    }, [raidId, supabase]);

    const ref = useRef<HTMLDivElement>()
    const {screenHeight} = useScreenSize()

    useEffect(() => {
        if (ref.current) {
            ref.current.style.height = `${screenHeight - 300}px`
        }
    }, [screenHeight]);


    return (
        <div
            className={`w-full`}
            // @ts-ignore
            ref={ref}
        >
            <Table
                className={'w-full h-full scrollbar-pill'}
                radius={'sm'}
                isHeaderSticky

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
                    emptyContent={"No one like us."}
                    items={stateParticipants.reduce((acc, curr) => {
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
