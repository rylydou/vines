export function create_grid<T>(width: number, height: number, fill: T): T[][] {
	let cols = new Array(width) as T[][]
	for (let index = 0; index < width; index++) {
		let col = new Array(height)
		col.fill(fill)
		cols[index] = col
	}
	return cols
}

export function create_grid_ex<T>(width: number, height: number, func: () => T): T[][] {
	let cols = new Array(width) as T[][]
	for (let index = 0; index < width; index++) {
		let col = new Array(height)
		col.fill(func())
		cols[index] = col
	}
	return cols
}
