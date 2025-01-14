import {type QueryOperator, type QueryValue, type ReducerStep, type Reducer} from "@/app/types/Achievements";


function filterByOperator(
	data: any[],
	field: string,
	operator: QueryOperator,
	value: QueryValue
): any[] {
	switch (operator) {
		case 'eq':
			return data.filter((item) => item[field] === value)

		case 'neq':
			return data.filter((item) => item[field] !== value)

		case 'gt':
			return data.filter((item) => item[field] > (value ?? 0))

		case 'gte':
			return data.filter((item) => item[field] >= (value ?? 0))

		case 'lt':
			return data.filter((item) => item[field] < (value ?? 0))

		case 'lte':
			return data.filter((item) => item[field] <= (value ?? 0))

		case 'in':
			if (!Array.isArray(value)) return data
			return data.filter((item) => value.includes(item[field]))

		case 'nin':
			if (!Array.isArray(value)) return data
			return data.filter((item) => !value.includes(item[field]))

		case 'like':
		case 'ilike':
			// Simple case-insensitive substring match (or however you define 'like').
			if (typeof value !== 'string') return data
			return data.filter((item) => {
				const val = String(item[field] ?? '').toLowerCase()
				return val.includes(value.toLowerCase())
			})

		default:
			// No known operator => no filtering
			return data
	}
}

function removeDuplicates(data: any[], field: string): any[] {
	const seen = new Set()
	const result: any[] = []

	for (const item of data) {
		const val = item[field]
		if (!seen.has(val)) {
			seen.add(val)
			result.push(item)
		}
	}
	return result
}

function unionArraysById(arrA: any[], arrB: any[]): any[] {
	const map = new Map()

	for (const item of arrA) {
		map.set(item.id, item)
	}
	for (const item of arrB) {
		map.set(item.id, item)
	}

	return Array.from(map.values())
}


/**
 * Applies a single reducer step: filter by operator, then apply aggregator/transform.
 */
function applyStep(data: any[], step: ReducerStep): any[] {
	// 1) Filter the data according to (field, operator, value)
	const filtered = filterByOperator(data, step.field, step.operator, step.value)

	// 2) Combine with boolOperator if you wish (optional interpretation).
	//    E.g., if boolOperator === 'or', we might union `data` and `filtered`.
	//    If boolOperator === 'and', we keep `filtered` only.
	//    Below is a simple approach.
	const combined = step.boolOperator === 'or'
		? unionArraysById(data, filtered)  // or however you define “union”
		: filtered

	// 3) Apply the aggregator or transformation.
	switch (step.type) {
		case 'unique':
			return removeDuplicates(combined, step.field)

		case 'sum':
			return [{
				[step.type]: combined.reduce((acc, row) =>
					acc + (Number(row[step.field]) || 0), 0
				)
			}]

		case 'count':
			return [{
				[step.type]: combined.length
			}]

		case 'avg':
			if (combined.length === 0) {
				return [{[step.type]: 0}]
			}
		{
			const total = combined.reduce((acc, row) =>
				acc + (Number(row[step.field]) || 0), 0
			)
			const average = total / combined.length
			return [{[step.type]: average}]
		}

		case 'min':
			if (combined.length === 0) return [{[step.type]: null}]
		{
			const minVal = combined.reduce((acc, row) => {
				const val = Number(row[step.field]) || 0
				return val < acc ? val : acc
			}, Number.POSITIVE_INFINITY)
			return [{[step.type]: minVal}]
		}

		case 'max':
			if (combined.length === 0) return [{[step.type]: null}]
		{
			const maxVal = combined.reduce((acc, row) => {
				const val = Number(row[step.field]) || 0
				return val > acc ? val : acc
			}, Number.NEGATIVE_INFINITY)
			return [{[step.type]: maxVal}]
		}

		default:
			// Fallback - no known type
			return combined
	}
}

/**
 * Applies a series of reducer steps to a data collection.
 * @param collection The array of items to transform/aggregate.
 * @param reducer An object containing steps to apply.
 * @returns The transformed/aggregated result (often an array, but can be a single value if you choose).
 */
export function applyReducer(collection: any[], reducer: Reducer): any[] {
	let result = [...collection]

	for (const step of reducer.steps) {
		// We combine the new step’s result with the existing `result`
		// using the boolOperator logic (AND/OR).
		result = applyStep(result, step)
	}

	return result
}
