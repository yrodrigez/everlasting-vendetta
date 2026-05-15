'use client'
import { Tooltip, useDisclosure } from "@heroui/react";
import moment from "moment/moment";
import Link from "next/link";
import { useState } from "react";



export function AttendanceHeatmap({ attendance }: {
	attendance: {
		id: string,
		raid_name: string,
		raid_date: string,
		participated: boolean,
	}[]
}) {
	const { onOpen, isOpen, onClose } = useDisclosure()
	const [selected, setSelected] = useState<string | null>(null)

	return (
		<div
			className={'w-full max-h-full min-h-0 p-8 rounded border border-wood-100 flex flex-wrap content-start bg-wood overflow-auto scrollbar-pill'}>
			{attendance?.map((raid, i) => {
				const currentRaidWeekDate = moment(raid.raid_date).startOf('week').add(1, 'day') // Start of week is Sunday, we want Monday
				const previousRaidWeekDate = i > 0 ? moment(attendance[i - 1].raid_date).startOf('week').add(1, 'day') : null
				const isNewSaveWeek = previousRaidWeekDate ? !currentRaidWeekDate.isSame(previousRaidWeekDate) : false
				const isLastRaid = i === attendance.length - 1

				return (
					<div key={raid.id} className={`${isNewSaveWeek || i === 0 ? 'pl-2 border-l border-wood-100' : ''} py-1.5 border-y border-wood-100 pr-2 mt-2 ${isLastRaid ? 'border-r border-wood-100' : ''}`}>
						<div
							className={`flex border ${raid.participated ? 'bg-moss border-moss-100' : 'bg-wood-900 border-wood-100 '} w-8 h-8 rounded-lg shadow cursor-pointer shadow-wood-900`}
							onClick={() => {
								setSelected(raid.id)
								isOpen && selected === raid.id ? onClose() : onOpen()
							}}
						>
							<Tooltip
								isOpen={selected === raid.id && isOpen}
								className="border border-wood-100"
								content={<div
									className="flex flex-col gap-2 p-2">
									<span className="text-gold font-bold text-lg">{raid.raid_name}</span>
									<span className="text-muted">{moment(raid.raid_date).format('ddd, YYYY-MM-DD')}</span>
									<Link href={`/raid/${raid.id}`} className="py-1 px-2 text-center text-gold font-bold bg-moss border border-moss-100 rounded-md hover:opacity-80 transition-all duration-300">View</Link>
								</div>}
								showArrow
								placement={'top'}
							>
								<div className="w-full h-full" />
							</Tooltip>
						</div>
					</div>
				)
			})}
		</div>
	)
}
