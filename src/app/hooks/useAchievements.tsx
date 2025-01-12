import {useSession} from "@hooks/useSession";
import {useQuery} from "@tanstack/react-query";
import {
	type Achievement,
	type AchievementCondition,
	type MemberAchievement,
	type TableCondition
} from "@/app/types/Achievements";
import {useEffect} from "react";
import {type SupabaseClient} from "@supabase/supabase-js";
import {type Character} from "@/app/components/characterStore";
import useToast from "@utils/useToast";
import mustache from "mustache";
import Image from "next/image";
import moment from "moment";


async function createQuery(supabase: SupabaseClient, table: string, conditions: TableCondition[], options: {
	operation?: 'select' | 'insert',
	select?: string,
	payload?: any,
} = {operation: 'select', select: '*'}) {

	let query = supabase.from(table)
	switch (options.operation) {
		case 'select':
			// @ts-ignore
			query = query.select(options.select)
			break
		case 'insert':
			// @ts-ignore
			query = query.insert(payload)
			break
		default:
			// @ts-ignore
			query = query.select('*')
	}

	conditions.forEach((condition: TableCondition) => {
		const {value, operator, column} = condition
		switch (operator) {
			case 'eq':
				// @ts-ignore
				query.eq(column, value)
				break
			case 'gt':
				// @ts-ignore
				query.gt(column, value)
				break
			case 'lt':
				// @ts-ignore
				query.lt(column, value)
				break
			case 'gte':
				// @ts-ignore
				query.gte(column, value)
				break
			case 'lte':
				// @ts-ignore
				query.lte(column, value)
				break
			case 'neq':
				// @ts-ignore
				query.neq(column, value)
				break
			case 'like':
				// @ts-ignore
				query.like(column, value as string)
				break
			case 'ilike':
				// @ts-ignore
				query.ilike(column, value as string)
				break
			case 'in':
				// @ts-ignore
				query.in(column, value as string[])
				break
			default:
				// @ts-ignore
				return query.eq
		}

	})

	return query
}

async function canAchieve(supabase: SupabaseClient, achievement: Achievement, selectedCharacter: Character): Promise<boolean> {
	try {
		const template = JSON.stringify(achievement.condition)

		const condition = JSON.parse(mustache.render(template, {
			...selectedCharacter,
			now: () => new Date().toISOString(),
			daysAgo: () => (text: string) => {
				const days = parseInt(text, 10) || 0;
				return new Date(
					Date.now() - days * 24 * 60 * 60 * 1000
				).toISOString();
			},
			hoursAgo : () => (text: string) => {
				const hours = parseInt(text, 10) || 0;
				return new Date(
					Date.now() - hours * 60 * 60 * 1000
				).toISOString();
			}
		})) as AchievementCondition

		const table = condition.table
		const select = condition.select
		const {conditions} = condition

		// @ts-ignore it creates a query based on the conditions
		const {data, error} = await createQuery(supabase, table, conditions, {
			select: select ?? '*',
			operation: 'select'
		})
		if (error) {
			console.error('Error fetching data:', error)
			return false
		}

		if (condition?.count && data?.length !== undefined) {
			const {countNumber, operator} = condition.count
			switch (operator) {
				case 'eq':
					return data.length === countNumber
				case 'gt':
					return data.length > countNumber
				case 'lt':
					return data.length < countNumber
				case 'gte':
					return data.length >= countNumber
				case 'lte':
					return data.length <= countNumber
				case 'neq':
					return data.length !== countNumber
				default:
					return false
			}

		}

		return (data && data.length && data[0])
	} catch (e) {
		console.error('Error processing condition:', e)
		return false
	}
}

export default function useAchievements() {
	const {supabase, selectedCharacter} = useSession()
	const {epic} = useToast()

	const {data: achievements, error, isLoading: loadingAchievements} = useQuery({
		queryKey: ['achievements', selectedCharacter?.id],
		queryFn: async () => {
			if (!supabase || !selectedCharacter) return {}

			const {data: achievements, error: achievementsError} = await supabase.from('achievements')
			.select('*')
			.returns<Achievement[]>()

			if (achievementsError) {
				console.error('Error fetching achievements:', achievementsError)
				return {}
			}
			const {
				data: memberAchievements,
				error: memberAchievementsError
			} = await supabase.from('member_achievements')
			.select('*')
			.eq('member_id', selectedCharacter.id)
			.returns<MemberAchievement[]>()

			if (memberAchievementsError) {
				console.error('Error fetching member achievements:', memberAchievementsError)
				return {}
			}

			return {
				achievements,
				memberAchievements,
				notAchieved: achievements.filter(achievement => !memberAchievements.find(memberAchievement => memberAchievement.achievement_id === achievement.id)),
				achieved: achievements.filter(achievement => memberAchievements.find(memberAchievement => memberAchievement.achievement_id === achievement.id)).map(
					achievement => {
						return {
							...achievement,
							earned_at: memberAchievements.find(memberAchievement => memberAchievement.achievement_id === achievement.id)?.earned_at
						}
					}
				)
			}
		},
		enabled: !!supabase && !!selectedCharacter,
		initialData: {}
	})

	useEffect(() => {
		const audio = new Audio('/sounds/AchievmentSound1.ogg')
		let isPlaying = false
		if (!achievements?.notAchieved?.length || !selectedCharacter || !supabase || loadingAchievements || error) return
		Promise.all(achievements.notAchieved.map(async achievement => {
			return {
				canAchieve: (await canAchieve(supabase, achievement, selectedCharacter)),
				achievement
			}
		})).then(async achievements => {
			const achievable = achievements.filter(({canAchieve}) => canAchieve)
			const earnedAchievements = await Promise.all(achievable.map(async ({achievement}) => {
				const {error} = await supabase.from('member_achievements')
				.insert({
					member_id: selectedCharacter.id,
					achievement_id: achievement.id,
					earned_at: new Date().toISOString()
				})
				.select('*')
				if (error) {
					return
				}
				return achievement
			}))
			earnedAchievements.forEach(achievement => {
				if (!achievement) return
				epic({
					message: (
						<div>
							<h3 className="text-gold text-xl font-bold">Achievement Earned!</h3>
							<div className="flex items-center gap-4 w-96 h-32 justify-between">
								<div className="flex gap-4 items-center w-full h-full">
									<Image src={achievement.img} alt={achievement.name} width={64} height={64}
									       className="rounded-full border border-gold min-w-16 min-h-16"
									/>
									<div
										className="flex flex-col gap-1"
									>
										<h4 className="font-bold text-large text-gold">{achievement.name}</h4>
										<p>{achievement.description}</p>
									</div>
								</div>
								<div
									className="flex flex-col items-center justify-center bg-dark border border-gold rounded-xl w-16 text-xs h-full gap-1 text-gold">
									<span>{achievement.points}</span>
									<span>Points</span>
									<span>{moment(achievement.created_at).format('YY-MM-DD')}</span>
								</div>
							</div>
						</div>
					),
					duration: 15000,
					position: 'bottom-center',
				})

				if (isPlaying) return
				audio.play().then().catch(console.warn)
				isPlaying = true
			})
		})
	}, [achievements, loadingAchievements, error, supabase, selectedCharacter]);

	return {
		...achievements,
		loadingAchievements,
		error
	}
}
