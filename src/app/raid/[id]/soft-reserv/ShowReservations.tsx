import {Character, RaidItem, Reservation} from "@/app/raid/[id]/soft-reserv/types";
import {
    Button,
    Modal,
    ModalBody,
    ModalContent,
    ModalHeader,
    ScrollShadow,
    Tooltip,
    useDisclosure
} from "@nextui-org/react";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faArrowRightLong, faClose, faObjectGroup, faTrash, faUserGroup} from "@fortawesome/free-solid-svg-icons";
import {useEffect, useState} from "react";
import Image from "next/image";
import {ItemTooltip} from "@/app/raid/[id]/soft-reserv/RaidItemCard";
import Link from "next/link";

const groupByCharacter = (items: Reservation[]): {
    character: Character,
    reservations: (RaidItem & { reservationId: string })[]
}[] => {
    return items.reduce((acc, item) => {
        const found = acc.find((i) => i.character.id === item.member.character.id)
        if (found) {
            found.reservations.push({
                ...item.item,
                reservationId: item.id
            })
        } else {
            acc.push({
                character: item.member.character,
                reservations: [{...item.item, reservationId: item.id}]
            })
        }
        return acc
    }, [] as { character: Character, reservations: (RaidItem & { reservationId: string })[] }[])
}

const groupByItem = (items: Reservation[]): { item: RaidItem, reservations: Character[] }[] => {
    return items.reduce((acc, item) => {
        const found = acc.find((i) => i.item.id === item.item.id)
        if (found) {
            found.reservations.push(item.member.character)
        } else {
            acc.push({
                item: item.item,
                reservations: [item.member.character]
            })
        }
        return acc
    }, [] as { item: RaidItem, reservations: Character[] }[])
}

