'use client'
import {Tooltip, useDisclosure} from "@nextui-org/react";
import moment from "moment/moment";
import Link from "next/link";
import {useState} from "react";

export function AttendanceHeatmap({attendance}: {
	attendance: {
		id: string,
		raid_name: string,
		raid_date: string,
		participated: boolean,
	}[]
}) {
	const {onOpen, isOpen, onClose} = useDisclosure()
	const [selected, setSelected] = useState<string | null>(null)
	return (
		<div
			className={'w-full h-96  p-8 rounded border border-wood-100 flex flex-wrap gap-4 bg-wood overflow-auto scrollbar-pill'}>
			{attendance?.map((raid) => (
				<div key={raid.id}
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
							<span className="text-muted">{moment(raid.raid_date).format('YYYY-MM-DD')}</span>
							<Link href={`/raid/${raid.id}`} className="py-1 px-2 text-center text-gold font-bold bg-moss border border-moss-100 rounded-md hover:opacity-80 transition-all duration-300">View</Link>
						</div>}
						showArrow
						placement={'top'}
					>
						<div className="w-full h-full"/>
					</Tooltip>
				</div>
			))}
		</div>
	)
}
