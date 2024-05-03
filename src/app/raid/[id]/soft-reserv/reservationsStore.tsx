import {create as createStore} from 'zustand'
import type {RaidItem, Reservation, Character} from "@/app/raid/[id]/soft-reserv/types";

// const storeKey = 'reservedItems'

interface ReservationStore {
    items: Reservation[]
    yourReservations: Reservation[]
    reservationsByItem: { item: RaidItem, reservations: Character[] }[]
    loading: boolean
    setItems: (items: Reservation[]) => void
    setYourReservations: (items: Reservation[]) => void
    setReservationsByItem: (items: { item: RaidItem, reservations: Character[] }[]) => void
    setLoading: (loading: boolean) => void
    isReservationsOpen: boolean
    setIsReservationsOpen: (open: boolean) => void
}

const initialState = {
    items: [],
    yourReservations: [],
    reservationsByItem: [],
    loading: false,
    isReservationsOpen: false,
}

export default createStore<ReservationStore>((set) => ({
    ...initialState,
    setItems: (items) => set({items}),
    setYourReservations: (items) => set({yourReservations: items}),
    setReservationsByItem: (items) => set({reservationsByItem: items}),
    setLoading: (loading) => set({loading}),
    setIsReservationsOpen: (isReservationsOpen) => set({isReservationsOpen}),
}))
