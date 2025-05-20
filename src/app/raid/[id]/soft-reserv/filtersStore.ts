import {create as createStore} from "zustand";
import {persist} from "zustand/middleware";

export type RaidItemFilters = {
    name?: string,
    itemClass?: string[],
    itemSubClass?: string[],
    inventoryType?: string[],
    qualityName?: string[],
}


type RaidFiltersStore = {
    setName: (name: string) => void
    setItemClass: (itemClass: string[]) => void
    setItemSubClass: (itemSubClass: string[]) => void
    setInventoryType: (inventoryType: string[]) => void
    setQualityName: (qualityName: string[]) => void
    clear: () => void
} & RaidItemFilters

const initialState: RaidItemFilters = {name: '', itemClass: [], itemSubClass: [], inventoryType: [], qualityName: []}
export const useFiltersStore = createStore<RaidFiltersStore>()(
    persist(
        (set: any) => ({
            ...initialState,
            setName: (name: string) => set({name}),
            setItemClass: (itemClass: string[]) => set({itemClass}),
            setItemSubClass: (itemSubClass: string[]) => set({itemSubClass}),
            setInventoryType: (inventoryType: string[]) => set({inventoryType}),
            setQualityName: (qualityName: string[]) => set({qualityName}),
            clear: () => set({...initialState}),
        }),
        {name: 'raid-filters-store',}
    )
);
