'use client'
import React, {useEffect, useState} from "react";
import {useMutation, useQuery} from "@tanstack/react-query";
import {Tooltip} from "@heroui/react";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faRotate, faTriangleExclamation, faWandMagic, faWandMagicSparkles} from "@fortawesome/free-solid-svg-icons";

export default function GearScore({characterName, min, allowForce, updater}: {
	characterName: string,
	min?: number,
	allowForce?: boolean
	updater?: (gs: number, characterName: string) => void
}) {

	const queryKey = ['gearScore', characterName]
	const [stateGs, setStateGs] = useState<string | number>('.')
	const {data, isLoading, refetch} = useQuery<{
		gs: number | string;
		color: string;
		isFullEnchanted: boolean;
	} | {
		gs: any | string;
		color: any;
		isFullEnchanted?: boolean;
	}, Error, {
		gs: number | string;
		color: string;
		isFullEnchanted: boolean;
	} | {
		gs: any | string;
		color: any;
		isFullEnchanted?: boolean;
	}, string[]>({
		queryKey: queryKey,
		enabled: !!characterName,
		queryFn: async () => {
			if (!characterName) return {gs: 0, color: 'gray', isFullEnchanted: true};

			const response = await fetch(`/api/v1/services/member/character/${encodeURIComponent(characterName.toLowerCase())}/gs`)

			if (!response?.ok) return {gs: 0, color: 'gray', isFullEnchanted: true};

			try {
				const {gs, color, isFullEnchanted} = await response.json();
				return {gs, color, isFullEnchanted};
			} catch (e) {
				console.error('Error parsing response', e);
				return {gs: 0, color: 'gray', isFullEnchanted: true};
			}
		},
		placeholderData: {gs: '...', color: 'gray', isFullEnchanted: true},
		staleTime: 60000 * 5, // 2 minute
	})

	const {mutate, isPending} = useMutation({
		mutationKey: ['updateGearScore'],
		mutationFn: async () => {
			await fetch(`/api/v1/services/member/character/${encodeURIComponent(characterName.toLowerCase())}/gs?force=true`)
			await refetch()
		},
	})

	useEffect(() => {
		let intervalId: NodeJS.Timeout;
		if (isLoading || isPending || data?.gs === '...') {
			intervalId = setInterval(() => {
				setStateGs((prev) => {
					return '.'.repeat((prev.toString().length % 3) + 1)
				})
			}, 300)
		} else {
			setStateGs(data?.gs)
			if (updater) {
				updater(data?.gs, characterName)
			}
		}

		return () => {
			clearInterval(intervalId)
		}
	}, [isPending, isLoading, data])

	return (
		<div className="flex items-center gap-1 justify-between w-20">
            <span
	            className={`text-${data?.color} bg-${data?.color}-900 px-2 py-1 text-xs rounded-full border font-bold border-${data?.color} flex items-center ${allowForce ? 'justify-between gap-1 min-w-16 max-w-16' : 'justify-center min-w-14 max-w-14'}`}
            >{stateGs}
	            {allowForce && <button
                  onClick={() => mutate()}
                  className="text-xs"
                  disabled={isPending || isLoading}
                >
                  <FontAwesomeIcon icon={faRotate} className="text-xs"
                                   spin={isPending}
                  />
                </button>}
                </span>
			{isLoading ? null : (min && data?.gs < min) ? <Tooltip
				className="border border-wood-100"
				showArrow
				content={`Gear score is below ${min}!`}
				placement="top"
			>
				<FontAwesomeIcon icon={faTriangleExclamation} className="text-red-600" beat/>
			</Tooltip> : (data?.isFullEnchanted ? <Tooltip
				className="border border-wood-100"
				showArrow
				content={`All gear is enchanted!`}
				placement="top"
			>
				<FontAwesomeIcon icon={faWandMagicSparkles} className="text-green-600"/>
			</Tooltip> : <Tooltip
				className="border border-wood-100"
				showArrow
				content={`Missing enchantments!`}
				placement="top"
			>
				<FontAwesomeIcon icon={faWandMagic} className="text-yellow-600"/>
			</Tooltip>)}
		</div>
	)

}
