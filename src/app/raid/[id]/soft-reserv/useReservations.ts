'use client'
import {useCallback, useEffect} from "react";
import {useSession} from "@/app/hooks/useSession";
import {raidLootReservationsColumns} from "@/app/raid/[id]/soft-reserv/supabase_config";
import {type Character, type RaidItem, type Reservation} from "@/app/raid/[id]/soft-reserv/types";
import useReservationsStore from "@/app/raid/[id]/soft-reserv/reservationsStore";
import {toast} from "sonner";
import {SupabaseClient} from "@supabase/auth-helpers-nextjs";
import {useQuery} from "@tanstack/react-query";
import {registerOnRaid} from "@/app/lib/database/raid_resets/registerOnRaid";

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

const fetchItems = async (supabase: any, raidId: string) => {
    const {data: items, error} = await supabase
        .from('raid_loot_reservation')
        .select(raidLootReservationsColumns)
        .eq('reset_id', raidId)

    if (error) {
        console.error(error)
        return []
    }

    return items as Reservation[]
}

const reserveItem = async (supabase: any, raidId: string, itemId: number, characterId: number) => {
    const {error} = await supabase
        .from('raid_loot_reservation')
        .insert({
            reset_id: raidId,
            item_id: itemId,
            member_id: characterId
        })

    if (error) {
        console.error(error)
    }
    return error
}

const removeReservation = async (supabase: any, raidId: string, itemId: number, characterId: number) => {
    const {error} = await supabase
        .from('raid_loot_reservation')
        .delete()
        .eq('reset_id', raidId)
        .eq('item_id', itemId)
        .eq('member_id', characterId)
        .order('created_at', {ascending: false})
        .limit(1)


    if (error) {
        console.error(error)
    }

    return error
}

const setReservationsOpen = async (supabase: SupabaseClient, isOpen: boolean, reset_id: string) => {
    const {data, error} = await supabase
        .from('raid_resets')
        .update({reservations_closed: !isOpen})
        .eq('id', reset_id)
        .select('reservations_closed')
        .single()

    if (error) {
        console.error(error)
        return false
    }

    return !data?.reservations_closed
}

const fetchReservationsOpen = async (supabase: SupabaseClient, reset_id: string) => {
    const {data, error} = await supabase
        .from('raid_resets')
        .select('reservations_closed')
        .eq('id', reset_id)
        .single()

    if (error) {
        console.error(error)
        return false
    }

    return !data?.reservations_closed
}


const fetchTotalReservations = async (supabase: SupabaseClient, reset_id: string, characterId: number) => {
    const {data, error} = await supabase
        .rpc('calculate_total_reservations', {
            reset_uuid: reset_id,
            char_id: characterId
        });

    return data
}

