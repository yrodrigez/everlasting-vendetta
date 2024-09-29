'use client'
import {Calendar} from "@nextui-org/react";
import {getLocalTimeZone, today, toCalendar, CalendarDate as InterCalendar} from "@internationalized/date";
import useCreateRaidStore from "@/app/calendar/new/Components/useCreateRaidStore";

export default function StartDate() {
    const { startDate, setStartDate, raid } = useCreateRaidStore(state => state)
    return (
        <Calendar
            isDisabled={!raid}
            className={'bg-dark text-default'}
            classNames={{
                cellButton: 'text-default',
                pickerHighlight: 'bg-primary',
                title: 'text-default',
                gridHeaderCell: 'text-default',

            }}
            value={startDate && new InterCalendar(startDate.getFullYear(), startDate.getMonth()+1, startDate.getDate())}
            onChange={(date) => {
                setStartDate(
                    date.toDate('Europe/Madrid')
                )
            }}
            aria-label="Date (Min Date Value)"
            defaultValue={today(getLocalTimeZone())}
            minValue={today(getLocalTimeZone())}
        />
    )
}
