'use client'
import {Tooltip} from "@nextui-org/react"
import RaidTimeInfo from "@/app/raid/components/RaidTimeInfo";
import {useRouter} from "next/navigation";
import {KpisView} from "@/app/raid/components/KpisView";
import {useParticipants} from "@/app/raid/components/useParticipants";
import moment from "moment";
import {
	faCircleCheck,
	faCircleQuestion,
	faCircleXmark,
	faClock,
	faEdit,
	faPowerOff
} from "@fortawesome/free-solid-svg-icons";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {Button} from "@/app/components/Button";
import {useCallback, useEffect, useState} from "react";
import {useSession} from "@hooks/useSession";

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
	                              status
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
	status?: 'online' | 'offline'
}) {
	const router = useRouter()
	const participants = id ? useParticipants(id, raidRegistrations) : []
	const isRaidCurrent = moment().isBetween(moment(raidDate), moment(raidEndDate))
	const isToday = moment().format('YYYY-MM-DD') === moment(raidDate).format('YYYY-MM-DD')
	const isRaidPast = moment().isAfter(moment(`${raidEndDate}T${endTime}`))
	const {supabase} = useSession()
	const [borderColor, setBorderColor] = useState<any>()
	const [shadeColor, setShadeColor] = useState<any>()
	const [accentColor, setAccentColor] = useState<any>()
	const [accentBorderColor, setAccentBorderColor] = useState<any>()
	const [buttonTextColor, setButtonTextColor] = useState<any>()

	const registrationStatusIcon = useCallback((registrationStatus: string) => {
		if (registrationStatus === 'confirmed') {
			return <FontAwesomeIcon icon={faCircleCheck} className="text-success"/>
		}

		if (registrationStatus === 'declined') {
			return <FontAwesomeIcon icon={faCircleXmark} className="text-danger"/>
		}

		if (registrationStatus === 'tentative') {
			return <FontAwesomeIcon icon={faCircleQuestion} className="text-secondary"/>
		}

		if (registrationStatus === 'late') {
			return <FontAwesomeIcon icon={faClock} className="text-warning"/>
		}

		return null
	}, [registrationStatus])

	const toggleStatus = useCallback(() => {
		supabase?.from('raid_resets').update({status: status === 'online' ? 'offline' : 'online'}).eq('id', id).then(() => {
			router.refresh()
		})
	}, [status, id, isEditable, supabase])

	useEffect(() => {
		// @ts-ignore
		if (!window.ColorThief) return
		const img = new Image();
		//img.crossOrigin = 'anonymous'; // Ensure CORS for external images
		img.src = raidImage;
		img.onload = () => {
			// @ts-ignore
			const colorThief = new window.ColorThief();
			const color = colorThief.getColor(img);
			setBorderColor(`rgb(${color.join(',')})`)
			const darkerShade = color.map((channel: any) => Math.max(channel - 30, 0));
			setShadeColor(`rgba(${darkerShade.join(',')}, 1)`)
		};
	}, [raidImage, isRaidPast]);

	return (
		<div
			className={`w-[300px] relative text-default min-h-64 flex flex-col p-3 rounded-md backdrop-blur backdrop-opacity-90 justify-between border transition-all duration-300 ${
				(isToday || isRaidCurrent) ? 'border-gold shadow-2xl shadow-gold glow-animation ' : 'border-wood-100'
			}`}
			style={{
				...((!isRaidPast && borderColor) ? {borderColor} : {}),
				...((!isRaidPast && shadeColor) ? {boxShadow: `
					0 10px 15px -3px ${shadeColor},
                    0 4px 6px -4px ${shadeColor}
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
				className={`w-full h-full rounded-md absolute top-0 left-0 -z-10 ${isRaidPast || status === 'offline' ? 'grayscale' : ''}`}>
				<div className="w-full h-full bg-[rgba(0,0,0,.6)] rounded-md"/>
			</div>
			<div className="flex flex-col  shadow-xl ">
				<h4 className="font-bold text-large text-gold">{raidName}{status === 'offline' ? ' (Cancelled)' : ''}</h4>
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
                  raidInProgress={moment().isBetween(moment(raidDate), moment(raidDate).add(1, 'days'))}
                />}
				{modifiedBy && <Tooltip
                  isDisabled={!lastModified}
                  content={lastModified && `Last modified: ${moment(lastModified).format('dddd, MMMM D, YYYY - HH:mm:ss')}`}>
                  <small className="text-primary absolute bottom-1 right-4 select-none">By: {modifiedBy}</small>
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
							<FontAwesomeIcon icon={faPowerOff}/>
						</Button>
						{status === 'offline' ? null : (<Button
							isIconOnly
							className={`bg-wood border border-wood-100 text-stone-100`}
							onPress={() => {
								router.push(`/calendar/${id}/edit`)
							}}
						>
							<FontAwesomeIcon icon={faEdit}/>
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
