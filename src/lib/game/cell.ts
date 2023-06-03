import type { Color } from '.'

export const cells = [
	'wall',
	'vine',
	'watcher',
	// 'water',
]

export const cells_with_color = [
	'vine',
	'watcher',
]

export const cells_with_amount = [
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
	amount: number
	color: Color
}

export interface WaterCell extends Cell {
	id: 'water'
	amount: number
}
