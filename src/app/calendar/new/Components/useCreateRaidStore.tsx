import { create as createStore } from "zustand";
export type Day = 'Sun' | 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat'
export type RaidCompositionInput = {
    tanks: number;
    healers: number;
    dps: number;
    raid_lead: 1;
}

export type RaidFormRaid = {
    id: string,
    name: string,
    min_level: number,
    image: string,
    reservation_amount: number,
    size: number,
}

export const createDefaultComposition = (raidSize: number): RaidCompositionInput => {
    if (raidSize < 25) return { tanks: 2, healers: 2, dps: 6, raid_lead: 1 }
    return { tanks: 3, healers: 5, dps: 17, raid_lead: 1 }
}

export const getCompositionCount = (composition?: RaidCompositionInput) =>
    (composition?.tanks ?? 0) + (composition?.healers ?? 0) + (composition?.dps ?? 0)

interface RaidStore {
    raid?: RaidFormRaid,
    setRaid: (raid?: RaidFormRaid) => void
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
    setRealm: (realm: string) => void,
    allowSoftReserves: boolean,
    setAllowSoftReserves: (allow: boolean) => void
    softReservesAmmount: number,
    setSoftReservesAmmount: (ammount: number) => void
    onTimeBonusExtraEnabled: boolean,
    setOnTimeBonusExtraEnabled: (enabled: boolean) => void
    onTimeBonusExtraAmmount: number,
    setOnTimeBonusExtraAmmount: (ammount: number) => void
    onTimeBonusCutoffHours: number,
    setOnTimeBonusCutoffHours: (hours: number) => void
    createdById?: number,
    setCreatedById: (id?: number) => void
    composition?: RaidCompositionInput,
    setComposition: (composition?: RaidCompositionInput) => void
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
    setRealm: () => { },
    allowSoftReserves: true,
    setAllowSoftReserves: () => { },
    softReservesAmmount: 0,
    setSoftReservesAmmount: () => { },
    onTimeBonusExtraEnabled: false,
    setOnTimeBonusExtraEnabled: () => { },
    onTimeBonusExtraAmmount: 1,
    setOnTimeBonusExtraAmmount: () => { },
    onTimeBonusCutoffHours: 24,
    setOnTimeBonusCutoffHours: () => { },
    createdById: undefined,
    setCreatedById: () => { },
    composition: undefined,
    setComposition: () => { },
};

export default createStore<RaidStore>(((set) => ({
    ...initialState,
    setRaid: (raid) => set({ raid, composition: raid ? createDefaultComposition(raid.size) : undefined }),
    setStartDate: (startDate) => set({ startDate }),
    setEndDate: (endDate) => set({ endDate }),
    setStartTime: (startTime) => set({ startTime }),
    setEndTime: (endTime) => set({ endTime }),
    setDays: (days) => set({ days }),
    setRealm: (realm) => set({ realm }),
    setAllowSoftReserves: (allowSoftReserves) => set({ allowSoftReserves }),
    setSoftReservesAmmount: (softReservesAmmount) => set({ softReservesAmmount }),
    setOnTimeBonusExtraEnabled: (onTimeBonusExtraEnabled) => set({ onTimeBonusExtraEnabled }),
    setOnTimeBonusExtraAmmount: (onTimeBonusExtraAmmount) => set({ onTimeBonusExtraAmmount }),
    setOnTimeBonusCutoffHours: (onTimeBonusCutoffHours) => set({ onTimeBonusCutoffHours }),
    setCreatedById: (createdById) => set({ createdById }),
    setComposition: (composition) => set({ composition: composition ? { ...composition, raid_lead: 1 } : undefined }),
})));
