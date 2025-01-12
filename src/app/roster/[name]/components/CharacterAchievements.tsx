'use client'
import {Achievement} from "@/app/types/Achievements";
import moment from "moment";
import {ScrollShadow} from "@nextui-org/react";
import {useCallback, useMemo} from "react";
import {useMessageBox} from "@utils/msgBox";
import {createBrowserClient} from "@supabase/ssr"
import {useQuery} from "@tanstack/react-query";
import Link from "next/link";


function AchievementInfo({achievement}: { achievement: Achievement }) {

	const supabase = createBrowserClient(
		process.env.NEXT_PUBLIC_SUPABASE_URL!,
		process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
	)

	const {data: earners, isLoading: loading} = useQuery({
		queryKey: ['achievement', achievement.id],
		queryFn: async () => {
			const {
				data,
				error
			} = await supabase.from('member_achievements').select('member:ev_member(character),*').eq('achievement_id', achievement.id)
			.order('earned_at', {ascending: true}).returns<{
				member: { character: { name: string, avatar: string, id: number} },
				earned_at: string
			}[]>()
			if (error || !data) {
				console.error('Error fetching achievement:', error)
				return []
			}
			return data ?? []
		},
		staleTime: 1000 * 60 * 30
	})
	return (
		<div
			className="flex w-full h-full flex-col lg:flex-row items-center justify-center lg:justfy-evenly gap-4 overflow-auto scrollbar-pill py-8">
			<div
				className="w-full h-full bg-dark rounded-xl border border-dark-100 p-6 flex items-center justify-center">
				<AchievementCard achievement={achievement} isAchieved={true}/>
			</div>
			<div className="w-full h-full flex flex-col gap-4 items-center justify-center">
				<h2 className="text-gold text-2xl font-bold">Earners</h2>
				<ScrollShadow
					className="w-full h-full flex flex-col gap-4 overflow-auto scrollbar-pill max-h-[600px] p-2">
					{loading && <span className="text-stone-100 text-lg">Loading...</span>}
					{!loading && earners?.length === 0 &&
                      <span className="text-stone-100 text-lg">No earners yet</span>}
					{!loading && earners?.map(({member: {character}, earned_at}) => (
						<Link key={character.id}
						      href={`/roster/${character.name}`}
						      className="w-full h-full flex flex-col gap-4 items-center justify-center border border-wood-100 p-4 hover:border-gold hover:shadow-gold hover:cursor-pointer">
							<div className="w-full h-full flex flex-col gap-2 items-center justify-center">
								<div
									className="w-full h-full min-w-48 flex items-center justify-center gap-4">
									<img
										src={character.avatar}
										alt={character.name}
										className="w-12 h-12 min-w-12 rounded-full"
									/>
									<span className="text-gold text-lg font-bold w-full">{character.name}</span>
								</div>
								<span
									className="text-stone-100 text-sm w-full">On: {moment(earned_at).format('YY-MM-DD')}</span>
							</div>
						</Link>
					))}
				</ScrollShadow>
			</div>
		</div>
	)
}


function AchievementWithAlert({achievement, isAchieved}: { achievement: Achievement, isAchieved: boolean }) {
	const {alert} = useMessageBox()
	const handleOnClick = useCallback(() => {
		alert({
			message: <AchievementInfo achievement={achievement}/>,
			type: 'window'
		})
	}, [isAchieved, alert, achievement])

	return <AchievementCard achievement={achievement} isAchieved={isAchieved} handleOnClick={handleOnClick}/>
}

function AchievementCard({achievement, isAchieved, handleOnClick}: {
	achievement: Achievement,
	isAchieved: boolean,
	handleOnClick?: () => void
}) {

	return (
		<div
			onClick={handleOnClick}
			className={`bg-wood border border-wood-100 p-4 min-w-48 min-h-64 max-w-48 max-h-64 rounded-xl ${isAchieved ? 'shadow shadow-gold border-gold' : ''} flex flex-col items-center justify-center relative mt-6 ${handleOnClick ? 'cursor-pointer' : ''}`}>
			<img
				src={achievement.img}
				alt={achievement.name}
				className={`w-20 h-20 rounded-full ${isAchieved ? '' : 'grayscale'} absolute -top-8 left-18`}
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
					<span
						className="text-stone-100 text-xs">On: {moment(achievement.earned_at).format('YY-MM-DD')}</span>
				</div>
			)}
		</div>
	)
}

export default function ({achieved, notAchieved, achievedPoints}: {
	achieved?: Achievement[],
	notAchieved?: Achievement[],
	achievedPoints?: number
}) {
	const userAchievements = useMemo(() => {
		if (!achieved || !notAchieved) return []
		const group = Object.groupBy([...achieved, ...notAchieved], ({category}) => category)
		return (Object.entries(group).map(([category, achievements]) => ({
			category, achievements: achievements?.sort((a: Achievement, b: Achievement) => {
				if (a.earned_at === undefined) return 1
				if (b.earned_at === undefined) return -1
				return new Date(b.earned_at).getTime() - new Date(a.earned_at).getTime()
			})
		})) ?? []) as {
			category: string,
			achievements: Achievement[]
		}[]
	}, [achieved, notAchieved])

	return (
		<div
			className="p-4 w-full h-full overflow-auto scrollbar-pill">
			{userAchievements?.map(({category, achievements}: { achievements: Achievement[], category: string }) => (
				<div key={category} className="flex flex-col gap-4 items-start justify-start mb-4">
					<h2 className="text-gold text-2xl font-bold">Category: <span
						className="capitalize">{category}</span></h2>
					<ScrollShadow orientation="horizontal"
					              className="flex overflow-auto w-full scrollbar-pill gap-4 items-center justify-start p-8 lg:flex-wrap">
						{achievements.map((achievement: Achievement) => {
							const isAchieved = achievement.earned_at !== undefined
							return (
								<AchievementWithAlert key={achievement.id} achievement={achievement}
								                      isAchieved={isAchieved}/>
							)
						})}
					</ScrollShadow>
				</div>
			))}
		</div>
	)
}
