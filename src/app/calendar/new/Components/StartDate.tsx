'use client'
import {DatePicker} from "@heroui/react";
import {
	getLocalTimeZone,
	today,
	CalendarDate as InterCalendar
} from "@internationalized/date";
import useCreateRaidStore from "@/app/calendar/new/Components/useCreateRaidStore";
import {useShallow} from "zustand/shallow";

export default function StartDate() {
	const {startDate, setStartDate, raid} = useCreateRaidStore(useShallow(state => ({
		startDate: state.startDate,
		setStartDate: state.setStartDate,
		raid: state.raid
	})))
	return (
		<DatePicker
			classNames={{
				calendar: 'bg-dark',
				calendarContent: 'text-default',
			}}
			// @ts-ignore - value is not in the DatePickerProps
			value={startDate && new InterCalendar(startDate.getFullYear(), startDate.getMonth() + 1, startDate.getDate())}
			onChange={(date) => {
				// @ts-ignore - value is not in the DatePickerProps
				const datedDate = date ? date.toDate('Europe/Madrid') : new InterCalendar(startDate.getFullYear(), startDate.getMonth() + 1, startDate.getDate()).toDate('Europe/Madrid')
				const current = new Date()
				current.setHours(0, 0, 0, 0)
				if (datedDate.getTime() < current.getTime()) return

				setStartDate(
					datedDate
				)
			}}
			isDisabled={!raid}
			// @ts-ignore - value is not in the DatePickerProps
			defaultValue={today(getLocalTimeZone())}
			minValue={today(getLocalTimeZone())}
			label="Raid date" className="max-w-[400px]"/>
	)
}
