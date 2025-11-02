'use client'
import { type Reservation } from "@/app/raid/[id]/soft-reserv/types";
import 'client-only';
import { useEffect } from "react";
import { useRaidItems } from './raid-items-context';

export const useReservations = (resetId: string, initialItems: Reservation[] = [], options: {
    onExtraReserveUpdate?: Array<Function>
} = {}) => {
    const { isReservationsOpen, 
        reserves, setReserves,
        maxReservations,
        isLoading,
        isPending,
        yourReserves,
        reservesByItem,
        hardReserve,
        removeHardReserve,
        reserve,
        remove,
        toggleReservationsOpen
    } = useRaidItems()


    useEffect(() => {
        if (options.onExtraReserveUpdate) {
            options.onExtraReserveUpdate.forEach(fn => fn())
        }
    }, [resetId, maxReservations]);

    return {
        items: reserves,
        loading: isLoading || isPending,
        globalLoading: isLoading || isPending,
        yourReservations: yourReserves,
        reservationsByItem: reservesByItem,
        setItems: setReserves,
        reserve,
        remove,
        isReservationsOpen,
        setIsReservationsOpen: toggleReservationsOpen,
        maxReservations,
        hardReserve,
        removeHardReserve
    }
}
