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
				segment:'text-default/60 data-[editable=true]:text-default',
				inputWrapper: 'transition-all duration-200 bg-wood-900 border border-wood-100 text-default hover:border-wood-100 focus:border-wood-100 focus:ring-2 focus:ring-wood-100 hover:bg-wood data-[hover=true]:border-wood-100 focus-within:hover:ring-wood-100 focus-within:hover:bg-wood',                
                label: 'text-default/60 group-data-[filled="true"]:text-default/60',
                description: 'text-default',
				popoverContent: 'bg-wood-900 border border-wood-100 text-default',
			}}
			// @ts-ignore - value is not in the DatePickerProps
			value={startDate && new InterCalendar(startDate.getFullYear(), startDate.getMonth() + 1, startDate.getDate())}
			onChange={(date) => {
				// @ts-ignore - value is not in the DatePickerProps
				const datedDate = date ? date.toDate('Europe/Madrid') : new InterCalendar(startDate.getFullYear(), startDate.getMonth() + 1, startDate.getDate()).toDate('Europe/Madrid')
				const current = new Date()
				current.setHours(0, 0, 0, 0)
				if (datedDate.getTime() < current.getTime()) return

				setStartDate(datedDate)
			}}
			isDisabled={!raid}
			// @ts-ignore - value is not in the DatePickerProps
			defaultValue={today(getLocalTimeZone())}
			minValue={today(getLocalTimeZone())}
			label="Raid date" className="max-w-[400px]"/>
	)
}
