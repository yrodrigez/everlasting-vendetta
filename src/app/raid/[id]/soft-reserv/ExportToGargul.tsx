import {Button, Modal, ModalBody, ModalContent, ModalHeader, Tooltip, useDisclosure} from "@nextui-org/react";
import {faFileExport} from "@fortawesome/free-solid-svg-icons";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import type {Character, RaidItem} from "@/app/raid/[id]/soft-reserv/types";
import pako from "pako";
import {toast} from "sonner";

function groupByCharacter(items: { item: RaidItem, reservations: Character[] }[]): {
    character: Character,
    reservations: RaidItem[]
}[] {

    return items.reduce((acc, item) => {
        item.reservations.forEach((character) => {
            const found = acc.find((i) => i.character.id === character.id)
            if (found) {
                found.reservations.push(item.item)
            } else {
                acc.push({
                    character,
                    reservations: [item.item]
                })
            }
        })
        return acc
    }, [] as { character: Character, reservations: RaidItem[] }[])
}

function generateID(length: number) {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}


export function ExportToGargul({isReservationsOpen, reservationsByItem}: {
    isReservationsOpen: boolean,
    reservationsByItem: { item: RaidItem, reservations: Character[] }[]
}) {
    const {isOpen, onOpen, onOpenChange} = useDisclosure();
    const createStructure = () => {
        const groupedByCharacter = groupByCharacter(reservationsByItem)
        return {
            hardreserves: [],
            softreserves: groupedByCharacter.map((group) => {

                return {
                    name: group.character.name,
                    items: group.reservations.map((item, i) => {
                        return {
                            id: item.id,
                            note: '',
                            order: i,
                        }
                    }),
                    ['class']: group.character?.playable_class?.name?.toLowerCase(),
                    plusOnes: 0,
                    rollBonus: 0,
                    note: '',
                }
            }),
            metadata: {
                createdAt: new Date().getTime(),
                updatedAt: new Date().getTime(),
                raidStartsAt: new Date().getTime() + 1000 * 60 * 60,
                discordUrl: '',
                lockedAt: null,
                note: "",
                hidden: !isReservationsOpen,
                instance: 'sunkentemplesod',
                id: generateID(6),
            }
        }
    }
    const json = JSON.stringify(createStructure())
    const compressedData = pako.deflate(json)
    // @ts-ignore - Uint8Array is supported
    const base64 = btoa(String.fromCharCode.apply(null, compressedData))


    return (
        <>
            <Tooltip
                content={'Export to Gargul'}
                placement={'right'}
            >
                <div>
                    <Button
                        size={'lg'}
                        variant={'light'}
                        isDisabled={isReservationsOpen}
                        isIconOnly
                        className={'bg-moss text-gold rounded'}
                        onClick={onOpen}
                        onPress={onOpen}
                    >
                        <FontAwesomeIcon icon={faFileExport}/>
                    </Button>
                </div>
            </Tooltip>
            <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
                <ModalContent>
                    {() => (
                        <>
                            <ModalHeader className="flex flex-col gap-1">
                                <h1 className="text-gold text-2xl font-bold">Export to Gargul</h1>
                            </ModalHeader>
                            <ModalBody>
                                <div className="flex flex-col gap-2">
                                    <div className="flex flex-col gap-2">
                                        <h3 className="text-lg font-bold">Copy this to Gargul:</h3>
                                        <textarea
                                            onClick={(e) => {
                                                // copy to clipboard
                                                const textarea = e.target as HTMLTextAreaElement
                                                const text = textarea.value
                                                navigator.clipboard.writeText(text).then(() => {
                                                    toast.success('Copied to clipboard')
                                                })
                                            }}
                                            className="w-full h-52 p-2 rounded-md bg-wood text-default overflow-hidden"
                                            value={base64}
                                            readOnly
                                        />
                                    </div>
                                </div>
                            </ModalBody>
                        </>
                    )}
                </ModalContent>
            </Modal>
        </>
    )
}