export const useReservations = (resetId: string, initialItems: Reservation[] = [], options: {
    onExtraReserveUpdate?: Array<Function>
} = {}) => {
    const {selectedCharacter, supabase} = useSession()
    const [
        items,
        yourReservations,
        reservationsByItem,
        loading,
        isReservationsOpen,
        maxReservations
    ] = useReservationsStore(state => [state.items, state.yourReservations, state.reservationsByItem, state.loading, state.isReservationsOpen, state.maxReservations])

    const {
        setYourReservations,
        setReservationsByItem,
        setItems,
        setLoading,
        setIsReservationsOpen,
        setMaxReservations
    } = useReservationsStore(state => state)

    useEffect(() => {
        setReservationsByItem([...groupByItem(items)])
        setYourReservations([...items?.filter((item) => item.member?.id === selectedCharacter?.id)])
    }, [items, loading, selectedCharacter]);

    const {isLoading: isLoadingItems, error: errorItems, refetch: reFetchItems} = useQuery({
        queryKey: ['reservations', 'items', resetId],
        queryFn: async () => {
            const items = await fetchItems(supabase, resetId)
            setItems(items)
            return items
        },
        enabled: !!resetId && !!supabase,
    })

    const {isLoading: isLoadingReservations, error: errorReservations, refetch: reFetchTotalReservations} = useQuery({
        queryKey: ['reservations', 'total', resetId],
        queryFn: async () => {
            if (!selectedCharacter?.id || !supabase) {
                setMaxReservations(0)
                return 0
            }
            const total = await fetchTotalReservations(supabase, resetId, selectedCharacter.id)
            setMaxReservations(total)
            return total
        },
        enabled: !!resetId && !!supabase && !!selectedCharacter?.id,
    })

    const {
        isLoading: isLoadingReservationsOpen,
        error: errorReservationsOpen,
        refetch: reFetchReservationsOpen
    } = useQuery({
        queryKey: ['reservations', 'reservations_open', resetId],
        queryFn: async () => {
            if (!supabase) {
                setIsReservationsOpen(false)
                return false
            }
            const isOpen = await fetchReservationsOpen(supabase, resetId)
            setIsReservationsOpen(isOpen)
            return isOpen
        },
        enabled: !!resetId && !!supabase,
    })

    const {data: isPresent, refetch: refetchIsPresent} = useQuery({
        queryKey: ['reservations', 'is_present', resetId, selectedCharacter],
        queryFn: async () => {
            if (!supabase || !selectedCharacter) return false

            const {data, error} = await supabase
                .from('ev_raid_participant')
                .select('member_id')
                .eq('member_id', selectedCharacter.id)
                .eq('raid_id', resetId)
                .limit(1)

            if (error) {
                console.error(error)
                return false
            }

            return !!data?.length
        },
        enabled: !!resetId && !!selectedCharacter && !!supabase
    })

    const {data: resetDays, refetch: refetchResetDays} = useQuery({
        queryKey: ['reservations', 'reset_info', resetId],
        queryFn: async () => {
            if (!supabase) return []

            const {data, error} = await supabase
                .from('raid_resets')
                .select('days')
                .eq('id', resetId)
                .limit(1)
                .maybeSingle()

            if (error) {
                console.error(error)
                return []
            }

            return data?.days ?? []
        },
        enabled: !!resetId && !!supabase,
        staleTime: 1000 * 60 * 60 * 24
    })

    useEffect(() => {
        setLoading(isLoadingItems || isLoadingReservations || isLoadingReservationsOpen || !supabase || !selectedCharacter?.id)
    }, [isLoadingItems, isLoadingReservations, isLoadingReservationsOpen]);


    useEffect(() => {
        if (!selectedCharacter?.id || !supabase || !resetId) return

        const reservationsChannel = supabase.channel(`raid_loot_reservation:reset_id=eq.${resetId}`)
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'raid_loot_reservation',
                // filter: `reset_id=eq.${resetId}` this is failing for a reason, investigate later
            }, async () => {
                await reFetchItems()
            }).subscribe()

        const isOpenChannel = supabase.channel(`raid_resets:id=eq.${resetId}`)
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'raid_resets',
                filter: `id=eq.${resetId}`
            }, async () => {
                await reFetchReservationsOpen()
            }).subscribe()

        const extraReservationsChannel = supabase.channel(`ev_extra_reservations:reset_id=eq.${resetId}`)
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'ev_extra_reservations',
                filter: `reset_id=eq.${resetId}`
            }, () => {

                (async () => {
                    await reFetchTotalReservations()
                    options.onExtraReserveUpdate?.forEach((cb) => cb())
                })()
            }).subscribe()

        return () => {
            supabase.removeChannel(isOpenChannel).then(
                () => console.log('Unsubscribed from channel raid_resets'),
                (error: any) => console.error('Error unsubscribing from channel', error)
            )
            supabase.removeChannel(reservationsChannel).then(
                () => console.log('Unsubscribed from channel raid_loot_reservation'),
                (error: any) => console.error('Error unsubscribing from channel', error)
            )
            supabase.removeChannel(extraReservationsChannel).then(
                () => console.log('Unsubscribed from channel extra_reservations'),
                (error: any) => console.error('Error unsubscribing from channel', error)
            )
        }
    }, [resetId, selectedCharacter, supabase]);

    const reserve = async (itemId: number, characterId = selectedCharacter?.id) => {
        if (!characterId || !supabase) return
        setLoading(true)
        const isError = await reserveItem(supabase, resetId, itemId, characterId)
        setLoading(false)
        if (isError) {
            const audio = new Audio('/sounds/HumanMale_err_itemmaxcount01.ogg');
            audio.play().then().catch(console.error)
            toast.error(`Max reservations on reset or item reached`)
        } else {
            const audio = new Audio('/sounds/LootCoinSmall.ogg');
            audio.play().then().catch(console.error)
            if (!isPresent && selectedCharacter) {
                const className = (selectedCharacter?.playable_class?.name?.toLowerCase() ?? 'mage') as 'warrior' | 'paladin' | 'hunter' | 'rogue' | 'priest' | 'shaman' | 'mage' | 'warlock' | 'druid'
                if (!resetDays?.length) {
                    await refetchResetDays()
                }
                registerOnRaid(selectedCharacter.id, resetId, {
                    days: resetDays,
                    role: selectedCharacter.selectedRole ?? 'dps',
                    status: 'confirmed',
                    className
                }, supabase).then(() => {
                    refetchIsPresent()
                })
            }
        }
    }

    const remove = async (itemId: number) => {
        if (!selectedCharacter?.id || !supabase) return
        setLoading(true)
        await removeReservation(supabase, resetId, itemId, selectedCharacter.id)
        setLoading(false)
        const audio = new Audio('/sounds/PutDownCloth_Leather01.ogg');
        audio.play().then().catch(console.error)
    }

    const toggleReservationsOpen = async () => {
        if (!selectedCharacter?.id || !supabase) return
        setLoading(true)
        const isOpen = await setReservationsOpen(supabase, !isReservationsOpen, resetId)
        setIsReservationsOpen(isOpen)
        setLoading(false)
    }

    const hardReserve = useCallback(async (itemId: number) => {
        if (!selectedCharacter?.id || !supabase) return
        setLoading(true)
        const {error} = await supabase.from('reset_hard_reserve').insert({
            reset_id: resetId,
            item_id: itemId,
        })
        setLoading(false)
        if (error) {
            console.error(error)
            toast.error('Error hard reserving item')
        }

        const{error: itemError} = await supabase.from('raid_loot_reservation')
            .delete()
            .eq('reset_id', resetId)
            .eq('item_id', itemId)

        if (itemError) {
            console.error(itemError)
            toast.error('Error removing soft reserve')
        }
    }, [resetId, supabase])

    const removeHardReserve = useCallback(async (itemId: number) => {

        if (!selectedCharacter?.id || !supabase) return
        setLoading(true)
        const {error} = await supabase.from('reset_hard_reserve').delete().eq('reset_id', resetId).eq('item_id', itemId)
        setLoading(false)
        if (error) {
            console.error(error)
            toast.error('Error removing hard reserve')
        }

    }, [resetId, supabase])

    return {
        items,
        loading: loading || !supabase,
        globalLoading: !supabase,
        yourReservations,
        reservationsByItem,
        setItems,
        reserve,
        remove,
        isReservationsOpen,
        setIsReservationsOpen: toggleReservationsOpen,
        maxReservations,
        supabase,
        hardReserve,
        removeHardReserve
    }
}
