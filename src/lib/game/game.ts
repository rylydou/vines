import type { Engine } from '$lib/engine'
import { get, writable, type Writable } from 'svelte/store'
import { create_grid, Tile } from '.'

export interface Game {
	debug_item: Writable<number>
	grid: Tile[][]
	width: number
	height: number
	water: Writable<number>
}

export function create_game(engine: Engine): Game {
	let game = {
		debug_item: writable(-1),
		width: 8,
		height: 6,
		grid: create_grid<Tile>(8, 6, Tile.Empty),
		water: writable(99),
	} as Game

	function get_connected(x: number, y: number): Tile[] {
		return [
			(game.grid[x - 1] || [])[y] || Tile.Empty,
			(game.grid[x + 1] || [])[y] || Tile.Empty,
			game.grid[x][y - 1] || Tile.Empty,
			game.grid[x][y + 1] || Tile.Empty,
		]
	}

	function get_transform(gfx: CanvasRenderingContext2D): { translation: { x: number, y: number }, scale: number } {
		const scale = Math.min(gfx.canvas.width / game.width, gfx.canvas.height / game.height) * 0.75
		const x = (gfx.canvas.width - game.width * scale) / 2
		const y = (gfx.canvas.height - game.height * scale) / 2
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
		const tan = new Path2D()
		const green = new Path2D()
		const lime = new Path2D()
		const yellow = new Path2D()
		const blue = new Path2D()

		for (let x = 0; x < game.width; x++) {
			for (let y = 0; y < game.height; y++) {
				const tile = game.grid[x][y]
				switch (tile) {
					case Tile.Empty:
						gray_dark.moveTo(x + .5, y + .5)
						gray_dark.ellipse(x + .5, y + .5, 1 / 16, 1 / 16, 0, 0, 2 * Math.PI)
						break
					case Tile.Wall:
						gray.roundRect(x + .1, y + .1, .8, .8, 2 / 16)
						break
					case Tile.Vine:
						lime.moveTo(x + .5, y + .5)
						const is_ending = get_connected(x, y).filter(t => t == Tile.Vine).length <= 1
						const radius = is_ending ? .35 : .25
						lime.ellipse(x + .5, y + .5, radius, radius, 0, 0, 2 * Math.PI)

						// lime.roundRect(x + .2, y + .2, .6, .6, 4 / 16)
						// lime.moveTo(x + .2, y + .2)
						// lime.lineTo(x + .8, y + .2)
						// lime.lineTo(x + .8, y + .8)
						// lime.lineTo(x + .2, y + .8)

						if (((game.grid[x - 1] || [])[y] || Tile.Empty) == Tile.Vine) {
							green.moveTo(x, y + .4)
							green.lineTo(x + .5, y + .4)
							green.lineTo(x + .5, y + .6)
							green.lineTo(x, y + .6)
						}

						if (((game.grid[x + 1] || [])[y] || Tile.Empty) == Tile.Vine) {
							green.moveTo(x + 1, y + .4)
							green.lineTo(x + .5, y + .4)
							green.lineTo(x + .5, y + .6)
							green.lineTo(x + 1, y + .6)
						}

						if ((game.grid[x][y - 1] || Tile.Empty) == Tile.Vine) {
							green.moveTo(x + .4, y)
							green.lineTo(x + .4, y + .5)
							green.lineTo(x + .6, y + .5)
							green.lineTo(x + .6, y)
						}
						if ((game.grid[x][y + 1] || Tile.Empty) == Tile.Vine) {
							green.moveTo(x + .4, y + 1)
							green.lineTo(x + .4, y + .5)
							green.lineTo(x + .6, y + .5)
							green.lineTo(x + .6, y + 1)
						}
						break
					case Tile.Water:
						blue.roundRect(x + .1, y + .1, .8, .8, 2 / 16)
						break
					case Tile.Pot:
						tan.moveTo(x + .5, y + .5)
						tan.ellipse(x + .5, y + .5, 6 / 16, 6 / 16, 0, 0, 7)
						break
				}
			}
		}

		gfx.fillStyle = '#57253b'; gfx.fill(gray_dark)
		gfx.fillStyle = '#457cd6'; gfx.fill(blue)
		gfx.fillStyle = '#9c656c'; gfx.fill(gray)
		gfx.fillStyle = '#d1b48c'; gfx.fill(tan)
		gfx.fillStyle = '#6d8c32'; gfx.fill(green)
		gfx.fillStyle = '#b4ba47'; gfx.fill(lime)
		gfx.fillStyle = '#f2b63d'; gfx.fill(yellow)
	}

	let down = false
	engine.canvas.addEventListener('pointerdown', (ev) => {
		const { x, y } = engine.transform_client_point(ev.clientX, ev.clientY)
		const transform = get_transform(engine.gfx)
		const mx = (x - transform.translation.x) / transform.scale
		const my = (y - transform.translation.y) / transform.scale
		const ix = Math.floor(mx)
		const iy = Math.floor(my)

		down = true
		document.addEventListener('pointerup', (e) => {
			if (ev.pointerId === e.pointerId) {
				down = false
			}
		},)

		place_tile(ix, iy)
	})

	engine.canvas.addEventListener('pointermove', (ev) => {
		if (!down) return

		const { x, y } = engine.transform_client_point(ev.clientX, ev.clientY)
		const transform = get_transform(engine.gfx)
		const mx = (x - transform.translation.x) / transform.scale
		const my = (y - transform.translation.y) / transform.scale
		const ix = Math.floor(mx)
		const iy = Math.floor(my)

		place_tile(ix, iy)
	})

	function place_tile(x: number, y: number) {
		if (x < 0 || x >= game.width || y < 0 || y >= game.height) return

		const debug_item = get(game.debug_item)
		if (debug_item >= 0) {
			set_tile(x, y, debug_item as Tile)
			return
		}

		const cell = game.grid[x][y]
		if (cell != Tile.Empty) return

		const connected = get_connected(x, y)
		const vines = connected.filter(t => t == Tile.Vine).length

		if (vines == 1) {
			if (get(game.water) <= 0) return
			game.water.update(x => x - 1)

			set_tile(x, y, Tile.Vine)
		}
	}

	function set_tile(x: number, y: number, tile: Tile) {
		const cell = game.grid[x][y]
		if (cell == tile) return
		game.grid[x][y] = tile
		engine.render()
	}

	return game
}
