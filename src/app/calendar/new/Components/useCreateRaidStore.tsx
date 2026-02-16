import { create as createStore } from "zustand";
export type Day = 'Sun' | 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat'
interface RaidStore {
    raid?: {
        id: string,
        name: string,
        min_level: number,
        image: string,
        reservation_amount: number
    },
    setRaid: (raid?: { id: string, name: string, min_level: number, image: string, reservation_amount: number }) => void
    startDate: Date,
    setStartDate: (date: Date) => void
    endDate?: Date,
    setEndDate: (date: Date) => void
    startTime: string,
    setStartTime: (date: string) => void
    endTime: string,
    setEndTime: (date: string) => void
    days?: Day[],
    setDays: (days: Day[]) => void
    loading?: boolean
    realm: string,
    setRealm: (realm: string) => void
}

const initialState = {
    raid: undefined,
    startDate: new Date(),
    endDate: undefined,
    startTime: '20:30',
    endTime: '23:59',
    days: undefined,
    loading: false,
    realm: 'spineshatter',
    setRealm: (realm: string) => { },
}

export default createStore<RaidStore>(((set) => ({
    ...initialState,
    setRaid: (raid) => set({ raid }),
    setStartDate: (startDate) => set({ startDate }),
    setEndDate: (endDate) => set({ endDate }),
    setStartTime: (startTime) => set({ startTime }),
    setEndTime: (endTime) => set({ endTime }),
    setDays: (days) => set({ days }),
    setRealm: (realm) => set({ realm })
})));
