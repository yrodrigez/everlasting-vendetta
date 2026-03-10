import { create } from 'zustand';

export type Vista = 'list' | 'link' | 'role-selection';
export interface VistaStore {
    vista: Vista;
    setVista: (vista: Vista) => void;
    
}

export const useVistaStore = create<VistaStore>((set) => ({
    vista: 'list',
    setVista: (vista: Vista) => set({ vista }),
}));