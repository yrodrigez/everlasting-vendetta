'use client'
import useAchievements from "@hooks/useAchievements";
import {Achievement} from "@/app/types/Achievements";
import moment from "moment";
import {ScrollShadow} from "@nextui-org/react";
import {useSession} from "@hooks/useSession";
import {useQuery} from "@tanstack/react-query";
import NotLoggedInView from "@/app/components/NotLoggedInView";

function AchievementCard({achievement, isAchieved}: { achievement: Achievement,isAchieved: boolean }) {
	return (
		<div className={`bg-wood border border-wood-100 p-4 w-48 h-56 rounded-xl ${isAchieved ? 'shadow shadow-gold border-gold': ''} flex flex-col items-center justify-center relative mt-6`}>
			<img
				src={achievement.img}
				alt={achievement.name}
				className={`w-20 h-20 rounded-full ${isAchieved ? '': 'grayscale'} absolute -top-8 left-18`}
			/>
			<div className="w-full mt-10">
				<span className="text-gold font-bold text-lg ">{achievement.name}</span>
			</div>
			<div className="w-full h-full overflow-auto scrollbar-pill">
				<span className="text-stone-100 text-sm">{achievement.description}</span>
			</div>
			<div>
				<span className="text-stone-100 text-xs">{achievement.points} points</span>
			</div>
			{isAchieved && !!achievement?.earned_at && (
				<div>
					<span className="text-stone-100 text-xs">On: {moment(achievement.earned_at).format('YY-MM-DD')}</span>
				</div>
			)}
		</div>
	)
}

export default function ({characterId}: { characterId: number }) {
	const {supabase} = useSession()
	const {achievements} = useAchievements()
	const {data: {achieved, notAchieved}} = useQuery({
		queryKey: ['achievements', characterId],
		queryFn: async () => {
			if(!supabase) return {achieved: [], notAchieved: achievements}
			const {data} = await supabase.from('member_achievements').select('*').eq('member_id', characterId)

			console.log(data)

			const achieved = achievements?.filter((ach) => data?.find((a) => a.achievement_id === ach.id)).map((ach) => ({...ach, earned_at: data?.find((a) => a.achievement_id === ach.id)?.earned_at ?? null}))
			const notAchieved = achievements?.filter((ach) => !data?.find((a) => a.achievement_id === ach.id))

			console.log(achieved, notAchieved)

			return {
				achieved,
				notAchieved
			}
		},
		initialData: {achieved: [], notAchieved: achievements},
		enabled: !!supabase && !!achievements && !!characterId
	})

	if(!supabase) {
		return <NotLoggedInView/>
	}

	return (
		<ScrollShadow className="p-4 w-full max-h-full overflow-auto scrollbar-pill items-center flex justify-center flex-wrap gap-4">
			{achieved?.map((achievement) => (
				<AchievementCard key={achievement.id} achievement={achievement} isAchieved/>
			))}
			{notAchieved?.map((achievement) => (
				<AchievementCard key={achievement.id} achievement={achievement} isAchieved={false}/>
			))}
		</ScrollShadow>
	)
}
