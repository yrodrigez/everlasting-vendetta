'use client'
import {getQualityColor} from "@/app/util";
import Link from "next/link";
import {useReservations} from "@/app/raid/[id]/soft-reserv/useReservations";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faClose, faCloudArrowDown} from "@fortawesome/free-solid-svg-icons";
import {Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, ScrollShadow, useDisclosure} from "@nextui-org/react";
import {Button} from "@/app/components/Button";
import {useCallback, useState} from "react";
import {useQuery} from "@tanstack/react-query";
import {useMessageBox} from "@utils/msgBox";

export function BannedItems({hardReservations, reset_id, isAdmin = false, raid_id}: {
    hardReservations: any,
    reset_id: string,
    isAdmin?: boolean
    raid_id: string
}) {
    const {removeHardReserve, loading, globalLoading, supabase} = useReservations(reset_id, [])

    const [updateLoading, setUpdateLoading] = useState(false)
    const {alert, yesNo} = useMessageBox()

    const updateFutureRaids = useCallback(async () => {
        if (!supabase || !reset_id || !raid_id) return
        if (updateLoading) return
        setUpdateLoading(true)
        const accept = await yesNo({
            message: 'Are you sure you want to update future raids? This will update all the future raids with the current banned items and update the template for the future raids.',
            yesText: 'Yes, update future raids',
            noText: 'No, cancel',
            title: 'Update future raids',
        })
        if (accept === 'no') return setUpdateLoading(false)

        const {data: futureResets, error: futureResetsError} = await supabase
            .from('raid_resets')
            .select('id')
            .eq('raid_id', raid_id)
            .neq('id', reset_id)
            .gt('raid_date', new Date().toISOString())
            .order('id', {ascending: true})
            .limit(100)
        if (futureResetsError) {
            alert({message: 'Error fetching future resets', type: 'error'})
            return setUpdateLoading(false)
        }


        const {error: deleteTemplateError} = await supabase.from('hard_reserve_templates')
            .delete()
            .eq('raid_id', raid_id)

        if (deleteTemplateError) {
            alert({message: 'Error deleting template', type: 'error'})
            return setUpdateLoading(false)
        }

        await Promise.all(futureResets?.map((x: any) => {
            return supabase.from('reset_hard_reserve')
                .delete()
                .eq('reset_id', x.id)
        }))

        const futureResetsData = futureResets.map((x: any) => {
            return hardReservations.map((y: any) => {
                return {
                    reset_id: x.id,
                    item_id: y.item_id
                }
            })
        }).flat()

        const templateData = hardReservations.map((x: any) => {
            return {
                item_id: x.item_id,
                raid_id: raid_id
            }
        })


        const [future, template] = await Promise.all([
            supabase.from('reset_hard_reserve').upsert(futureResetsData, {
                onConflict: 'item_id, reset_id'
            }),
            supabase.from('hard_reserve_templates').upsert(templateData, {
                onConflict: 'item_id, raid_id'
            })
        ])

        if (future.error || template.error) {
            alert({message: 'Error updating future raids', type: 'error'})
            return setUpdateLoading(false)
        }

        setUpdateLoading(false)
        alert('Future raids updated')

    }, [reset_id, hardReservations])

    return (
        <>
            <ScrollShadow className="flex flex-col gap-2 h-full overflow-auto max-h-96 scrollbar-pill">
                {hardReservations.map((hr: any) => (
                    <div key={hr.item_id}
                         className={`flex gap-2 justify-between items-center text-sm text-${getQualityColor(hr?.item?.description?.quality)} p-2 border border-wood rounded`}>
                        <Link href={`https://www.wowhead.com/classic/item=${hr.item_id}`}
                              className="flex gap-2 items-center" target="_blank">
                            <img src={hr.item.description.icon} alt={hr.item.name}
                                 className={`w-6 border border-${getQualityColor(hr?.item?.description?.quality)} rounded`}/>
                            <span>[{hr.item.name}]</span>
                        </Link>
                        {isAdmin && (
                            <button onClick={() => removeHardReserve(hr.item_id)}
                                    disabled={loading || globalLoading}
                                    className="text-red-500 hover:text-red-700">
                                <FontAwesomeIcon icon={faClose}/>
                            </button>
                        )}
                    </div>
                ))}
            </ScrollShadow>
            {isAdmin && (
                <Button
                    onPress={updateFutureRaids}
                    isLoading={updateLoading}
                    isDisabled={updateLoading}

                >
                    Update future raids
                </Button>
            )}
        </>
    );
}

