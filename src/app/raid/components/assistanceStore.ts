import {create as createStore} from 'zustand'
import {persist} from 'zustand/middleware';

interface AssistanceStore {
    selectedDays: Array<string>,
    addDay: (day: string) => void,
    removeDay: (day: string) => void
    clearDays: () => void
    setDays: (days: string[]) => void
}

const initialState = {
    selectedDays: []
}

export const useAssistanceStore = createStore<AssistanceStore>()(persist((set, get) => ({
    ...initialState,
    addDay: (day) => {
        const selectedDays = get().selectedDays
        if (selectedDays.includes(day)) return
        set({selectedDays: [...selectedDays, day]})
    },
    removeDay: (day) => {
        const selectedDays = get().selectedDays
        set({selectedDays: selectedDays.filter(d => d !== day)})
    },
    clearDays: () => set({selectedDays: []}),
    setDays: (days) => set({selectedDays: days})
}), {name: 'assistance-store'}))
