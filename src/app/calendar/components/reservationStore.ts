import {create as createStore} from 'zustand';
import {type RaidItem} from "@/app/calendar/components/RaidItemsList";
import {persist} from "zustand/middleware";

export type Reservations = {
    items: RaidItem[];
    addItem: (item: RaidItem) => void;
    removeItem: (item: RaidItem) => void;
    maxItems: number;
    clearItems: () => void;
};

export const useReservationsStore = createStore<Reservations>()(persist((set) => ({
    items: [],
    clearItems: () => set({items: []}),
    maxItems: 2,
    removeItem: (item) => set((state) => ({
        ...state,
        items: state.items.filter(i => i.id !== item.id)
    })),
    addItem: (item) => set((state) => {
        if (state.items.length >= state.maxItems) return state;
        return {
            ...state,
            items: [...state.items, item]
        };
    }),
}), {
    name: 'reservations-store',
}));
