'use client'
import { Tooltip } from "@heroui/react"
import RaidTimeInfo from "@/app/raid/components/RaidTimeInfo";
import { useRouter } from "next/navigation";
import { KpisView } from "@/app/raid/components/KpisView";
import { useParticipants } from "@/app/raid/components/useParticipants";
import moment from "moment";
import {
	faCircleCheck,
	faCircleQuestion,
	faCircleXmark,
	faClock,
	faEdit,
	faPowerOff
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Button } from "@/components/Button";
import { useCallback, useEffect, useState } from "react";
import { useSupabase } from "@/context/SupabaseContext";
import { CharacterChip } from "@/components/character-chip";

export function RaidResetCard({
	raidDate,
	raidName,
	raidImage,
	raidTime = '20:30',
	id,
	raidRegistrations,
	raidEndDate,
	isEditable = false,
	modifiedBy,
	lastModified,
	endTime,
	registrationStatus,
	status,
	createdBy,
	size,
	createdByCharacter,
}: {
	id?: string,
	raidDate: string,
	raidName: string,
	raidImage: string,
	raidTime?: string,
	raidRegistrations: any[]
	raidEndDate: string
	isEditable?: boolean
	modifiedBy?: string
	lastModified?: string
	endTime: string
	registrationStatus?: string
	status?: 'online' | 'offline',
	createdBy?: string,
	size?: number,
	createdByCharacter?: { name: string, playable_class: { name: string, }, avatar?: string }
}) {
	const raidStart = moment(`${raidDate}T${raidTime}`);
	const raidEnd = moment(`${raidDate}T${endTime}`);
	const router = useRouter()
	const participants = id ? useParticipants(id, raidRegistrations) : []
	const isRaidCurrent = moment().isBetween(raidStart, raidEnd)
	const isToday = moment().format('YYYY-MM-DD') === raidStart.format('YYYY-MM-DD')
	const supabase = useSupabase();
	const [borderColor, setBorderColor] = useState<any>()
	const [shadeColor, setShadeColor] = useState<any>()
	const isExpired = moment().subtract(12, 'hours').isAfter(raidEnd)

	const registrationStatusIcon = useCallback((registrationStatus: string) => {
		if (registrationStatus === 'confirmed') {
			return <span
				className="text-success text-xs py-0.5 px-1 border border-success rounded-full z-50 bg-dark"
			><FontAwesomeIcon icon={faCircleCheck} /> Signed up</span>
		}

		if (registrationStatus === 'declined') {
			return <span className="text-danger text-xs py-0.5 px-1 border border-danger rounded-full z-50 bg-dark"><FontAwesomeIcon icon={faCircleXmark} /> Can't come</span>
		}

		if (registrationStatus === 'tentative') {
			return <span className="text-secondary text-xs py-0.5 px-1 border border-secondary rounded-full z-50 bg-dark"><FontAwesomeIcon icon={faCircleQuestion} /> Tentative</span>
		}

		if (registrationStatus === 'late') {
			return <span className="text-warning text-xs py-0.5 px-1 border border-warning rounded-full z-50 bg-dark"><FontAwesomeIcon icon={faClock} /> Late</span>
		}

		return null
	}, [registrationStatus])

	const toggleStatus = useCallback(() => {
		supabase?.from('raid_resets').update({ status: status === 'online' ? 'offline' : 'online' }).eq('id', id).then(() => {
			router.refresh()
		})
	}, [status, id, isEditable, supabase])

	useEffect(() => {
		// @ts-ignore
		if (!window.ColorThief) return
		const img = new Image();
		img.src = raidImage;
		img.onload = () => {
			// @ts-ignore
			const colorThief = new ColorThief();
			const color = colorThief.getColor(img);
			setBorderColor(`rgb(${color.join(',')})`)
			const darkerShade = color.map((channel: any) => Math.max(channel - 30, 0));
			setShadeColor(`rgba(${darkerShade.join(',')}, 1)`)
		};
	}, [raidImage]);

	return (
		<div
			className={`w-[300px] relative text-default h-64 3xl:min-h-64 flex flex-col p-3 rounded-md backdrop-blur backdrop-opacity-90 justify-between border transition-all duration-300 ${(isToday || isRaidCurrent) ? 'border-gold shadow-xl shadow-gold glow-animation ' : 'border-wood-100'
				}`}
			style={{
				...((borderColor && status !== 'offline' && (!isExpired)) ? { borderColor } : {}),
				...((shadeColor && status !== 'offline' && (!isExpired)) ? {
					boxShadow: `
					0 10px 15px 3px ${shadeColor},
                    0 4px 6px 4px ${shadeColor}
                    `
				} : {}),
			}}
		>
			<div
				style={{
					backgroundSize: 'cover',
					backgroundPosition: 'center',
					backgroundRepeat: 'no-repeat',
					backgroundImage: `url('${raidImage}')`,
				}}
				className={`w-full h-full rounded-md absolute top-0 left-0 -z-10 ${status === 'offline' || isExpired ? 'grayscale' : ''}`}>
				<div className="w-full h-full backdrop-brightness-50 backdrop-filter backdrop-blur-xs rounded-md" />
			</div>
			<div className="flex flex-col">
				<h4 className={`font-bold text-large text-gold`}>
					{raidName}
					{status === 'offline' ? (<span className="text-xs">&nbsp;(Cancelled)</span>) : null}
				</h4>

				<small
					className="text-primary">{moment(raidDate).format('dddd, MMMM D')} - {raidTime.substring(0, 5)} to {endTime?.substring(0, 5)}</small>
			</div>
			<div className="py-1 flex flex-col relative">
				<RaidTimeInfo
					raidEndDate={raidEndDate}
					raidDate={raidDate}
					raidTime={raidTime}
					raidEndTime={endTime}
				/>
				{id && <KpisView
					participants={participants || []}
					raidId={id}
					raidSize={size}
				/>}
				{modifiedBy && <Tooltip
					isDisabled={!lastModified}
					content={lastModified && `Last modified: ${moment(lastModified).format('dddd, MMMM D, YYYY - HH:mm:ss')}`}>
					{/* <small className="text-primary absolute bottom-1 right-4 select-none">By: {createdBy}</small> */}
					<div className="absolute bottom-1 right-2 flex items-center gap-1">
						By:
						<CharacterChip
							size="xs"
							name={createdByCharacter?.name || createdBy || 'Unknown'}
							realmSlug={createdByCharacter ? 'unknown' : 'unknown'}
							avatar={createdByCharacter?.avatar}
							className={createdByCharacter?.playable_class?.name || 'unknown'}
						/>
					</div>
				</Tooltip>}
			</div>
			<div className=" flex gap-1">
				{id && <Button
					onPress={() => {
						router.push(`/raid/${id}`)
					}}
					className="w-full bg-moss hover:bg-moss-600 text-gold font-bold"
				>
					Open
				</Button>}
				{isEditable && (
					<div
						className="flex gap-0.5"
					>
						<Button
							isIconOnly
							color={status === 'offline' ? 'success' : 'danger'}
							className={`rounded`}
							onPress={() => {
								toggleStatus()
							}}
						>
							<FontAwesomeIcon icon={faPowerOff} />
						</Button>
						{status === 'offline' ? null : (<Button
							isIconOnly
							className={`bg-wood border border-wood-100 text-stone-100`}
							onPress={() => {
								router.push(`/calendar/${id}/edit`)
							}}
						>
							<FontAwesomeIcon icon={faEdit} />
						</Button>)}
					</div>
				)}
			</div>

			{!!registrationStatus && <div className="absolute top-2 right-2 flex items-center gap-2 z-50">
				<Tooltip
					content={registrationStatus}
					className="text-default capitalize"
				>
					{registrationStatusIcon(registrationStatus)}
				</Tooltip>
			</div>}
		</div>
	);
}
