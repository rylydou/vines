import type { Engine } from '$lib/engine'
import { polar } from '$lib/engine/utils'

export enum Tile {
	Empty,
	Wall,
	Vine,
	Source,
}

export function create_game(engine: Engine) {
	const width = 15
	const height = 10
	const grid = create_grid(width, height)
	grid[4][4] = Tile.Wall
	grid[4][5] = Tile.Wall
	grid[5][5] = Tile.Wall
	grid[6][5] = Tile.Wall
	grid[2][2] = Tile.Source

	function get_connected(x: number, y: number): Tile[] {
		return [
			(grid[x - 1] || [])[y] || Tile.Empty,
			(grid[x + 1] || [])[y] || Tile.Empty,
			grid[x][y - 1] || Tile.Empty,
			grid[x][y + 1] || Tile.Empty,
		]
	}

	function get_transform(gfx: CanvasRenderingContext2D): { translation: { x: number, y: number }, scale: number } {
		const scale = Math.min(gfx.canvas.width / width, gfx.canvas.height / height) * 0.75
		const x = (gfx.canvas.width - width * scale) / 2
		const y = (gfx.canvas.height - height * scale) / 2
		return {
			translation: { x, y },
			scale,
		}
	}

	engine.on_render = function () {
		const gfx = this.gfx

		gfx.resetTransform()
		gfx.clearRect(0, 0, gfx.canvas.width, gfx.canvas.height)

		const transform = get_transform(gfx)
		gfx.translate(transform.translation.x, transform.translation.y)
		gfx.scale(transform.scale, transform.scale)

		const gray_dark = new Path2D()
		const gray = new Path2D()
		const green = new Path2D()
		const lime = new Path2D()
		const yellow = new Path2D()

		for (let x = 0; x < width; x++) {
			for (let y = 0; y < height; y++) {
				const tile = grid[x][y]
				switch (tile) {
					case Tile.Empty:
						gray_dark.moveTo(x + .5, y + .5)
						gray_dark.ellipse(x + .5, y + .5, 1 / 16, 1 / 16, 0, 0, 2 * Math.PI)
						break
					case Tile.Wall:
						gray.roundRect(x + .1, y + .1, .8, .8, 2 / 16)
						break
					case Tile.Vine:
						green.moveTo(x, y)
						green.lineTo(x + 1, y)
						green.lineTo(x + 1, y + 1)
						green.lineTo(x, y + 1)

						// yellow.moveTo(x + .5, y + .5)
						// for (const p of polar(0, 7, 64, t => .4 * Math.cos(t * 4))) {
						// 	yellow.lineTo(x + p.x + .5, y + p.y + .5)
						// }
						lime.moveTo(x, y)
						lime.lineTo(x + .1, y)
						lime.lineTo(x + 1, y + .9)
						lime.lineTo(x + 1, y + 1)
						lime.lineTo(x + .9, y + 1)
						lime.lineTo(x, y + .1)
						lime.lineTo(x, y + .1)
						break
					case Tile.Source:
						lime.moveTo(x, y)
						lime.lineTo(x + 1, y)
						lime.lineTo(x + 1, y + 1)
						lime.lineTo(x, y + 1)
						break
				}
			}
		}

		gfx.fillStyle = '#57253b'; gfx.fill(gray_dark)
		gfx.fillStyle = '#9c656c'; gfx.fill(gray)
		gfx.fillStyle = '#6d8c32'; gfx.fill(green)
		gfx.fillStyle = '#b4ba47'; gfx.fill(lime)
		gfx.fillStyle = '#f2b63d'; gfx.fill(yellow)
	}

	engine.canvas.addEventListener('pointerdown', (ev) => {
		const { x, y } = engine.transform_client_point(ev.clientX, ev.clientY)
		const transform = get_transform(engine.gfx)
		const mx = (x - transform.translation.x) / transform.scale
		const my = (y - transform.translation.y) / transform.scale
		const ix = Math.floor(mx)
		const iy = Math.floor(my)
		if (ix < 0 || ix >= width || iy < 0 || iy >= height) return

		const cell = grid[ix][iy]
		const connected = get_connected(ix, iy)
		const vines = connected.filter(t => t == Tile.Vine).length

		if (cell != Tile.Empty) return

		if (vines > 0 || connected.some(t => t == Tile.Source)) {
			if (vines > 1) return
			grid[ix][iy] = Tile.Vine
			engine.render()
		}
	})
}

function create_grid(width: number, height: number): Tile[][] {
	let cols = new Array(width) as [Tile[]]
	for (let index = 0; index < width; index++) {
		let col = new Array(height)
		col.fill(Tile.Empty)
		cols[index] = col
	}
	return cols
}
