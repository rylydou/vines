import type { Color } from './colors'

export interface Plant {
	x: number
	y: number
	color: Color

	length: number
	length_remaining: number

	vines: { x: number, y: number }[]
}
