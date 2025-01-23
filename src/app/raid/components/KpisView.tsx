'use client'
import {
	faCircleCheck,
	faCircleQuestion,
	faCircleXmark,
	faClock,
	faHeart,
	faShield
} from "@fortawesome/free-solid-svg-icons";
import React, {useMemo, useState} from "react";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import moment from "moment";
import {useParticipants} from "@/app/raid/components/useParticipants";
import {type RaidParticipant} from "@/app/raid/api/types";
import {Tooltip} from "@nextui-org/react";


export const DpsIcon = ({className}: { className: string }) => <svg className={className}
                                                                    xmlns="http://www.w3.org/2000/svg"
                                                                    fill="currentColor"
                                                                    viewBox="0 0 512 512">
	<path
		d="M400 16L166.6 249.4l96 96L496 112 512 0 400 16zM0 416l96 96 32-32-16-32 56-56 88 56 32-32L96 224 64 256l56 88L64 400 32 384 0 416z"/>
</svg>

export function KpisView({participants, raidId, raidInProgress}: {
	participants: RaidParticipant[],
	raidId: string,
	raidInProgress: boolean
}) {
	const [currentDay] = useState(['Wed', 'Thu', 'Fri', 'Sat', 'Sun', 'Mon', 'Tue'].find(day => moment().format('ddd') === day) ?? '')

	const rtParticipants = useParticipants(raidId, participants)

	function findRoleAndDay(_participant: any, role: string, day: string) {
		return _participant?.is_confirmed && _participant?.details?.role.indexOf(role) !== -1
	}

	function findConfirmedByRole(role: string, _participants: RaidParticipant[], day: string) {
		return _participants.reduce((acc, participant) => {
			if (!participant?.is_confirmed) return acc
			const {count, osCount} = acc
			const hasOs = participant?.details?.role.indexOf('-') !== -1 && participant?.details?.role.indexOf(role) !== -1

			const toAdd = (+(participant?.is_confirmed && !!findRoleAndDay(participant, role, day))) * (hasOs ? 0.5 : 1)
			return {
				count: count + toAdd,
				osCount: hasOs ? osCount + 1 : osCount
			}
		}, {count: 0, osCount: 0})
	}

	const {confirmed, late, tentative, declined} = useMemo(() => {
		return rtParticipants.reduce((acc, participant) => {
			if (participant.details.status === 'confirmed') {
				acc.confirmed++
			} else if (participant.details.status === 'late') {
				acc.late++
			} else if (participant.details.status === 'tentative') {
				acc.tentative++
			} else if (participant.details.status === 'declined') {
				acc.declined++
			}
			return acc
		}, {confirmed: 0, late: 0, tentative: 0, declined: 0})
	}, [rtParticipants])

	const {totalDps, totalHealer, totalTank, osHealer, osTank, osDps} = useMemo(() => {

		const {count: totalDps, osCount: osDps} = findConfirmedByRole('dps', rtParticipants, currentDay)
		const {count: totalHealer, osCount: osHealer} = findConfirmedByRole('healer', rtParticipants, currentDay)
		const {count: totalTank, osCount: osTank} = findConfirmedByRole('tank', rtParticipants, currentDay)

		return {
			totalDps: Math.floor(totalDps),
			totalHealer: Math.floor(totalHealer),
			totalTank: Math.floor(totalTank),
			osHealer,
			osTank,
			osDps
		}
	}, [rtParticipants, currentDay, raidId])

	return (
		<div className="flex flex-col gap-1 text-sm">
			<div className="flex flex-col">
				<div className="flex gap-3 transition-all duration-300 py-1 rounded-full w-fit">
					<span className="text-success">
						<FontAwesomeIcon icon={faCircleCheck}/> {confirmed}
			        </span>
					<span className="text-warning">
			            <FontAwesomeIcon icon={faClock}/> {late}
					</span>
					<span className="text-relic">
						<FontAwesomeIcon icon={faCircleQuestion}/> {tentative}
					</span>
					<span className="text-danger">
						<FontAwesomeIcon icon={faCircleXmark}/> {declined}
					</span>
				</div>
			</div>
			<div className="grid grid-cols-1 gap-1 w-24">
				<div className="flex items-center justify-center">
					<FontAwesomeIcon icon={faShield} className="mr-1"/>
					<span className="w-5 flex justify-end">{totalTank}</span>
					{osTank > 0 ? <span className="w-14 text-xs text-gray-500 ml-1">(OS: {osTank})</span> :
						<div className="w-14 ml-1"/>}
				</div>
				<div className="flex items-center justify-center">
					<FontAwesomeIcon icon={faHeart} className="mr-1"/>
					<span className="w-5 flex justify-end">{totalHealer}</span>
					{osHealer > 0 ? <span className="w-14 text-xs text-gray-500 ml-1">(OS: {osHealer})</span> :
						<div className="w-14 ml-1"/>}
				</div>
				<div className="flex items-center justify-center">
					<DpsIcon className="w-4 h-4 mr-1"/>
					<span className="w-5 flex justify-end">{totalDps}</span>
					{osDps > 0 ? <span className="w-14 text-xs text-gray-500 ml-1">(OS: {osDps})</span> :
						<div className="w-14 ml-1"/>}
				</div>
			</div>
		</div>
	)
}
