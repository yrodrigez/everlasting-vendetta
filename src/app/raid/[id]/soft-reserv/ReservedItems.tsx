'use client'
import SimpleListContainer from "@/app/raid/[id]/soft-reserv/SimpleListContainer";
import {useReservations} from "@/app/raid/[id]/soft-reserv/useReservations";
import {ReservedItem} from "@/app/raid/[id]/soft-reserv/ReservedItem";
import {useSession} from "@/app/hooks/useSession";
import Image from "next/image";
import {Character, RaidItem, type Reservation} from "@/app/raid/[id]/soft-reserv/types";
import {Button, Tooltip} from "@nextui-org/react";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faArrowRight, faObjectGroup, faUserGroup} from "@fortawesome/free-solid-svg-icons";
import {useEffect, useState} from "react";
import Link from "next/link";

export default function ReservedItems({resetId, initialItems = []}: { resetId: string, initialItems: Reservation[] }) {
    const [vista, setVista] = useState('user')
    const [reservationsByUser, setReservationsByUser] = useState<{
        character: Character,
        reservations: RaidItem[]
    }[]>([])
    const [reservationsByItem, setReservationsByItem] = useState<{ item: RaidItem, reservations: Character[] }[]>([])

    const {items: reservations, remove, loading} = useReservations(resetId, initialItems)
    const {tokenUser: selectedCharacter} = useSession()
    const [yourReservations, setYourReservations] = useState<Reservation[]>(reservations?.filter((item) => item.member?.id === selectedCharacter?.id))

    const groupByUser = (reservations: Reservation[]) => {
        // @ts-ignore
        return reservations.reduce((acc, reservation) => {
            if (!reservation.member) return acc
            const found = acc.find((i) => i.character.id === reservation.member.id)
            if (found) {
                found.reservations.push(reservation.item)
            } else {
                acc.push({
                    character: reservation.member.character,
                    reservations: [reservation.item]
                })
            }
            return acc
        }, [] as { character: Character, reservations: RaidItem[] }[])
    }

    const groupByItem = (reservations: Reservation[]) => {
        // @ts-ignore
        return reservations.reduce((acc, reservation) => {
            if (!reservation.item) return acc
            const found = acc.find((i) => i.item.id === reservation.item.id)
            if (found) {
                found.reservations.push(reservation.member.character)
            } else {
                acc.push({
                    item: reservation.item,
                    reservations: [reservation.member.character]
                })
            }
            return acc
        }, [] as { item: RaidItem, reservations: Character[] }[])
    }

    useEffect(() => {
        setReservationsByUser(groupByUser(reservations))
        setReservationsByItem(groupByItem(reservations))
        setYourReservations(reservations?.filter((item) => item.member?.id === selectedCharacter?.id))
    }, [vista, reservations]);

    if (!selectedCharacter) return null
    return (
        <div className="h-full w-full">
            <div
                className={"flex items-center justify-between mt-2 text-default"}
            >
                <h2 className="text-2xl font-bold ">Reserved Items</h2>
                <div>
                    <Button
                        isIconOnly
                        isDisabled={vista === 'user'}
                        className={'text-default'}
                        variant={'light'}
                        onClick={() => setVista('user')}
                    >
                        <FontAwesomeIcon icon={faUserGroup}/>
                    </Button>
                    <Button
                        isIconOnly
                        isDisabled={vista === 'item'}
                        className={'text-default'}
                        variant={'light'}
                        onClick={() => setVista('item')}
                    >
                        <FontAwesomeIcon icon={faObjectGroup}/>
                    </Button>
                </div>
            </div>
            <SimpleListContainer minus={600}>
                {
                    vista === 'user' ? reservationsByUser.map((item) => (
                        <div key={item.character.id}
                             className="flex gap-2 p-2 border-gold border rounded-md justify-between">
                            <div className={`flex items-center justify-between p-2 rounded-md`}>
                                {item?.character?.avatar && (
                                    <Link
                                        target={'_blank'}
                                        className={'flex flex-col items-center gap w-14 h-full justify-center'}
                                        href={`/roster/${encodeURIComponent(item?.character?.name.toLowerCase())}`}>
                                        <Image src={item.character.avatar} alt={item?.character?.name} width={36}
                                               height={36}
                                               className={`border-gold border rounded-md`}
                                        />
                                        <span className="text-sm font-bold">{item.character.name}</span>
                                    </Link>
                                )}
                            </div>
                            <div className="flex flex-col gap-2 items-center justify-center h-full">
                                <FontAwesomeIcon icon={faArrowRight}/>
                            </div>
                            <div className="flex gap-2 items-center min-w-[88px]">
                                {item.reservations.map((item) => (
                                    <Tooltip
                                        key={item.id}
                                        className={`bg-black border border-${['poor', 'common', 'uncommon', 'rare', 'epic', 'legendary'][item?.description?.quality ?? 0] || 'common'} rounded max-w-64`}
                                        content={<div
                                            dangerouslySetInnerHTML={{__html: item?.description?.tooltip ?? ''}}/>}
                                    >
                                        <Image src={item.description.icon} alt={item.name} width={36} height={36}
                                               className={`border-${['poor', 'common', 'uncommon', 'rare', 'epic', 'legendary'][item?.description?.quality ?? 0] || 'common'} border rounded-md min-w-10 max-w-10 min-h-10 max-h-10`}/>
                                    </Tooltip>
                                ))}
                            </div>
                        </div>
                    )) : vista === 'item' ? reservationsByItem.map((item) => (
                        <div key={item.item.id}
                             className="flex gap-2 p-2 border-gold border rounded-md justify-between">
                            <div className={`flex items-center justify-between p-2 rounded-md`}>
                                <Tooltip
                                    className={`bg-black border border-${['poor', 'common', 'uncommon', 'rare', 'epic', 'legendary'][item.item?.description?.quality ?? 0] || 'common'} rounded max-w-64`}
                                    content={<div
                                        dangerouslySetInnerHTML={{__html: item?.item?.description?.tooltip ?? ''}}/>
                                    }
                                >
                                    <div>
                                        <Image src={item.item.description.icon} alt={item.item.name} width={36}
                                               height={36}
                                               className={`border-${['poor', 'common', 'uncommon', 'rare', 'epic', 'legendary'][item.item?.description?.quality ?? 0] || 'common'} border rounded-md min-w-10 max-w-10 min-h-10 max-h-10`}/>
                                        <span className="text-sm font-bold">{item.item.name}</span>
                                    </div>
                                </Tooltip>
                            </div>
                            <div className="flex flex-col gap-2 items-center justify-center h-full">
                                <FontAwesomeIcon icon={faArrowRight}/>
                            </div>
                            <div className="flex gap-2 items-center min-w-[88px]">
                                {item.reservations.map((item) => (
                                    <Link
                                        key={item.id}
                                        target={'_blank'}
                                        href={`/roster/${encodeURIComponent(item.name.toLowerCase())}`}
                                        className={'flex flex-col items-center gap w-14 h-full justify-center'}
                                    >
                                        <Image src={item.avatar ?? '/avatar-anon.png'} alt={item.name} width={36} height={36}
                                               className={`border-gold border rounded-md`}
                                        />
                                        <span className="text-sm font-bold">{item.name}</span>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )) : null
                }
            </SimpleListContainer>
        </div>
    )
}
