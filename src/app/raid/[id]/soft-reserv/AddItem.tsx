import { Button } from "@/app/components/Button";
import { faCloudArrowUp } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Input, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, useDisclosure } from "@heroui/react";

import { useAuth } from "@/app/context/AuthContext";
import { useWoWItem } from "@/app/hooks/api/use-wow-item";
import { createClientComponentClient } from "@/app/util/supabase/createClientComponentClient";
import { useQuery } from "@tanstack/react-query";
import Link from "next/dist/client/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createAPIService } from "@/app/lib/api";
import { useMessageBox } from "@/app/util/msgBox";

export function AddItem({ resetId }: { resetId: string }) {
    const { accessToken } = useAuth()
    const supabase = useMemo(() => createClientComponentClient(accessToken), [accessToken]);

    const { isOpen, onOpen, onClose, onOpenChange } = useDisclosure()
    const [_, setIsWriting] = useState(false)
    const timoutRef = useRef<NodeJS.Timeout | null>(null)
    const [itemId, setItemId] = useState<string | undefined>()

    const { data: raid, isFetching: isRaidFetching } = useQuery({
        queryKey: ['raid', resetId],
        enabled: !!supabase,
        queryFn: async () => {
            return supabase.from('raid_resets')
                .select('raid:ev_raid(id, name)')
                .eq('id', resetId)
                .single()
                .overrideTypes<{ raid: { id: string, name: string } }>()
                .then(({ data, error }) => {
                    if (error) {
                        console.error(error)
                        throw new Error('Failed to fetch raid info')
                    }
                    return data?.raid
                })
        }
    })
    const { alert } = useMessageBox()
    const [isSaving, setIsSaving] = useState(false)
    const performSave = useCallback(async () => {
        if (!raid || !itemId || isNaN(parseInt(itemId, 10)) || isSaving || isRaidFetching) {
            return
        }
        setIsSaving(true)
        try {
            const api = createAPIService()
            const res = await api.raids.addItem({ raidId: raid.id, itemId: parseInt(itemId, 10), bossName: '' })

            if (res?.item) {
                alert({ message: 'Item added successfully', type: 'success' })
            } else {
                throw new Error('Failed to add item')
            }
        } catch (error: any) {
            console.error(error)
            alert({ message: 'An error occurred while adding the item: ' + (error?.message || 'NO DETAILS'), type: 'error' })
        } finally {
            setIsSaving(false)
        }

    }, [raid, itemId, isSaving, isRaidFetching, alert])

    const { data: item, isLoading: isItemLoading, isError: isItemError } = useWoWItem(parseInt(itemId ?? '', 10))
    useEffect(() => {
        console.log({ item })
    }, [item])

    return <>
        <Button
            className={'bg-moss text-gold rounded'}
            size={'lg'}
            isIconOnly
            isLoading={isRaidFetching}
            isDisabled={isRaidFetching || !raid}
            onPress={onOpen}
        >
            <FontAwesomeIcon icon={faCloudArrowUp} />
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
                                </div>
                                <div className="flex gap-2 pt-4 px4">
                                    {item && (
                                        <Link href={`https://www.wowhead.com/item=${itemId}`} target="_blank" className="flex gap-2 items-center">
                                            <img src={item.itemDetails.icon} alt={item.itemDetails.name} className={`rounded border border-${item.itemDetails.quality.name?.toLowerCase()}`} />
                                            <span>{item.itemDetails.name}</span>
                                        </Link>
                                    )}
                                </div>
                            </div>
                        </ModalBody>
                        <ModalFooter>
                            <Button
                                isLoading={isItemLoading}
                                isDisabled={isItemLoading || isItemError || !item}
                                onPress={performSave}
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
