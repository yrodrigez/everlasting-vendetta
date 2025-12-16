'use client'
import { Button } from "@/app/components/Button";
import React, { useCallback, useEffect } from "react";
import { CheckIcon } from "@/app/raid/components/AssistActions";
import useCreateRaidStore, { type Day } from "@/app/calendar/new/Components/useCreateRaidStore";
import useScreenSize from "@/app/hooks/useScreenSize";
import moment from "moment-timezone";
import { useShallow } from "zustand/shallow";


export function DaysSelection() {

    const { days: selectedDays = [], setDays, startDate, setEndDate } = useCreateRaidStore(useShallow(state => ({
        raid: state.raid,
        days: state.days,
        setDays: state.setDays,
        startDate: state.startDate,
        setEndDate: state.setEndDate
    })))

    const calculateEndDate = useCallback(() => {
        let currentDate = moment(startDate);
        let eventsScheduled = 0;
        const totalEvents = selectedDays.length;

        while (eventsScheduled < totalEvents) {
            const currentWeekDay = currentDate.format('ddd') as Day;
            if (selectedDays.includes(currentWeekDay)) {
                eventsScheduled++;
            }
            if (eventsScheduled < totalEvents) {
                currentDate.add(1, 'day');
            }
        }
        setEndDate(currentDate.toDate());
    }, [selectedDays, startDate, setEndDate])

    useEffect(() => {
        calculateEndDate()
    }, [selectedDays, startDate]);

    useEffect(() => {
        if (startDate) {
            setEndDate(moment(startDate).add(selectedDays.length, 'days').toDate())
        }

        const weekDay = moment(startDate).format('ddd') as Day
        if (!selectedDays.includes(weekDay)) setDays([weekDay])
        calculateEndDate()
    }, [startDate])

    return (null)
}
