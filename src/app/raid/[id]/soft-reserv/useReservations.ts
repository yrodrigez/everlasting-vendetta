'use client'
import {useEffect, useState} from "react";
import {useSession} from "@/app/hooks/useSession";
import {raidLootReservationsColumns} from "@/app/raid/[id]/soft-reserv/supabase_config";
import {type RaidItem, type Reservation, type Character} from "@/app/raid/[id]/soft-reserv/types";
import useReservationsStore from "@/app/raid/[id]/soft-reserv/reservationsStore";
import {toast} from "sonner";
import {SupabaseClient} from "@supabase/auth-helpers-nextjs";

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
    return items
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


export const useReservations = (resetId: string, initialItems: Reservation[] = []) => {
    const {selectedCharacter, supabase} = useSession()
    const [items, yourReservations, reservationsByItem, loading, isReservationsOpen] = useReservationsStore(state => [state.items, state.yourReservations, state.reservationsByItem, state.loading, state.isReservationsOpen])
    const {
        setYourReservations,
        setReservationsByItem,
        setItems,
        setLoading,
        setIsReservationsOpen
    } = useReservationsStore(state => state)

    useEffect(() => {
        setReservationsByItem([...groupByItem(items)])
        setYourReservations([...items?.filter((item) => item.member?.id === selectedCharacter?.id)])
    }, [items, loading, selectedCharacter]);

    useEffect(() => {
        if (!selectedCharacter?.id || !supabase || !resetId) return
        (async () => {
            setLoading(true)
            const items = await fetchItems(supabase, resetId)
            setItems(items)
            const isOpen = await fetchReservationsOpen(supabase, resetId)
            setIsReservationsOpen(isOpen)
            setLoading(false)
        })();

        const reservationsChannel = supabase.channel(`raid_loot_reservation:reset_id=eq.${resetId}`)
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'raid_loot_reservation',
                filter: `reset_id=eq.${resetId}`
            }, async () => {
                const items = await fetchItems(supabase, resetId)
                setItems(items)
            }).subscribe()

        const isOpenChannel = supabase.channel(`raid_resets:id=eq.${resetId}`)
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'raid_resets',
                filter: `id=eq.${resetId}`
            }, async () => {
                const isOpen = await fetchReservationsOpen(supabase, resetId)
                setIsReservationsOpen(isOpen)
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
        }
    }, [resetId, selectedCharacter, supabase]);

    const reserve = async (itemId: number) => {
        if (!selectedCharacter?.id || !supabase) return
        setLoading(true)
        const isError = await reserveItem(supabase, resetId, itemId, selectedCharacter.id)
        setLoading(false)
        if (isError) {
            const audio = new Audio('/sounds/HumanMale_err_itemmaxcount01.ogg');
            audio.play().then().catch(console.error)
            toast.error('Only 2 reservations per save is allowed.')
        } else {
            const audio = new Audio('/sounds/LootCoinSmall.ogg');
            audio.play().then().catch(console.error)
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

    return {
        items,
        loading,
        yourReservations,
        reservationsByItem,
        setItems,
        reserve,
        remove,
        isReservationsOpen,
        setIsReservationsOpen: toggleReservationsOpen
    }
}
