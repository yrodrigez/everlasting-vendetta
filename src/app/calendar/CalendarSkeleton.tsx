'use client'

import { DpsIcon } from "@/app/raid/components/KpisView";
import { faHeart, faShield } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Skeleton } from "@heroui/react";

const MAX_RAID_RESETS = 9

export function RaidCardSkeleton() {
	return (
		<div
			className="w-[300px] relative text-default bg-[#24201d] min-h-561 flex flex-col gap-4 border border-wood-100 h-[256px] rounded-md backdrop-blur p-3 justify-between">
			<div className="flex flex-col items-center justify-center gap-2">
				<Skeleton className="rounded-lg h-4 w-48 bg-wood border border-wood-100"/>
				<Skeleton className="rounded-lg h-3 w-64 bg-wood border border-wood-100"/>
			</div>
			<div className="py-1  flex flex-col gap-2 justify-center">
				<Skeleton  className="rounded-lg h-2 w-24 bg-wood border border-wood-100"/>
				<Skeleton className="rounded-lg h-2 w-16 bg-wood border border-wood-100"/>
				<div className="grid grid-cols-2 w-14">
					<FontAwesomeIcon className="text-wood" icon={faShield}/>
					<Skeleton className="rounded-lg w-3 h-3 bg-wood border border-wood-100"/>

					<FontAwesomeIcon className="text-wood" icon={faHeart}/>
					<Skeleton className="rounded-lg w-3 h-3 bg-wood border border-wood-100"/>

					<DpsIcon  className="w-4 h-4 text-wood"/>
					<Skeleton className="rounded-lg w-3 h-3 bg-wood border border-wood-100"/>
				</div>
			</div>
			<div className=" px-6 ">
				<Skeleton
					classNames={{
						content:'from-wood ',
						base:'from-wood'
					}}
					className="rounded-lg h-10 w-full bg-wood border border-wood-100"/>
			</div>
		</div>
	)
}

export function CalendarSkeleton() {
	return <div className="flex gap-3 flex-col justify-center items-center md:flex-wrap md:flex-row w-full">
		{Array.from({length: MAX_RAID_RESETS}).map((_, i) => (
			<RaidCardSkeleton key={i}/>
		))}
	</div>
}
