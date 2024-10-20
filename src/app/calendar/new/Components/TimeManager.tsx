'use client'
import { TimeInput } from "@nextui-org/react";
import { Time } from "@internationalized/date";
import useCreateRaidStore from "@/app/calendar/new/Components/useCreateRaidStore";
import moment, {Moment} from "moment";
import {useCallback} from "react";

export default function TimeManager() {
    const {
        raid,
        setStartTime,
        setEndTime,
        startTime,
        endTime,
        endDate,
        setEndDate,
        startDate
    } = useCreateRaidStore((state) => state);

    // Parse startTime and endTime strings into Time objects
    const timeStart = new Time(
        parseInt(startTime.substring(0, 2)),
        parseInt(startTime.substring(3, 5))
    );
    const timeEnd = new Time(
        parseInt(endTime.substring(0, 2)),
        parseInt(endTime.substring(3, 5))
    );

    // Function to handle start time changes
    const handleStartTimeChange = useCallback((time: Time) => {

        const newStartTimeStr = moment(time).format("HH:mm");
        setStartTime(newStartTimeStr);

        // Parse times for comparison
        const startTimeMoment = moment(newStartTimeStr, "HH:mm");
        const endTimeMoment = moment(endTime, "HH:mm");

        // Update endDate if necessary
        updateEndDate(startTimeMoment, endTimeMoment);
    }, [endTime, setStartTime, startTime]);

    // Function to handle end time changes
    const handleEndTimeChange = useCallback((time: Time) => {
        const newEndTimeStr = moment(time).format("HH:mm");
        setEndTime(newEndTimeStr);

        // Parse times for comparison
        const startTimeMoment = moment(startTime, "HH:mm");
        const endTimeMoment = moment(newEndTimeStr, "HH:mm");

        // Update endDate if necessary
        updateEndDate(startTimeMoment, endTimeMoment);
    }, [endTime, setEndTime, startTime]);

    // Function to update endDate based on time comparison
    const updateEndDate = useCallback((startTimeMoment: Moment, endTimeMoment: Moment) => {
        if (
            endTimeMoment.isBefore(startTimeMoment) &&
            moment(endDate).isSameOrBefore(startDate, "day")
        ) {
            // Increment endDate by one day
            setEndDate(moment(startDate).add(1, "day").toDate());
        } else if (
            endTimeMoment.isSameOrAfter(startTimeMoment) &&
            moment(endDate).diff(moment(startDate), "days") === 1 &&
            startDate
        ) {
            // Revert endDate back to startDate
            setEndDate(startDate);
        }
    }, [endDate, setEndDate, startDate]);

    return (
        <div className="flex flex-col gap-2 min-w-32">
            <TimeInput
                className="max-w-[400px]"
                isDisabled={!raid}
                hourCycle={24}
                value={timeStart}
                onChange={handleStartTimeChange}
                label="Start Time"
                defaultValue={new Time(20, 30)}
            />
            <TimeInput
                className="max-w-[400px]"
                isDisabled={!raid}
                hourCycle={24}
                value={timeEnd}
                onChange={handleEndTimeChange}
                label="End Time"
                defaultValue={new Time(0, 0)}
            />
            {moment(endDate)
                .set({ hour: timeEnd.hour, minute: timeEnd.minute })
                .format("YYYY-MM-DD HH:mm")}
        </div>
    );
}
