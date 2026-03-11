import {create as createStore} from "zustand";

export type CharacterItemsStore = {
    items: any[];
    updateItem: (item: any) => void;
    characterName?: string;
    setCharacterName: (characterName: string) => void;
};

const initialState = {
    items: [
        {slot: {type: 'HEAD',}, loading: true},
        {slot: {type: 'NECK',}, loading: true},
        {slot: {type: 'SHOULDER',}, loading: true},
        {slot: {type: 'CHEST',}, loading: true},
        {slot: {type: 'WAIST',}, loading: true},
        {slot: {type: 'LEGS',}, loading: true},
        {slot: {type: 'FEET',}, loading: true},
        {slot: {type: 'WRIST',}, loading: true},
        {slot: {type: 'HANDS',}, loading: true},
        {slot: {type: 'FINGER_1',}, loading: true},
        {slot: {type: 'FINGER_2',}, loading: true},
        {slot: {type: 'TRINKET_1',}, loading: true},
        {slot: {type: 'TRINKET_2',}, loading: true},
        {slot: {type: 'BACK',}, loading: true},
        {slot: {type: 'MAIN_HAND',}, loading: true},
        {slot: {type: 'OFF_HAND',}, loading: true},
        {slot: {type: 'RANGED',}, loading: true},
        {slot: {type: 'SHIRT',}, loading: true},
        {slot: {type: 'TABARD',}, loading: true}
    ],
    characterName: ''
}

export const useCharacterItemsStore = createStore<CharacterItemsStore>(((set) => ({
    ...initialState,
    setCharacterName: (characterName) => set({characterName}),
    updateItem: (item) => set((state) => {
        const index = state.items.findIndex((i) => i.slot.type === item.slot.type)
        const newItems = [...state.items]
        newItems[index] = item
        return {items: newItems}
    }),
})));
