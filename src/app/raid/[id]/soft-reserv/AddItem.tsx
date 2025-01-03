import {Button} from "@/app/components/Button";
import {faCloudArrowUp} from "@fortawesome/free-solid-svg-icons";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {useSession} from "@/app/hooks/useSession";
import {type SupabaseClient} from "@supabase/supabase-js";
import {Input, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, useDisclosure} from "@nextui-org/react";

import {useMutation, useQuery} from "@tanstack/react-query";
import {useRef, useState} from "react";
import {ItemTooltip} from "@/app/raid/[id]/soft-reserv/RaidItemCard";

async function fetchRaidFromResetId(resetId: string, supabase?: SupabaseClient) {
    if (!supabase) {
        return null
    }

    const {error, data} = await supabase
        .from('raid_resets')
        .select('raid:ev_raid(id, name)')
        .eq('id', resetId)
        .single<{ raid: { id: string, name: string } }>()

    if (error) {
        console.error(error)
        return null
    }

    return data?.raid
}

async function fetchItemMetadata(itemId: number) {
    if (!itemId) {
        return null
    }
    const response = await fetch(`/api/v1/services/item/metadata/${itemId}`)
    if (!response.ok) {
        return null
    }
    return response.json()
}

async function addItemToRaid(raidId?: string, item?: any, supabase?: SupabaseClient) {
    if (!supabase) {
        return false
    }

    if (!item) {
        return false
    }

    if (!raidId) {
        return false
    }

    const {error: lootError} = await supabase
        .from('raid_loot_item')
        .upsert({
            ...item
        })

    if (lootError) {
        console.error(lootError)
    }

    const {error: raid_loot_error} = await supabase
        .from('raid_loot')
        .upsert({
            raid_id: raidId,
            item_id: item.id
        }, {
            onConflict: 'item_id, raid_id'
        })

    if (raid_loot_error) {
        console.error(raid_loot_error)
    }

    return (lootError === undefined || lootError === null)
}

export function AddItem({resetId}: { resetId: string }) {
    const {supabase} = useSession()
    const {isOpen, onOpen, onClose, onOpenChange} = useDisclosure()
    const [_, setIsWriting] = useState(false)
    const timoutRef = useRef<NodeJS.Timeout | null>(null)
    const [itemId, setItemId] = useState<string | undefined>()
    const qualityColors = [
        'poor',
        'common',
        'uncommon',
        'rare',
        'epic',
        'legendary'
    ]

    const [qualityColor, setQualityColor] = useState<'poor' | 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'>('common')

    const {isPending, mutate: findItemMetadata, data: item} = useMutation({
        mutationKey: ['add_item'],
        mutationFn: async ({itemId}: { itemId: number }) => {
            const item = await fetchItemMetadata(itemId)
            if (!item) {
                return null
            }
            setQualityColor((qualityColors[item.description.quality ?? 0] || 'common') as 'poor' | 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary')
            return item
        }
    })

    const {data: raid, isFetching: isRaidFetching} = useQuery({
        queryKey: ['raid', resetId],
        enabled: !!supabase,
        queryFn: () => fetchRaidFromResetId(resetId, supabase)
    })

    return <>
        <Button
            className={'bg-moss text-gold rounded'}
            size={'lg'}
            isIconOnly
            isLoading={isRaidFetching}
            isDisabled={isRaidFetching}
            onPress={onOpen}
        >
            <FontAwesomeIcon icon={faCloudArrowUp}/>
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
                            <h1 className="text-2xl font-bold text-center">Add an item to {raid?.name} raid</h1>
                        </ModalHeader>
                        <ModalBody>
                            <div
                                className="flex flex-col gap-2"
                            >
                                <div
                                    className="flex gap-2 items-center"
                                >
                                    <Input label="Item id" type="number" value={itemId}
                                           onChange={(e) => {
                                               setItemId(e.target.value)
                                               if (timoutRef.current) {
                                                   clearTimeout(timoutRef.current)
                                               }
                                               timoutRef.current = setTimeout(() => {
                                                   setIsWriting(false)
                                               }, 1000)
                                           }}
                                    />
                                    <Button
                                        onClick={() => {
                                            findItemMetadata({itemId: parseInt(itemId ?? '')})
                                        }}
                                        isLoading={isPending}
                                        isDisabled={isPending || !itemId}
                                    >
                                        Find item
                                    </Button>
                                </div>
                                <div className="flex gap-2 pl-10">
                                    {item && (
                                        <ItemTooltip
                                            qualityColor={qualityColor}
                                            item={item}
                                        />
                                    )}
                                </div>
                            </div>
                        </ModalBody>
                        <ModalFooter>
                            <Button
                                isLoading={isPending}
                                isDisabled={isPending || !item?.id}
                                onClick={() => {
                                    addItemToRaid(raid?.id, item, supabase).then((success) => {
                                        if (success) {
                                            onClose()
                                        } else {
                                            alert('An error occurred while adding the item')
                                        }
                                    })
                                }}
                            >
                                Add item
                            </Button>
                        </ModalFooter>
                    </>
                )}
            </ModalContent>
        </Modal>
    </>
}
