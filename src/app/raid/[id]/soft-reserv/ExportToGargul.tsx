import {Button, Modal, ModalBody, ModalContent, ModalHeader, Tooltip, useDisclosure} from "@nextui-org/react";
import {faFileExport} from "@fortawesome/free-solid-svg-icons";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import type {Character, RaidItem} from "@/app/raid/[id]/soft-reserv/types";
import pako from "pako";
import {toast} from "sonner";
import {useSession} from "@hooks/useSession";
import {type SupabaseClient} from "@supabase/supabase-js";
import {useCallback, useEffect, useState} from "react";

function generateID(length: number) {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

async function fetchItems(supabase: SupabaseClient, resetId: string) {
    const {data: items, error} = await supabase.from('raid_loot_reservation')
        .select('member:ev_member(character), item:raid_loot_item(id)')
        .eq('reset_id', resetId)
        .returns<{
            member: {
                character: { name: string, character_class?: { name: string }, playable_class?: { name: string } }
            },
            item: { id: number }
        }[]>()
    if (error) {
        throw new Error('Error fetching items' + JSON.stringify(error))
    }

    return items?.map((item) => {
        return {
            item: item.item.id,
            character: {
                name: item.member.character.name,
                className: item.member.character?.name ?? item.member.character.playable_class?.name
            }
        }
    })
}

async function fetchRaidShortName(supabase: SupabaseClient, resetId: string) {
    const {data, error} = await supabase.from('raid_resets')
        .select('raid:ev_raid(short_name)')
        .eq('id', resetId)
        .single<{ raid: { short_name: string } }>()

    if (error) {
        throw new Error('Error fetching raid' + JSON.stringify(error))
    }

    return data?.raid?.short_name
}

async function fetchHrItems(supabase: SupabaseClient, resetId: string) {
    const {data: items, error} = await supabase.from('reset_hard_reserve')
        .select('item_id')
        .eq('reset_id', resetId)
        .returns<{ item_id: number }[]>()
    if (error) {
        throw new Error('Error fetching items' + JSON.stringify(error))
    }

    return items?.map((item) => {
        return {
            id: item.item_id,
        }
    })
}


export function ExportToGargul({isReservationsOpen, reservationsByItem, loading, resetId}: {
    isReservationsOpen: boolean,
    reservationsByItem: { item: RaidItem, reservations: Character[] }[]
    loading: boolean,
    resetId: string
}) {
    const {isOpen, onOpen, onOpenChange} = useDisclosure();
    const {supabase} = useSession();

    const [raidShortName, setRaidShortName] = useState<string | null>(null)
    const [internalLoading, setInternalLoading] = useState(false)
    const [base64, setBase64] = useState<string | null>(null)

    useEffect(() => {
        if (isReservationsOpen || loading || !supabase) {
            return
        }
        const execute = async () => {
            setInternalLoading(true)
            try {
                const [raidShortName] = await Promise.all([
                    fetchRaidShortName(supabase, resetId),
                ])
                setRaidShortName(raidShortName)
            } catch (e: any) {
                toast.error(e.message ?? 'Error fetching data')
            } finally {
                setInternalLoading(false)
            }
        }
        execute()
    }, [resetId, supabase, isReservationsOpen, loading]);


    const exportToGargul = useCallback(() => {
        if (loading || !supabase || !raidShortName) {
            return
        }

        const execute = async () => {
            setInternalLoading(true)
            setBase64(null)
            console.log('fetching items')
            try {
                const [items, hrItems] = await Promise.all([
                    fetchItems(supabase, resetId),
                    fetchHrItems(supabase, resetId)
                ])
                return {items, hrItems}
            } catch (e: any) {
                toast.error(e.message ?? 'Error fetching data')
                throw e
            } finally {
                setInternalLoading(false)
            }
        }

        execute().then(({items, hrItems}) => {
            if (!items) {
                toast.error('Error fetching items')
                return
            }
            const createStructure = () => {
                return {
                    hardreserves: hrItems?.map((item) => {
                        return {
                            id: item.id,
                            note: '',
                            for: '',
                        }
                    }) ?? [],
                    softreserves: items?.reduce((acc, item) => {
                        const found = acc.find((group) => group.name === item.character.name)
                        if (found) {
                            found.items.push({
                                id: item.item,
                                note: '',
                                order: found.items.length,
                            })
                        } else {
                            acc.push({
                                name: item.character.name,
                                items: [{
                                    id: item.item,
                                    note: '',
                                    order: 0,
                                }],
                                ['class']: item.character.className?.toLowerCase() ?? '',
                                plusOnes: 0,
                                rollBonus: 0,
                                note: '',
                            })
                        }

                        return acc
                    }, [] as {
                        name: string,
                        items: { id: number, note: string, order: number }[],
                        ['class']: string,
                        plusOnes: number,
                        rollBonus: number,
                        note: string
                    }[]),
                    metadata: {
                        createdAt: new Date().getTime(),
                        updatedAt: new Date().getTime(),
                        raidStartsAt: new Date().getTime() + 1000 * 60 * 60,
                        discordUrl: '',
                        lockedAt: null,
                        note: "",
                        hidden: !isReservationsOpen,
                        instances: [raidShortName],
                        id: generateID(6),
                    }
                }
            }
            const json = JSON.stringify(createStructure())
            const compressedData = pako.deflate(json)
            // @ts-ignore - Uint8Array is supported
            const base64 = btoa(String.fromCharCode.apply(null, compressedData))
            setBase64(() => base64)
        })
    }, [raidShortName, supabase, isReservationsOpen, reservationsByItem, loading, isOpen])


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
                        isDisabled={loading || isReservationsOpen || internalLoading}
                        isIconOnly
                        className={'bg-moss text-gold rounded'}
                        onClick={() => {
                            onOpen()
                            exportToGargul()
                        }}
                        onPress={() => {
                            onOpen()
                            exportToGargul()
                        }}
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
                                        {!base64 ? ('Loading') : (
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
                                        )}
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