export function ImportBannedItems({raid_id, reset_id}: { raid_id: string, reset_id: string }) {
    const {loading, supabase} = useReservations(reset_id, [])

    const {isOpen, onOpenChange, onClose, onOpen} = useDisclosure()

    const {alert} = useMessageBox()

    const {data: currentTemplate, isLoading} = useQuery({
        queryKey: ['hard_reserve_templates', raid_id],
        queryFn: async () => {
            if (!supabase) return []
            const {data, error} = await supabase.from('hard_reserve_templates').select(
                'item_id, item:raid_loot_item(*)'
            ).eq('raid_id', raid_id)
            if (error) {
                alert('Error fetching template')
                return
            }
            return data
        },
        enabled: !!supabase
    })
    const [isPending, setIsPending] = useState(false)
    const importFromTemplate = useCallback(async () => {
        if (!supabase || !reset_id || !raid_id) return
        if (loading || isLoading || !currentTemplate?.length) return
        setIsPending(true)
        const {error} = await supabase.from('reset_hard_reserve').upsert(
            currentTemplate.map((x: any) => {
                return {
                    reset_id,
                    item_id: x.item_id
                }
            }), {
                onConflict: ['reset_id', 'item_id'].join(',')
            }
        )

        if (error) {
            alert({message: 'Error importing template', type: 'error'})
            return
        }

        setTimeout(() => {
            setIsPending(false)
            window.location.reload()
            onClose()
        }, 3000)
    }, [currentTemplate, reset_id, raid_id, supabase, loading, isLoading])

    return (
        <>
            <Button
                isLoading={loading || isLoading}
                isDisabled={loading || isLoading || !currentTemplate?.length}
                onPress={onOpen}
                size="lg"
                startContent={!loading && !isLoading && <FontAwesomeIcon icon={faCloudArrowDown}/>}
            >
                {!currentTemplate?.length ? 'No template created' : 'Import from template'}
            </Button>
            <Modal
                isOpen={isOpen}
                onClose={onClose}
                placement="center"
                scrollBehavior="inside"
                className="scrollbar-pill"
                onOpenChange={onOpenChange}
                isDismissable={!isPending}
            >
                <ModalContent>
                    {() => (
                        <>
                            <ModalHeader>
                                <h2 className="text-xl font-bold">Import from template</h2>
                            </ModalHeader>
                            <ModalBody>
                                <div>
                                    <h3 className="text-lg">The following items will be imported as Hard Reserves (you
                                        can modify this after import)</h3>
                                    <ScrollShadow
                                        className="flex flex-col gap-2 h-full overflow-auto max-h-96 scrollbar-pill">
                                        {currentTemplate?.map((hr: any) => (
                                            <div key={hr.item_id}
                                                 className={`flex gap-2 justify-between items-center text-sm text-${getQualityColor(hr?.item?.description?.quality)} p-2 border border-wood rounded`}>
                                                <Link href={`https://www.wowhead.com/classic/item=${hr.item_id}`}
                                                      className="flex gap-2 items-center" target="_blank">
                                                    <img src={hr.item.description.icon} alt={hr.item.name}
                                                         className={`w-6 border border-${getQualityColor(hr?.item?.description?.quality)} rounded`}/>
                                                    <span>[{hr.item.name}]</span>
                                                </Link>
                                            </div>
                                        ))}
                                    </ScrollShadow>
                                </div>
                            </ModalBody>
                            <ModalFooter>
                                <Button
                                    isLoading={isPending}
                                    isDisabled={isPending}
                                    onPress={() => importFromTemplate()}>
                                    Import
                                </Button>
                                <Button
                                    isDisabled={isPending}
                                    onPress={onClose}>
                                    Cancel
                                </Button>
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>
        </>
    )
}
