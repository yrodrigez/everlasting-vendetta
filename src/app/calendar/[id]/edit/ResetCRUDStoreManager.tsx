'use client'
import {type ReactNode, useEffect} from "react";
import useCreateRaidStore from "@/app/calendar/new/Components/useCreateRaidStore";

export function ResetCRUDStoreManager({reset, children}: { reset: any, children: ReactNode }) {
    const {setRaid, setStartDate, setEndDate, setStartTime, setEndTime, setDays} = useCreateRaidStore(state => state)

    useEffect(() => {
        setRaid(reset.raid)
        setStartDate(new Date(reset.raid_date))
        setEndDate(new Date(reset.end_date))
        setStartTime(reset.time ?? '20:30')
        setEndTime(reset.end_time ?? '00:00')
        setDays(reset.days)
    }, []);

    return children
}
