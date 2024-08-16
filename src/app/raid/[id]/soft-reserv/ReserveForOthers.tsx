import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faCartPlus, faSpinner, faUserTie} from "@fortawesome/free-solid-svg-icons";
import {Button} from "@/app/components/Button";
import {
    Input,
    Modal,
    ModalBody,
    ModalContent,
    ModalFooter,
    ModalHeader,
    useDisclosure
} from "@nextui-org/react";
import {useCallback, useEffect, useMemo, useRef, useState} from "react";
import {useReservations} from "@/app/raid/[id]/soft-reserv/useReservations";
import {toast} from "sonner";
import {Character} from "@/app/util/blizzard/battleNetWoWAccount/types";
import {useSession} from "@/app/hooks/useSession";
import {useQuery} from '@tanstack/react-query'
import Link from "next/link";
import {insertCharacterIfNotExists} from "@/app/lib/database/ev_member/insertCharacterIfNotExists";
import {fetchItems} from "@/app/lib/database/raid_loot_item/fetchItems";
import {getRaidIdByResetId} from "@/app/lib/database/raid_resets/getRaidIdByResetId";
import {Item} from "@/app/components/item/Item";

async function fetchCharacterByName(characterName: string) {
    const url = `/api/v1/services/wow/getCharacterByName?name=${characterName}`
    const response = await fetch(url)

    if (!response.ok) {
        throw new Error('Error fetching character details')
    }

    return response.json()
}


export function ReserveForOthers({resetId}: { resetId: string }) {
    const {isOpen, onOpen, onClose, onOpenChange} = useDisclosure()
    const {
        isReservationsOpen,
        reserve,
    } = useReservations(resetId)

    const [characterName, setCharacterName] = useState('')
    const lowerCaseCharacterName = useMemo(() => characterName?.toLowerCase(), [characterName])
    const [itemId, setItemId] = useState<number | undefined>()
    const [isWriting, setIsWriting] = useState(false)
    const {supabase} = useSession()
    const timoutRef = useRef<NodeJS.Timeout>(null)
    const [selectedItem, setSelectedItem] = useState<any>(null)
    const [itemName, setItemName] = useState('' as string)
    const {data: items = [], error, isLoading} = useQuery({
        queryKey: ['raid_loot_item', resetId],
        queryFn: async () => {
            if (!supabase) return []
            const raidId = await getRaidIdByResetId(supabase, resetId)
            if (!raidId) throw new Error('Raid not found')
            return fetchItems(supabase, raidId)
        },
        enabled: !!supabase,
    })

    const createReserve = useCallback((character: Character & { avatar: string }, itemId: number) => {
        if (!character.id) {
            toast.error('Character not found')
            return
        }
        if (!supabase) {
            toast.error('Error connecting to the database')
            return
        }

        (async () => {
            const toUpsertCharacter = {
                id: character.id,
                name: character.name,
                level: character.level,
                character_class: {
                    name: character.character_class?.name ?? 'Unknown'
                },
                playable_class: {
                    name: character.character_class?.name ?? 'Unknown'
                },
                guild: {
                    name: character.guild?.name,
                    id: character.guild?.id,
                },
                realm: {
                    name: character.realm.name,
                    id: character.realm.id,
                },
                avatar: character.avatar,
            }

            try {
                const characterId = await insertCharacterIfNotExists(supabase, toUpsertCharacter, 'manual_reservation')
                await reserve(itemId, characterId)
            } catch (e: any) {
                toast.error(e.message ?? 'Error reserving item')
            }
        })()
    }, [lowerCaseCharacterName, supabase])

    const {data: character, refetch: reFetchUser} = useQuery({
        queryKey: ['character', lowerCaseCharacterName],
        queryFn: () => fetchCharacterByName(lowerCaseCharacterName),
        enabled: !!lowerCaseCharacterName,
    }) as { data: Character & { avatar: string } | undefined, error: any, isLoading: boolean, refetch: () => void }

    useEffect(() => {
        if (error) {
            toast.error(error.message)
        }
    }, [error, isLoading])

    useEffect(() => {
        if (isWriting) {
            return
        }
        if (!lowerCaseCharacterName) {
            return
        }
        reFetchUser()
    }, [lowerCaseCharacterName, isWriting])


    return (
        <>
            <Button
                isIconOnly
                disabled={isLoading}
                onClick={onOpen}
                isLoading={isLoading}
                size={'lg'}
            >
                <FontAwesomeIcon icon={faUserTie}/>
            </Button>
            <Modal
                isOpen={isOpen}
                onClose={onClose}
                isDismissable={false}
                placement="center"
                scrollBehavior="inside"
                className="scrollbar-pill"
                onOpenChange={onOpenChange}
            >
                <ModalContent>
                    {() => (
                        <>
                            <ModalHeader>
                                <h1 className="text-2xl font-bold text-center">Reserva al ignorante</h1>
                            </ModalHeader>
                            <ModalBody>
                                <Input
                                    label="Character name"
                                    value={characterName}
                                    onFocus={() => setIsWriting(true)}
                                    onChange={(e) => {
                                        setIsWriting(true)
                                        setCharacterName(e.target.value)
                                        if (timoutRef.current) {
                                            clearTimeout(timoutRef.current)
                                        }
                                        // @ts-ignore
                                        timoutRef.current = setTimeout(() => {
                                            setIsWriting(false)
                                        }, 2000)
                                    }}
                                    onBlur={() => setIsWriting(false)}
                                />
                                <div className="h-24">
                                    {characterName && !character?.name && (<span>Character not found</span>)}
                                    {character?.name && (
                                        <div className="flex gap-2">
                                            <img src={character.avatar} alt={character.name}
                                                 className="rounded w-20 h-20"/>
                                            <div className="flex flex-col gap-2">
                                                <Link
                                                    target={'_blank'}
                                                    href={`/roster/${lowerCaseCharacterName}`}>
                                                    <span>{character.name} ({character.level})</span>
                                                </Link>
                                                <span>Class: {character.character_class?.name}</span>
                                                <span>Guild: {character.guild?.name ?? 'No guild, Invite this guy'}</span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <div className="flex flex-col gap-2">
                                    <div className="flex justify-between items-center gap-2">
                                        <Input
                                            disabled={!character?.name}
                                            label="Item name"
                                            value={itemName}
                                            onChange={(e) => {
                                                const name = e.target.value
                                                if (!name) {
                                                    setItemId(undefined)
                                                    setSelectedItem(null)
                                                    setItemName(name)

                                                    return
                                                }
                                                setItemName(name)
                                                const item = !name ? undefined : items.find((item: any) => item?.name?.toLowerCase().includes(name.toLowerCase()))
                                                setItemId(item?.id)
                                                setSelectedItem(item)
                                            }}
                                        />
                                        <Button
                                            isIconOnly
                                            isDisabled={!character?.id || !itemId}
                                            onClick={() => {
                                                if (!character?.id) return
                                                if (!itemId) return
                                                createReserve(character, itemId)
                                            }}
                                        >
                                            <FontAwesomeIcon icon={faCartPlus}/>
                                        </Button>
                                    </div>
                                    <div className="w-full h-11 flex gap-2">
                                        {selectedItem && (<Item item={selectedItem}/>)}
                                    </div>
                                </div>
                            </ModalBody>
                            <ModalFooter>
                                <Button onClick={onClose}>
                                    Done
                                </Button>
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>
        </>
    )
}
