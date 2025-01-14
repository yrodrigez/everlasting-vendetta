export type Achievement = {
	id?: string,
	created_at: string,
	name: string,
	description: string,
	points: number,
	condition: AchievementCondition,
	img: string,
	earned_at?: string,
	category: string
}

export type QueryOperator = 'eq' | 'gt' | 'lt' | 'gte' | 'lte' | 'neq' | 'like' | 'ilike' | 'in' | 'nin'
export type QueryOrder = 'asc' | 'desc'
export type QueryValue = string | number | boolean | Array<string | number> | null
export type QueryBoolOperator = 'and' | 'or'

export type TableCondition = {
	column: string,
	operator: QueryOperator,
	value: QueryValue,
	boolOperator?: QueryBoolOperator
	order?: QueryOrder
}

export type ReducerStep = {
	boolOperator: QueryBoolOperator
	field: string
	type: 'unique' | 'sum' | 'count' | 'avg' | 'min' | 'max'
	value: QueryValue
	operator: QueryOperator
}

export type Reducer = {
	column: string,
	steps: ReducerStep[]
}

export type CountCondition = {
	countNumber: number,
	operator: QueryOperator,
	reducer?: Reducer
}

export type AchievementCondition = {
	table: string
	select: string
	conditions: TableCondition[]
	count?: CountCondition
	isTest?: boolean
}

export type MemberAchievement = {
	id: string,
	earned_at: string,
	achievement_id: string,
	member_id: string,
}
