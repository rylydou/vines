import type { Color } from '.'

export const cells = [
	'wall',
	'vine',
	'watcher',
]

export interface Cell {
	id: string
	initial?: boolean
}

export interface WallCell extends Cell {
	id: 'wall'
}

export interface VineCell extends Cell {
	id: 'vine'
	color: Color
}

export interface WatcherCell extends Cell {
	id: 'watcher'
	criteria: Criteria
	amount: number
	color: Color
}

export enum Criteria {
	Exactly,
	MoreThan,
	LessThan,
}
