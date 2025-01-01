'use client'
import {Button} from "@/app/components/Button";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faCheck, faTrash} from "@fortawesome/free-solid-svg-icons";
import {Chip, Table, TableBody, TableCell, TableColumn, TableHeader, TableRow, Tooltip} from "@nextui-org/react";
import React, {useCallback, useEffect, useState} from "react";
import Link from "next/link";
import {getClassIcon, getRoleIcon} from "@/app/apply/components/utils";
import {useSession} from "@hooks/useSession";
import {useQuery} from "@tanstack/react-query";
import {useRouter} from "next/navigation";

export function Applicants({applicants}: {
    applicants: {
        created_at: string,
        id: string,
        name: string,
        message: string,
        class: string,
        role: string,
        status: string,
        reviewer: any
    }[]
}) {
    const {supabase, selectedCharacter} = useSession()

    const columns = [
        {name: 'Name', uid: 'name'},
        {name: 'Role', uid: 'role'},
        {name: 'Gear Score', uid: 'gearScore'},
        {name: 'Status', uid: 'status'},
        {name: 'Message', uid: 'message'},
        {name: 'Reviewer', uid: 'reviewer'},
        {name: 'Review', uid: 'review'},
    ]

    const {data: withAvatar} = useQuery({
        queryKey: ['applications', 'get'],
        queryFn: async () => {
            return await Promise.all(applicants.map(async (x) => {

                const [avatar, gearScore] = await Promise.all([
                    fetch(`/api/v1/services/member/avatar/get?characterName=${encodeURIComponent(x.name)}`)
                        .then(res => res.json())
                        .then(data => data.avatar)
                        .catch(() => '/avatar-anon.png'),
                    fetch(`/api/v1/services/member/character/${encodeURIComponent(x.name)}/gs`)
                        .then(res => res.json())
                        .then(data => data)
                        .catch(() => 0),
                ])

                return {
                    ...x,
                    avatar,
                    gearScore,
                }
            }))
        },
        initialData: applicants.map((x) => {
            return {
                ...x,
                avatar: '/avatar-anon.png',
                gearScore: {gs: 'calculating...', color: 'default'},
            }
        })
    })
    const router = useRouter()
    useEffect(() => {
        if (!supabase || !selectedCharacter) return;
        const channel = supabase.channel(`applications:${selectedCharacter.id}`)
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'ev_application',
            }, async () => {
                router.refresh()
            }).subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    })

    const review = useCallback(async (id: string, status: string) => {
        if (!supabase || !selectedCharacter) return;
        await supabase.from('ev_application')
            .update({status,
                reviewed_by: selectedCharacter.id})
            .eq('id', id)

        router.refresh()
    },[supabase, selectedCharacter])


    const renderCell = useCallback((registration: any, columnKey: React.Key) => {
        const {name, created_at, message, className, role, status, reviewer, avatar, gearScore, id} = registration;

        switch (columnKey) {
            case "name":
                return (
                    <Link
                        href={`/roster/${encodeURIComponent(name.toLowerCase())}`}
                        target={'_blank'}
                    >
                        <div className="flex flex-row items-center gap-2">
                            <div className="relative overflow-visible">
                                <img
                                    alt="User avatar"
                                    width={24}
                                    height={24}
                                    className={`w-8 h-8 rounded-full border border-gold`}
                                    src={avatar}
                                />

                            </div>
                            <div className="flex items-center">
                                <h5 className="text-gold font-bold mr-2">{name}</h5>
                            </div>
                        </div>
                    </Link>
                )
                    ;
            case "role":

                return (
                    <div className="flex gap-2">
                        <img
                            className="w-6 h-6 rounded-full border border-gold"
                            src={getClassIcon(className)}
                            alt={className}
                        />

                        <img
                            className="w-6 h-6 rounded-full border border-gold"
                            src={getRoleIcon(role)}
                            alt={role}
                        />

                    </div>
                );

            case "status":
                if (status) {
                    const color = ((status: string) => {
                        switch (status) {
                            case 'accepted':
                                return 'success'
                            case 'declined':
                                return 'danger'
                            default:
                                return 'warning'
                        }
                    })(status);
                    return (
                        <Chip className={`capitalize text-${color || 'default'}`} color={color}
                              size="sm"
                              variant="flat">
                            {status}
                        </Chip>
                    );
                }
                return (
                    <Chip color={'warning'} size="sm" variant="flat" className="text-warning">
                        Pending
                    </Chip>
                );

            case "message":
                return (
                    <Tooltip
                        content={message}
                        placement="top"
                    >
                        <div className="truncate w-32">
                            {message}
                        </div>
                    </Tooltip>
                );

            case "reviewer":
                if (reviewer) {
                    return (
                        <div className="flex flex-row items-center gap-2">
                            <div className="relative overflow-visible">
                                <img
                                    alt="User avatar"
                                    width={24}
                                    height={24}
                                    className={`w-8 h-8 rounded-full border border-gold`}
                                    src={reviewer.avatar}
                                />
                            </div>
                            <div className="flex items-center">
                                <h5 className="text-gold font-bold mr-2">{reviewer.name}</h5>
                            </div>
                        </div>
                    )
                }
                return <>None</>;

            case "gearScore":
                return (
                    <div className="flex items-center gap-2">
                        <span className={`text-${gearScore.color}`}>{gearScore.gs}</span>
                    </div>
                );

            case "review":
                if(!supabase || !selectedCharacter) return <>Loading...</>
                return (
                    <div className="flex flex-row items-center gap-2">
                        <Button
                            isIconOnly={true}
                            className="text-white"
                            isDisabled={!!reviewer}
                            color={'success'}
                            size={'sm'}
                            onClick={() => {
                                review(id, 'accepted')
                            }}
                        >
                            <FontAwesomeIcon icon={faCheck}/>
                        </Button>
                        <Button
                            isIconOnly={true}
                            className="text-white"
                            color={'danger'}
                            size={'sm'}
                            isDisabled={!!reviewer}
                            onClick={() => {
                                review(id, 'declined')
                            }}
                        >
                            <FontAwesomeIcon icon={faTrash}/>
                        </Button>
                    </div>
                );

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
            className="w-full h-full flex flex-col gap-2 scrollbar-pill overflow-auto"
            isHeaderSticky
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
                items={withAvatar
                    ?.sort((a: any, b: any) => {
                        const aCreated = new Date(a.created_at)
                        const bCreated = new Date(b.created_at)
                        return bCreated.getTime() - aCreated.getTime()
                    }).map((x: any, index) => {
                        return {
                            ...x,
                            position: index + 1
                        }
                    })}>
                {(item: any) => {
                    return (
                        <TableRow
                            key={item.id}>
                            {(columnKey) => <TableCell>{renderCell(item, columnKey)}</TableCell>}
                        </TableRow>
                    )
                }}
            </TableBody>
        </Table>
    )
}
