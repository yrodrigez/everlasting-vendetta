import { create as createStore } from 'zustand'
import type { RaidItem, Reservation, Character } from "@/app/raid/[id]/soft-reserv/types";

interface ReservationStore {
    items: RaidItem[]
    yourReserves: Reservation[]
    reservesByItem: { item: RaidItem, reservations: Character[] }[]
    reserves: Reservation[]
    loading: boolean
    maxReservations: number
    extraReservations?: {
        resetId: string
        characterId: number
        extra: number
    }
    setItems: (items: RaidItem[]) => void
    setReserves: (items: Reservation[]) => void
    setYourReserves: (items: Reservation[]) => void
    setReservesByItem: (items: { item: RaidItem, reservations: Character[] }[]) => void
    setLoading: (loading: boolean) => void
    isReservationsOpen: boolean
    setIsReservationsOpen: (open: boolean) => void
    setMaxReservations: (maxReservations: number) => void
    setExtraReservations: (extraReservations: ReservationStore['extraReservations']) => void
}

const initialState = {
    items: [],
    reserves: [],
    yourReserves: [],
    reservesByItem: [],
    loading: true,
    isReservationsOpen: true,
    maxReservations: 0,
}

export default createStore<ReservationStore>((set) => ({
    ...initialState,
    setItems: (items) => {
        return set({ items })
    },
    setReserves: (items) => set({ reserves: items }),
    setYourReserves: (items) => set({ yourReserves: items }),
    setReservesByItem: (items) => set({ reservesByItem: items }),
    setLoading: (loading) => set({ loading }),
    setIsReservationsOpen: (isReservationsOpen) => set({ isReservationsOpen }),
    setMaxReservations: (maxReservations) => set({ maxReservations }),
    setExtraReservations: (extraReservations) => set({ extraReservations }),
}))
