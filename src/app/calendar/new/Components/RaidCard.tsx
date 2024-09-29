'use client'
import useCreateRaidStore from "@/app/calendar/new/Components/useCreateRaidStore";
import {RaidResetCard} from "@/app/calendar/components/RaidResetCard";
import moment from "moment";

export function RaidCard() {

    const {
        raid,
        startDate,
        endDate,
        startTime,
        endTime,
    } = useCreateRaidStore(state => state)

    if(!raid) return null
    return (
        <RaidResetCard
            raidImage={`/${raid.image}`}
            raidName={raid.name}
            raidDate={moment(startDate).format('YYYY-MM-DD') ?? moment().format('YYYY-MM-DD')}
            raidEndDate={moment(endDate).format('YYYY-MM-DD') ?? moment().add(7, 'days').format('YYYY-MM-DD')}
            raidTime={startTime ? startTime: '20:30'}
            raidRegistrations={[]}
        />
    )
}
