'use client'
import {TimeInput} from "@nextui-org/react";
import {Time} from "@internationalized/date";
import useCreateRaidStore from "@/app/calendar/new/Components/useCreateRaidStore";
import moment from "moment";

export default function TimeManager() {
    const {
        raid,
        setStartTime,
        setEndTime,
        endTime,
        startTime
    } = useCreateRaidStore((state) => state);

    const timeStart = new Time(
        parseInt(startTime.split(':')[0]),
        parseInt(startTime.split(':')[1])
    );

    const timeEnd = new Time(
        parseInt(endTime.split(':')[0]),
        parseInt(endTime.split(':')[1])
    );


    return (
        <div className="flex flex-col gap-2 min-w-32">
            <TimeInput
                className="max-w-[400px]"
                isDisabled={!raid}
                hourCycle={24}
                value={timeStart}
                onChange={(time) => setStartTime(moment(time).format('HH:mm'))}
                label="Start Time" defaultValue={timeStart}/>
            <TimeInput
                className="max-w-[400px]"
                isDisabled={!raid}
                hourCycle={24}
                value={timeEnd}
                onChange={(time) => setEndTime(moment(time).format('HH:mm'))}
                label="End Time" defaultValue={timeEnd}/>
        </div>
    );
}
