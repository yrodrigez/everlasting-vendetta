'use client'
import { type RaidParticipant } from "@/app/raid/api/types";
import { useParticipants } from "@/app/raid/components/useParticipants";
import { Tooltip } from "@/components/tooltip";
import {
	faCircleCheck,
	faCircleQuestion,
	faCircleXmark,
	faClock,
	faHeart,
	faShield
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useMemo } from "react";
import { RaidComposition } from "../raid-priority-comparator";


export const DpsIcon = ({ className }: { className: string }) => <svg className={className}
	xmlns="http://www.w3.org/2000/svg"
	fill="currentColor"
	viewBox="0 0 512 512">
	<path
		d="M400 16L166.6 249.4l96 96L496 112 512 0 400 16zM0 416l96 96 32-32-16-32 56-56 88 56 32-32L96 224 64 256l56 88L64 400 32 384 0 416z" />
</svg>

export function KpisView({ participants, raidId, raidSize, composition }: {
	participants: RaidParticipant[],
	raidId: string,
	raidSize?: number | null
	composition?: RaidComposition
}) {

	const rtParticipants = useParticipants(raidId, participants)

	function findConfirmedByRole(role: string, _participants: RaidParticipant[]) {
		return _participants.reduce((acc, participant) => {
			if (!participant?.is_confirmed) return acc
			const roles = (participant?.details?.role ?? '').split('-').filter(Boolean)
			const isOnly = roles.length === 1 && roles[0] === role
			const isFlexible = roles.length > 1 && roles.includes(role)
			if (isFlexible) {
				const name = participant?.member?.character?.name
				if (name) acc.flexEntries.push({ name, roles })
			}
			return {
				count: acc.count + (isOnly ? 1 : 0),
				flexCount: acc.flexCount + (isFlexible ? 1 : 0),
				flexEntries: acc.flexEntries,
			}
		}, { count: 0, flexCount: 0, flexEntries: [] as { name: string; roles: string[] }[] })
	}

	const { confirmed, late, tentative, declined } = useMemo(() => {
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
		}, { confirmed: 0, late: 0, tentative: 0, declined: 0 })
	}, [rtParticipants])

	const { totalDps, totalHealer, totalTank, flexHealer, flexTank, flexDps, flexDpsEntries, flexHealerEntries, flexTankEntries } = useMemo(() => {

		const mDps = findConfirmedByRole('dps', rtParticipants)
		const rDps = findConfirmedByRole('rdps', rtParticipants)
		const healer = findConfirmedByRole('healer', rtParticipants)
		const tank = findConfirmedByRole('tank', rtParticipants)

		const dedupe = (entries: { name: string; roles: string[] }[]) => {
			const seen = new Map<string, { name: string; roles: string[] }>()
			entries.forEach(e => { if (!seen.has(e.name)) seen.set(e.name, e) })
			return Array.from(seen.values())
		}

		return {
			totalDps: mDps.count + rDps.count,
			flexDps: mDps.flexCount + rDps.flexCount,
			flexDpsEntries: dedupe([...mDps.flexEntries, ...rDps.flexEntries]),
			totalHealer: healer.count,
			totalTank: tank.count,
			flexHealer: healer.flexCount,
			flexHealerEntries: healer.flexEntries,
			flexTank: tank.flexCount,
			flexTankEntries: tank.flexEntries,
		}
	}, [rtParticipants, raidId])

	const roleLabels: Record<string, string> = { tank: 'Tank', healer: 'Healer', dps: 'Melee DPS', rdps: 'Ranged DPS' }
	const formatFlexTooltip = (entries: { name: string; roles: string[] }[]) => (
		<div className="flex flex-col gap-0.5 text-xs">
			{entries.map(e => (
				<div key={e.name}>
					<span className="font-semibold">{e.name}</span>
					<span className="text-gray-300"> — {e.roles.map(r => roleLabels[r] ?? r).join(', ')}</span>
				</div>
			))}
		</div>
	)

	return (
		<div className="flex flex-col gap-1 text-sm">
			<div className="flex flex-col">
				<div className="flex gap-3 transition-all duration-300 py-1 rounded-full w-fit">
					<span className="text-success">
						<FontAwesomeIcon icon={faCircleCheck} /> {confirmed}
					</span>
					<span className="text-warning">
						<FontAwesomeIcon icon={faClock} /> {late}
					</span>
					<span className="text-relic">
						<FontAwesomeIcon icon={faCircleQuestion} /> {tentative}
					</span>
					<span className="text-danger">
						<FontAwesomeIcon icon={faCircleXmark} /> {declined}
					</span>
				</div>
				{raidSize && raidSize > 0 ? (() => {
					console.log('Calculating fillPct with confirmed:', confirmed, 'raidSize:', raidSize)
					const maxScale = Math.max(confirmed, raidSize)
					const fillPct = maxScale > 0 ? (Math.min(confirmed, raidSize) / maxScale) * 100 : 0
					const overflowPct = confirmed > raidSize ? ((confirmed - raidSize) / maxScale) * 100 : 0
					const thresholdPct = (raidSize / maxScale) * 100
					return (
						<div className="flex items-center gap-1 mt-1 justify-normal" >
							<div
								className="relative h-1 w-full rounded-full bg-dark/80 overflow-hidden mt-1 border border-dark-100 grow-1"
								role="progressbar"
								aria-valuenow={confirmed}
								aria-valuemin={0}
								aria-valuemax={raidSize}
								title={`${confirmed} / ${raidSize} confirmed`}
							>
								<div className="absolute left-0 top-0 h-full bg-moss-100" style={{ width: `${fillPct}%` }} />
								{overflowPct > 0 && (
									<div
										className="absolute top-0 h-full bg-red-800"
										style={{ left: `${thresholdPct}%`, width: `${overflowPct}%` }}
									/>
								)}
								<Tooltip
									content={`${confirmed} / ${raidSize} confirmed`}
								>
									<div
										className="absolute top-0 h-full w-px bg-red-500"
										style={{ left: `${thresholdPct}%` }}
										title={`Raid size: ${raidSize}`}
									/>
								</Tooltip>
							</div>
							<span className="text-xs text-gray-300 whitespace-pre block">{`${confirmed} / ${raidSize}`}</span>
						</div>
					)
				})() : null}
			</div>
			<div className="grid grid-cols-1 gap-1 w-24">
				<div className="flex items-center justify-center">
					<FontAwesomeIcon icon={faShield} className="mr-1" />
					<span className="w-8 flex justify-end whitespace-pre">{totalTank}{composition?.tanks ? ` / ${composition.tanks}` : ''}</span>
					{flexTank > 0 ? (
						<Tooltip showArrow content={flexTankEntries.length > 0 ? formatFlexTooltip(flexTankEntries) : `${flexTank} flex player(s)`}>
							<span
								className="w-14 ml-1 text-[10px] text-gray-300 bg-dark/50 border border-dark-100/50 rounded-full px-1 text-center cursor-help"
							>
								+{flexTank} flex
							</span>
						</Tooltip>
					) : <div className="w-14 ml-1" />}
				</div>
				<div className="flex items-center justify-center">
					<FontAwesomeIcon icon={faHeart} className="mr-1" />
					<span className="w-10 flex justify-end whitespace-pre">{totalHealer}{composition?.healers ? ` / ${composition.healers}` : ''}</span>
					{flexHealer > 0 ? (
						<Tooltip showArrow content={flexHealerEntries.length > 0 ? formatFlexTooltip(flexHealerEntries) : `${flexHealer} flex player(s)`}>
							<span
								className="w-14 ml-1 text-[10px] text-gray-300 bg-dark/50 border border-dark-100/50 rounded-full px-1 text-center cursor-help"
							>
								+{flexHealer} flex
							</span>
						</Tooltip>
					) : <div className="w-14 ml-1" />}
				</div>
				<div className="flex items-center justify-center">
					<DpsIcon className="w-4 h-4 mr-1" />
					<span className="w-10 flex justify-end whitespace-pre">{totalDps}{composition?.dps ? ` / ${composition.dps}` : ''}</span>
					{flexDps > 0 ? (
						<Tooltip showArrow content={flexDpsEntries.length > 0 ? formatFlexTooltip(flexDpsEntries) : `${flexDps} flex player(s)`}>
							<span
								className="w-14 ml-1 text-[10px] text-gray-300 bg-dark/50 border border-dark-100/50 rounded-full px-1 text-center cursor-help"
							>
								+{flexDps} flex
							</span>
						</Tooltip>
					) : <div className="w-14 ml-1" />}
				</div>
			</div>
		</div>
	)
}
