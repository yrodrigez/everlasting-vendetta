'use client'
import {DatePicker} from "@nextui-org/react";
import {getLocalTimeZone, today, CalendarDate as InterCalendar} from "@internationalized/date";
import useCreateRaidStore from "@/app/calendar/new/Components/useCreateRaidStore";

export default function StartDate() {
    const {startDate, setStartDate, raid} = useCreateRaidStore(state => state)
    return (
        <DatePicker
            classNames={{
                calendar: 'bg-dark',
                calendarContent: 'text-default',
            }}
            value={startDate && new InterCalendar(startDate.getFullYear(), startDate.getMonth() + 1, startDate.getDate())}
            onChange={(date) => {
                const datedDate = date ? date.toDate('Europe/Madrid') : new InterCalendar(startDate.getFullYear(), startDate.getMonth() + 1, startDate.getDate()).toDate('Europe/Madrid')
                const current = new Date()
                current.setHours(0, 0, 0, 0)
                if (datedDate.getTime() < current.getTime()) return

                setStartDate(
                    datedDate
                )
            }}
            isDisabled={!raid}
            defaultValue={today(getLocalTimeZone())}
            minValue={today(getLocalTimeZone())}
            label="Raid date" className="max-w-[400px]"/>

    )
}
