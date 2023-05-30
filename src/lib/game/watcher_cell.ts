import type { Color } from './colors'

export interface WatcherCell {
	criteria: String
	amount: number
	color: Color
}

export enum Criteria {
	Exactly,
	MoreThan,
	LessThan,
}
