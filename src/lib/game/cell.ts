import type { Color } from '.'

export interface Cell {
	id: string
}

export interface WallCell extends Cell {
	id: 'wall'
}

export interface VineCell extends Cell {
	id: 'vine'
	color: Color
}

export interface VineCell extends Cell {
	id: 'vine'
	color: Color
}

export interface VineStartCell extends Cell {
	id: 'vine_start'
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
