'use client'
import useCreateRaidStore from "@/app/calendar/new/Components/useCreateRaidStore";
import {RaidResetCard} from "@/app/calendar/components/RaidResetCard";
import moment from "moment";
import {RangeCalendar} from "@heroui/calendar";
import {CalendarDate as InterCalendar} from "@internationalized/date";
import {Tooltip} from "@heroui/react";

export function RaidCard() {

	const {
		raid,
		startDate,
		endDate,
		startTime,
		endTime,
	} = useCreateRaidStore(state => state)

	if (!raid) return null
	return (
		<div className="flex flex-col gap-2 items-center">
			<RaidResetCard
				raidImage={`/${raid.image}`}
				raidName={raid.name}
				raidDate={moment(startDate).format('YYYY-MM-DD') ?? moment().format('YYYY-MM-DD')}
				raidEndDate={moment(endDate).format('YYYY-MM-DD') ?? moment().add(7, 'days').format('YYYY-MM-DD')}
				raidTime={startTime ? startTime : '20:30'}
				raidRegistrations={[]}
				endTime={endTime}
			/>

			<div className={'flex flex-col'}>
				<span className={'text-default'}>Raid will be available from to:</span>
				<Tooltip
					content="This cant be modified change it in the controls above"
					showArrow
				>
					<RangeCalendar
						className={'bg-dark text-default'}
						classNames={{
							cellButton: 'text-default',
							title: 'text-default',
							gridHeaderCell: 'text-default',
							pickerWrapper: 'bg-dark',
						}}
						aria-label="Raid date"
						isReadOnly
						value={(startDate && endDate) ? {
							start: new InterCalendar(startDate.getFullYear(), startDate.getMonth() + 1, startDate.getDate()),
							end: new InterCalendar(endDate.getFullYear(), endDate.getMonth() + 1, endDate.getDate())
						} : null}
					/>
				</Tooltip>
			</div>

		</div>
	)
}
