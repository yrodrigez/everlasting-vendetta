import { create } from 'zustand';

export interface AuthManagerWindowStore {
    isOpen: boolean;
    onOpen: () => void;
    onClose: () => void;
    onOpenChange: (isOpen: boolean) => void;
}

export const useAuthManagerWindowStore = create<AuthManagerWindowStore>((set) => ({
    isOpen: false,
    onOpen: () => set({ isOpen: true }),
    onClose: () => set({ isOpen: false }),
    onOpenChange: (isOpen: boolean) => set({ isOpen }),
}));