import type { Game } from '.'

export const FORMAT_VERSION = 1
export const PALETTE_VERSION = 1

export function serialize(game: Game): any {
	const arr = ([] as any[]).concat.apply([], game.grid)
	const simplified_arr = arr.map(x => {
		if (!x) return null
		if (!x.initial) return null
		let result = { ...x }
		delete result.initial
		return result
	})

	return {
		___VERSION___: FORMAT_VERSION,
		_PALETTE_: PALETTE_VERSION,
		arr: simplified_arr,
		width: game.width,
		height: game.height,
	}
}

export function deserialize(game: Game, obj: any, format_version?: number, palette_version?: number): boolean {
	if (!format_version)
		format_version = obj.___VERSION___
	if (!format_version) return false
	if (format_version != FORMAT_VERSION) return false

	if (!palette_version)
		palette_version = obj._PALETTE_
	if (!palette_version) return false
	if (palette_version > PALETTE_VERSION) return false

	const width: number = obj.width
	if (!width) return false
	if (width <= 0) return false

	const height: number = obj.height
	if (!height) return false
	if (height <= 0) return false

	const arr: any[] = obj.arr
	if (!arr) return false
	if (arr.length != width * height) return false
	arr.map(x => {
		if (!x) return null
		x.initial = true
		return x
	})
	const grid: any[] = []
	while (arr.length)
		grid.push(arr.splice(0, height))

	game.width = width
	game.height = height
	game.grid = grid

	return true
}
