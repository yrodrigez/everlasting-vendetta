import { Button } from "@/app/components/Button";
import { Item } from "@/app/components/item/Item";
import { useAuth } from "@/app/context/AuthContext";
import { useFetchCharacter } from "@/app/hooks/api/use-fetch-character";
import { fetchItems } from "@/app/lib/database/raid_loot_item/fetchItems";
import { getRaidIdByResetId } from "@/app/lib/database/raid_resets/getRaidIdByResetId";
import { useReservations } from "@/app/raid/[id]/soft-reserv/useReservations";
import { createRosterMemberRoute } from "@/app/util/create-roster-member-route";
import { createClientComponentClient } from "@/app/util/supabase/createClientComponentClient";
import { faCartPlus, faUserTie } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    Input,
    Modal,
    ModalBody,
    ModalContent,
    ModalFooter,
    ModalHeader,
    useDisclosure
} from "@heroui/react";
import { useQuery } from '@tanstack/react-query';
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";


export function ReserveForOthers({ resetId, realmSlug }: { resetId: string, realmSlug: string }) {
    const { isOpen, onOpen, onClose, onOpenChange } = useDisclosure()
    const {
        reserve,
    } = useReservations(resetId)

    const [characterName, setCharacterName] = useState('')
    const lowerCaseCharacterName = useMemo(() => characterName?.toLowerCase(), [characterName])
    const [itemId, setItemId] = useState<number | undefined>()
    const [isWriting, setIsWriting] = useState(false)
    const { accessToken } = useAuth()
    const supabase = useMemo(() => createClientComponentClient(accessToken), [accessToken]);
    const timoutRef = useRef<NodeJS.Timeout>(null)
    const [selectedItem, setSelectedItem] = useState<any>(null)
    const [itemName, setItemName] = useState('' as string)
    const { data: items = [], error, isLoading } = useQuery({
        queryKey: ['raid_loot_item', resetId],
        queryFn: async () => {
            if (!supabase) return []
            const raidId = await getRaidIdByResetId(supabase, resetId)
            if (!raidId) throw new Error('Raid not found')
            return fetchItems(supabase, raidId)
        },
        enabled: !!supabase,
    })

    const createReserve = useCallback(async (character: { id: number }, itemId: number) => {
        if (!character.id) {
            toast.error('Character not found')
            return
        }
        if (!supabase) {
            toast.error('Error connecting to the database')
            return
        }


        try {
            await reserve(itemId, character.id)
        } catch (e: any) {
            toast.error(e.message ?? 'Error reserving item')
        }

    }, [lowerCaseCharacterName, supabase])

    const { fetchCharacterAsync, character, isPending, isError } = useFetchCharacter()

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
        fetchCharacterAsync({
            name: lowerCaseCharacterName,
            realm: realmSlug
        })
    }, [lowerCaseCharacterName, isWriting])


    return (
        <>
            <Button
                isIconOnly
                disabled={isLoading}
                onPress={onOpen}
                isLoading={isLoading}
                size={'lg'}
            >
                <FontAwesomeIcon icon={faUserTie} />
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
                                <h1 className="text-2xl font-bold text-center">Reserve for Others</h1>
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
                                                className="rounded w-20 h-20" />
                                            <div className="flex flex-col gap-2">
                                                <Link
                                                    target={'_blank'}
                                                    href={createRosterMemberRoute(character.name, realmSlug)}>
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
                                            onPress={() => {
                                                if (!character?.id) return
                                                if (!itemId) return
                                                createReserve(character, itemId)
                                            }}
                                        >
                                            <FontAwesomeIcon icon={faCartPlus} />
                                        </Button>
                                    </div>
                                    <div className="w-full h-11 flex gap-2">
                                        {selectedItem && (<Item item={selectedItem} />)}
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
