'use client'
import {TimeInput} from "@nextui-org/react";
import {Time} from "@internationalized/date";
import useCreateRaidStore from "@/app/calendar/new/Components/useCreateRaidStore";
import moment from "moment";

export default function TimeManager() {
    const {raid, setStartTime, setEndTime, startTime, endTime} = useCreateRaidStore(state => state)
    const timeStart = new Time(parseInt(startTime.substring(0, 2)), parseInt(startTime.substring(3, 5)))
    const timeEnd = new Time(parseInt(endTime.substring(0, 2)), parseInt(endTime.substring(3, 5)))
    return (
        <div
            className="flex flex-col gap-2 min-w-32"
        >
            <TimeInput
                className="max-w-[400px]"
                isDisabled={!raid}
                hourCycle={24}
                value={timeStart}
                onChange={(time) => setStartTime(moment(time).format('HH:mm'))}
                label="Start Time" defaultValue={new Time(20, 30)}/>
            <TimeInput
                className="max-w-[400px]"
                isDisabled={!raid}
                hourCycle={24}
                value={timeEnd}
                onChange={(time) => setEndTime(moment(time).format('HH:mm'))}
                label="End Time" defaultValue={new Time(0, 0)}/>
        </div>
    )
}
