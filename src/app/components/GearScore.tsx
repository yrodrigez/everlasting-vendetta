'use client'
import { faRotate, faTriangleExclamation, faWandMagic, faWandMagicSparkles } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Tooltip } from "@heroui/react";
import { useEffect, useState } from "react";
import { useGearScore } from "../hooks/api/use-gearscore";
import { GUILD_REALM_SLUG } from "../util/constants";

const ThreeDotsLoader = () => {
	const [dots, setDots] = useState('.');
	useEffect(() => {
		let intervalId: NodeJS.Timeout;
		intervalId = setInterval(() => {
			setDots((prev) => {
				return '.'.repeat((prev.toString().length % 3) + 1)
			})
		}, 300)

		return () => {
			clearInterval(intervalId)
		}
	}, [])
	return (
		<span>{dots}</span>
	);
};

export default function GearScore({ characterName, min, allowForce, realm }: {
	characterName: string,
	min?: number,
	allowForce?: boolean,
	realm?: string
}) {

	const { gearScore, isLoading, fetchGearScore } = useGearScore({ name: characterName, realm: realm || GUILD_REALM_SLUG });

	return (
		<div className="flex items-center gap-1 justify-between w-20">
			<span
				className={`text-${gearScore?.color} bg-${gearScore?.color}-900 px-2 py-1 text-xs rounded-full border font-bold border-${gearScore?.color} flex items-center ${allowForce ? 'justify-between gap-1 min-w-16 max-w-16' : 'justify-center min-w-14 max-w-14'}`}
			>{isLoading ? <ThreeDotsLoader /> : gearScore?.score ?? 0}
				{allowForce && <button
					onClick={fetchGearScore}
					className="text-xs"
					disabled={isLoading}
				>
					<FontAwesomeIcon icon={faRotate} className="text-xs"
						spin={isLoading}
					/>
				</button>}
			</span>
			{isLoading ? null : (min && (gearScore?.score ?? 0) < min) ? <Tooltip
				className="border border-wood-100"
				showArrow
				content={`Gear score is below ${min}!`}
				placement="top"
			>
				<FontAwesomeIcon icon={faTriangleExclamation} className="text-red-600" beat />
			</Tooltip> : (gearScore?.isFullEnchanted ? <Tooltip
				className="border border-wood-100"
				showArrow
				content={`All gear is enchanted!`}
				placement="top"
			>
				<FontAwesomeIcon icon={faWandMagicSparkles} className="text-green-600" />
			</Tooltip> : <Tooltip
				className="border border-wood-100"
				showArrow
				content={`Missing enchantments!`}
				placement="top"
			>
				<FontAwesomeIcon icon={faWandMagic} className="text-yellow-600" />
			</Tooltip>)}
		</div>
	)

}
