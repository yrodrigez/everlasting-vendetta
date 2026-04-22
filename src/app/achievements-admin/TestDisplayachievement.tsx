'use client'
import {Achievement} from "@/types/Achievements";
import {Button} from "@/components/Button";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faDisplay} from "@fortawesome/free-solid-svg-icons";
import {displayAchievement} from '@/hooks/useAchievements';

export function TestDisplayAchievement({achievement}: { achievement: Achievement }) {
	return (
		<Button
			size="sm"
			onPress={() => {
				displayAchievement(achievement)
			}}
			type="button"
			isIconOnly
			aria-label={`Test display achievement ${achievement.name}`}
			className={'bg-blue-600 border border-blue-500 text-white'}
		>
			<FontAwesomeIcon icon={faDisplay} />
		</Button>
	)
}
