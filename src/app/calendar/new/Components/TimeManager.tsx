'use client'
import {TimeInput} from "@heroui/react";
import {Time} from "@internationalized/date";
import useCreateRaidStore from "@/app/calendar/new/Components/useCreateRaidStore";
import moment from "moment";
import {useShallow} from "zustand/shallow";

export default function TimeManager() {
    const {
        raid,
        setStartTime,
        setEndTime,
        endTime,
        startTime
    } = useCreateRaidStore(useShallow((state) => ({
        raid: state.raid,
        setStartTime: state.setStartTime,
        setEndTime: state.setEndTime,
        endTime: state.endTime,
        startTime: state.startTime
    })));

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
