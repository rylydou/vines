import { Tile } from '.'

export function create_grid(width: number, height: number): Tile[][] {
	let cols = new Array(width) as [Tile[]]
	for (let index = 0; index < width; index++) {
		let col = new Array(height)
		col.fill(Tile.Empty)
		cols[index] = col
	}
	return cols
}
