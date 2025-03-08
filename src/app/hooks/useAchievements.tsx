import {useSession} from "@hooks/useSession";
import {useQuery} from "@tanstack/react-query";
import {
	type Achievement,
	type AchievementCondition,
	type MemberAchievement, Reducer,
	type TableCondition
} from "@/app/types/Achievements";
import {useEffect} from "react";
import {type SupabaseClient} from "@supabase/supabase-js";
import {type Character} from "@/app/components/characterStore";
import useToast from "@utils/useToast";
import mustache from "mustache";
import Image from "next/image";
import moment from "moment";
import {applyReducer} from "@/app/lib/achievements";
import {GUILD_NAME} from "@utils/constants";
import {toast} from "sonner";

export function displayAchievement(achievement: Achievement) {


	if (!achievement) return
	toast.custom(() => (
		<div className="flex items-center gap-4 w-[600px] h-[180px] justify-between rounded-xl bg-wood border border-wood-100 p-8 glow-animation">
			<div className="flex gap-4 items-center w-full h-full">
				<img src={achievement.img} alt={achievement.name} width={192} height={192}
				       className="rounded-full min-w-16 min-h-16 shadow-gold shadow-lg"
				/>
				<div className="flex flex-col gap-1 text-default p-3 bg-dark border border-dark-100 shadow rounded-xl">
					<h4 className="font-bold text-large text-gold">{achievement.name}</h4>
					<p>{achievement.description}</p>
				</div>
			</div>
			<div className="flex flex-col items-center justify-center bg-ocean border border-moss-100 rounded-xl w-20 text-xs h-full gap-1 text-gold p-2 h-full shadow shadow-xl">
				<span className="text-3xl font-bold">{achievement.points}</span>
				<span>Points</span>
				<span>{moment(achievement.created_at).format('YY-MM-DD')}</span>
			</div>
		</div>
	), {
		duration: 15000,
		position: 'bottom-center',
	})
}


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
			case 'nin':
				// @ts-ignore
				query.not(column, 'in', `(${value.join(',') as string[]})`)
				break
			default:
				// @ts-ignore
				return query.eq
		}

	})

	return query
}

function personalize(condition: any, selectedCharacter: Character) {
	const template = JSON.stringify(condition)
	return JSON.parse(mustache.render(template, {
		...selectedCharacter,
		now: () => new Date().toISOString(),
		daysAgo: () => (text: string) => {
			const days = parseInt(text, 10) || 0;
			return new Date(
				Date.now() - days * 24 * 60 * 60 * 1000
			).toISOString();
		},
		hoursAgo: () => (text: string) => {
			const hours = parseInt(text, 10) || 0;
			return new Date(
				Date.now() - hours * 60 * 60 * 1000
			).toISOString();
		},
		minutesAgo: () => (text: string) => {
			const minutes = parseInt(text, 10) || 0;
			return new Date(
				Date.now() - minutes * 60 * 1000
			).toISOString();
		},
		secondsAgo: () => (text: string) => {
			const seconds = parseInt(text, 10) || 0;
			return new Date(
				Date.now() - seconds * 1000
			).toISOString();
		},
	}))
}

export const executeCondition = async (supabase: SupabaseClient, condition: AchievementCondition, selectedCharacter: Character) => {
	if (condition.rpc) {
		const {
			data,
			error
		} = await supabase.rpc(`achievement_${condition.rpc}`, personalize(condition.rpcParams, selectedCharacter))
		if (error) {
			console.error('Error executing RPC:', error)
			return {data: null, error}
		}
		return {data: data[0], error}
	}

	const parsedCondition = personalize(condition, selectedCharacter) as AchievementCondition

	const table = parsedCondition.table
	const select = parsedCondition.select
	const {conditions} = parsedCondition

	// @ts-ignore it creates a query based on the conditions
	const {data, error} = await createQuery(supabase, table, conditions, {
		select: select ?? '*',
		operation: 'select'
	})

	const {count} = parsedCondition
	const {reducer, extractProp} = count ?? {}
	let val = extractProp ? data[0] : data
	const path = extractProp?.split('.')
	if (path && val) {
		for (const p of path) {
			val = val[p]
		}
	}

	if (reducer && data && Array.isArray(data)) {
		return {data: applyReducer(val, reducer), error}
	}

	return {data: val, error}
}


async function canAchieve(supabase: SupabaseClient, achievement: Achievement, selectedCharacter: Character): Promise<boolean> {
	try {
		if (selectedCharacter.guild?.name !== GUILD_NAME) return false
		const {condition} = achievement
		if (condition.isTest && process.env.NODE_ENV !== 'development') return false // skip test conditions in production
		const {data, error} = await executeCondition(supabase, condition, selectedCharacter)
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

		if (condition?.rpc) return data?.achieved

		return (data && data.length && data[0])
	} catch (e) {
		console.error('Error processing condition:', e)
		return false
	}
}

export default function useAchievements() {
	const {supabase, selectedCharacter, session} = useSession()

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
				canAchieve: (await canAchieve(supabase, achievement, {...session, ...selectedCharacter})),
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
				displayAchievement(achievement)
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
