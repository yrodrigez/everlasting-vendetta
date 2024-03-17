import {create} from 'zustand';

export interface SharedTooltipStore {
    isClicked: boolean;
    setIsClicked: (isClicked: boolean) => void;
    isHovered: boolean;
    setIsHovered: (isHovered: boolean) => void;
    itemId: number;
    setItemId: (itemId: number) => void;
}

const initialState = {
    isClicked: false,
    isHovered: false,
    itemId: 0,
}

export const useSharedTooltipStore = create<SharedTooltipStore>((set) => ({
    ...initialState,
    setIsClicked: (isClicked: boolean) => set({isClicked}),
    setIsHovered: (isHovered: boolean) => set({isHovered}),
    setItemId: (itemId: number) => set({itemId}),
}));
