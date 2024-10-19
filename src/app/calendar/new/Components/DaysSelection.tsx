'use client'
import {Button} from "@/app/components/Button";
import React, {useCallback, useEffect} from "react";
import {CheckIcon} from "@/app/raid/components/AssistActions";
import useCreateRaidStore, {type Day} from "@/app/calendar/new/Components/useCreateRaidStore";
import useScreenSize from "@/app/hooks/useScreenSize";
import moment from "moment-timezone";


export function DaysSelection() {
    const availableDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun',] as Day[]
    const {raid, days: selectedDays = [], setDays, startDate, setEndDate} = useCreateRaidStore(state => state)
    const {isMobile} = useScreenSize()

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


    const addDay = useCallback((day: Day) => {
        setDays([...selectedDays, day])
    }, [selectedDays, calculateEndDate])

    const removeDay = useCallback((day: Day) => {
        setDays(selectedDays.filter(d => d !== day))
    }, [selectedDays, calculateEndDate])

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

    return (
        <div
            className={
                'grid gap-2 grid-cols-7 border-2 border-transparent rounded-lg p-1'
                + ` ${selectedDays?.length === 0 ? ' border-red-500' : ''}`
            }
        >
            {availableDays.map(day => {
                return <Button
                    isDisabled={!startDate || !raid}
                    key={day}
                    isIconOnly={isMobile}
                    className={
                        'bg-red-400/80 text-red-800 rounded-full border border-red-900'
                        + ` ${selectedDays?.indexOf(day) !== -1 ? 'bg-green-500/80 text-green-900 border-green-900' : ''}`
                    }
                    onClick={() => {
                        if (selectedDays?.indexOf(day) !== -1) {
                            removeDay(day)
                        } else {
                            addDay(day)
                        }
                    }}
                    endContent={
                        isMobile || selectedDays?.indexOf(day) === -1 ? null : <CheckIcon/>
                    }
                >{day}
                </Button>
            })}
        </div>
    )
}
