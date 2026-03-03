'use client'
import {type ReactNode, useEffect} from "react";
import useCreateRaidStore from "@/app/calendar/new/Components/useCreateRaidStore";
import {useShallow} from "zustand/shallow";

export function ResetCRUDStoreManager({reset, children}: { reset: any, children: ReactNode }) {
    const {
        setRaid,
        setStartDate,
        setEndDate,
        setStartTime,
        setEndTime,
        setDays,
        setRealm,
        setAllowSoftReserves,
        setSoftReservesAmmount,
        setOnTimeBonusExtraEnabled,
        setOnTimeBonusExtraAmmount,
        setOnTimeBonusCutoffHours,
    } = useCreateRaidStore(useShallow(state => ({
        setRaid: state.setRaid,
        setStartDate: state.setStartDate,
        setEndDate: state.setEndDate,
        setStartTime: state.setStartTime,
        setEndTime: state.setEndTime,
        setDays: state.setDays,
        setRealm: state.setRealm,
        setAllowSoftReserves: state.setAllowSoftReserves,
        setSoftReservesAmmount: state.setSoftReservesAmmount,
        setOnTimeBonusExtraEnabled: state.setOnTimeBonusExtraEnabled,
        setOnTimeBonusExtraAmmount: state.setOnTimeBonusExtraAmmount,
        setOnTimeBonusCutoffHours: state.setOnTimeBonusCutoffHours,
    })))

    useEffect(() => {
        setRaid(reset.raid)
        setStartDate(new Date(reset.raid_date))
        setEndDate(new Date(reset.end_date))
        setStartTime(reset.time ?? '20:30')
        setEndTime(reset.end_time ?? '23:59')
        setDays(reset.days)
        setRealm(reset.realm ?? 'living-flame')
        setAllowSoftReserves(reset.is_reservations_allowed ?? true)
        setSoftReservesAmmount(reset.reserve_ammount ?? 0)
        setOnTimeBonusExtraEnabled(reset.on_time_bonus_enabled ?? false)
        setOnTimeBonusExtraAmmount(reset.on_time_bonus_extra_reservations ?? 0)
        setOnTimeBonusCutoffHours(reset.on_time_bonus_cutoff_hours ?? 0)
    }, []);

    return children
}