const ReservationByItem = ({item}: { item: { item: RaidItem, reservations: Character[] } }) => {
    return (
        <div className={'flex gap-2 justify-between p-2 items-center'}>
            <Tooltip
                className={'bg-transparent border-none shadow-none'}

                // @ts-ignore - nextui types are wrong
                shadow={'none'}
                placement={'right'}
                offset={20}
                content={
                    <div className="flex gap">
                        <ItemTooltip item={item.item}
                                     qualityColor={[
                                         'poor',
                                         'common',
                                         'uncommon',
                                         'rare',
                                         'epic',
                                         'legendary',
                                     ][item.item.description.quality ?? 0] as 'poor' | 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'}
                        />
                    </div>
                }
            >
                <Image
                    src={item.item.description.icon}
                    alt={item.item.name}
                    width={40}
                    height={40}
                    className={`border-gold border rounded-md`}
                />
            </Tooltip>
            <FontAwesomeIcon icon={faArrowRightLong}/>
            <div className="flex gap-2 overflow-auto max-w-40 w-40 scrollbar-pill">
                {item.reservations.map((character, i) => {
                    return (
                        <Tooltip
                            key={i}
                            content={character.name}
                            placement={'top'}
                        >
                            <Link
                                href={`/roster/${encodeURIComponent(character.name.toLowerCase())}`}
                                target={'_blank'}
                            >
                                <Image
                                    src={character.avatar ?? '/avatar-anon.png'}
                                    alt={character.name}
                                    width={40}
                                    height={40}
                                    className={`border-gold border rounded-md`}
                                />
                            </Link>
                        </Tooltip>
                    )
                })}
            </div>
        </div>
    )
}

const ReservationByCharacter = ({item, isAdmin}: {
    item: { character: Character, reservations: (RaidItem & { reservationId: string })[] },
    isAdmin?: boolean
}) => {
    const {character, reservations} = item

    return (
        <div className={'flex gap-2 justify-between p-2 items-center'}>
            <div className="flex items-center">
                {isAdmin ? <Button
                    size={'sm'}
                    className={'text-default'}
                    isIconOnly
                    variant={'light'}
                    onPress={() => {
                        (async () => {
                            const confirm = window.confirm(`Are you sure you want to remove all reservations for ${item.character.name}?`)
                            if (!confirm) return
                            const origin = window.location.origin
                            const resetId = window.location.pathname.split('/')[2] // raid id
                            const response = await fetch(`${origin}/api/v1/services/reserve?resetId=${resetId}&memberId=${item.character.id}`, {
                                method: 'DELETE'
                            })
                            if (!response.ok) {
                                alert('Failed to remove reservations')
                                return
                            }
                            const data = await response.json()
                            if (data.error) {
                                alert(data.error)
                            } else {
                                alert('Reservations removed')
                            }
                        })()

                    }}
                >
                    <FontAwesomeIcon icon={faClose}/>
                </Button> : null}
                <Link
                    className={'flex gap-2 items-center'}
                    href={`/roster/${encodeURIComponent(item.character.name.toLowerCase())}`} target={'_blank'}>
                    <Image
                        src={item.character.avatar ?? '/avatar-anon.png'}
                        alt={item.character.name}
                        width={40}
                        height={40}
                        className={`border-gold border rounded-md`}
                    />
                    <span>{item.character.name}</span>
                </Link>
            </div>
            <div className="flex gap-2">
                {reservations.map((item, i) => {
                    return (
                        <Tooltip
                            className={'bg-transparent border-none shadow-none'}
                            key={i}
                            // @ts-ignore - nextui types are wrong
                            shadow={'none'}
                            placement={'right'}
                            offset={20}
                            content={
                                <div className="flex gap">
                                    <ItemTooltip item={item}
                                                 qualityColor={[
                                                     'poor',
                                                     'common',
                                                     'uncommon',
                                                     'rare',
                                                     'epic',
                                                     'legendary',
                                                 ][item.description.quality ?? 0] as 'poor' | 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'}
                                    />
                                </div>
                            }
                        >
                            <div className={"relative group flex"}>
                                <Image
                                    src={item.description.icon}
                                    alt={item.name}
                                    width={40}
                                    height={40}
                                    className={`border-gold border rounded-md ${isAdmin ? 'cursor-pointer' : ''}`}
                                    onClick={async () => {
                                        if (!isAdmin) return
                                        if(!item.reservationId) return console.error('No reservation id', item)
                                        const confirm = window.confirm(`Are you sure you want to remove ${item.name} from ${character.name}?`)
                                        if (!confirm) return

                                        const response = await fetch(`/api/v1/services/reserve?reservationId=${item.reservationId}`, {
                                            method: 'DELETE'
                                        })
                                        if (!response.ok) {
                                            alert('Failed to remove reservation')
                                            return
                                        }
                                        const data = await response.json()
                                        if (data.error) {
                                            alert(data.error)
                                        } else {
                                            alert('Reservation removed')
                                        }
                                    }}
                                />
                            </div>
                        </Tooltip>
                    )
                })}
            </div>
        </div>
    )
}

export function ShowReservations({items = [], isAdmin}: { items: Reservation[], isAdmin?: boolean }) {
    const {isOpen, onOpen, onClose, onOpenChange} = useDisclosure()
    const [reservationsByCharacter, setReservationsByCharacter] = useState<{
        character: Character,
        reservations: (RaidItem & { reservationId: string })[]
    }[]>(groupByCharacter(items))

    const [reservationsByItem, setReservationsByItem] = useState<{
        item: RaidItem,
        reservations: Character[]
    }[]>(groupByItem(items))

    const [isByCharacter, setIsByCharacter] = useState(true)

    useEffect(() => {
        setReservationsByCharacter(groupByCharacter(items))
        setReservationsByItem(groupByItem(items))
    }, [items])

    return (
        <>
            <div className="relative">
                <Tooltip
                    content={'Show reservations'}
                    placement={'right'}
                    showArrow
                >
                    <Button
                        size={'lg'}
                        className={'bg-moss text-gold shadow-none rounded'}
                        onPress={onOpen}
                        isIconOnly
                        isDisabled={items.length === 0}
                    >
                        <FontAwesomeIcon icon={faUserGroup}/>
                    </Button>
                </Tooltip>
                {items?.length ? (
                    <span
                        className="absolute -top-2 -right-4 bg-dark text-gold text-xs px-2 py-1 rounded-full border border-gold z-50">
                        {items.length}
                    </span>
                ) : null}
            </div>
            <Modal
                isOpen={isOpen}
                onClose={onClose}
                onOpenChange={onOpenChange}
                placement="center"
            ><ModalContent>
                {() => (
                    <>
                        <ModalHeader>
                            <div className="flex justify-between items-center w-full text-default">
                                Reservations
                                <div className="flex gap-2 mr-4">
                                    <Button
                                        size={'sm'}
                                        className="text-default"
                                        variant={'light'}
                                        isIconOnly
                                        onPress={() => setIsByCharacter(true)}
                                    >
                                        <FontAwesomeIcon icon={faUserGroup}/>
                                    </Button>
                                    <Button
                                        size={'sm'}
                                        className="text-default"
                                        variant={'light'}
                                        isIconOnly
                                        onPress={() => setIsByCharacter(false)}
                                    >
                                        <FontAwesomeIcon icon={faObjectGroup}/>
                                    </Button>
                                </div>
                            </div>
                        </ModalHeader>
                        <ModalBody>
                            <ScrollShadow className="overflow-auto max-h-[600px] w-full scrollbar-pill">
                                {isByCharacter ? reservationsByCharacter.map((item, i) => {
                                    return <ReservationByCharacter key={i} item={item} isAdmin={isAdmin}/>
                                }) : reservationsByItem.map((item, i) => {
                                    return (
                                        <ReservationByItem item={item} key={i}/>
                                    )
                                })}
                            </ScrollShadow>
                        </ModalBody>
                    </>
                )}
            </ModalContent>
            </Modal>

        </>
    )
}
