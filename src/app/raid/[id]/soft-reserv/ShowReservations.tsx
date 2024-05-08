import {Character, RaidItem, Reservation} from "@/app/raid/[id]/soft-reserv/types";
import {Button, Modal, ModalBody, ModalContent, ModalHeader, Tooltip, useDisclosure} from "@nextui-org/react";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faUserGroup} from "@fortawesome/free-solid-svg-icons";
import {useEffect, useState} from "react";
import Image from "next/image";
import {ItemTooltip} from "@/app/raid/[id]/soft-reserv/RaidItemCard";

const groupByCharacter = (items: Reservation[]): { character: Character, reservations: RaidItem[] }[] => {
    return items.reduce((acc, item) => {
        const found = acc.find((i) => i.character.id === item.member.character.id)
        if (found) {
            found.reservations.push(item.item)
        } else {
            acc.push({
                character: item.member.character,
                reservations: [item.item]
            })
        }
        return acc
    }, [] as { character: Character, reservations: RaidItem[] }[])
}

export function ShowReservations({items = []}: { items: Reservation[] }) {
    const {isOpen, onOpen, onClose, onOpenChange} = useDisclosure()
    const [reservations, setReservations] = useState<{
        character: Character,
        reservations: RaidItem[]
    }[]>(groupByCharacter(items))

    useEffect(() => {
        setReservations(groupByCharacter(items))
    }, [items])

    return (
        <>
            <Button
                size={'lg'}
                className={'bg-moss text-gold shadow-none rounded'}
                onClick={onOpen}
                isIconOnly
                isDisabled={items.length === 0}
            >
                <FontAwesomeIcon icon={faUserGroup}/>
            </Button>
            <Modal
                isOpen={isOpen}
                onClose={onClose}
                onOpenChange={onOpenChange}
                placement="center"
            ><ModalContent>
                {() => (
                    <>
                        <ModalHeader>
                            Reservations ({reservations.length})
                        </ModalHeader>
                        <ModalBody>
                            <div className="overflow-auto max-h-[600px] w-full scrollbar-pill">
                                {reservations.map((item, i) => {
                                    return <div key={i} className={'flex gap-2 justify-between p-2 items-center'}>
                                        <span>{item.character.name}</span>
                                        <div className="flex gap-2">
                                            {item.reservations.map((item, i) => {
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
                                                        <Image
                                                            src={item.description.icon}
                                                            alt={item.name}
                                                            width={40}
                                                            height={40}
                                                            className={`border-gold border rounded-md`}
                                                        />
                                                    </Tooltip>
                                                )
                                            })}
                                        </div>
                                    </div>

                                })}
                            </div>
                        </ModalBody>
                    </>
                )}
            </ModalContent>
            </Modal>

        </>
    )
}
