import type { Engine } from '$lib/engine'
import { get, writable, type Writable } from 'svelte/store'
import { create_grid, colors, render_board, type Cell, create_grid_ex, type VineCell, Color } from '.'

export interface Game {
	engine: Engine
	editor_active: Writable<boolean>
	editor_item: Writable<number>
	grid: (Cell | null)[][]
	width: number
	height: number
	water: Writable<number>
	get_transform: (gfx: CanvasRenderingContext2D) => { translation: { x: number, y: number }, scale: number }
	get_connected: (x: number, y: number) => Cell[]
}

export function create_game(engine: Engine): Game {
	let game = {
		engine,
		editor_active: writable(false),
		editor_item: writable(-1),
		width: 8,
		height: 6,
		grid: create_grid<Cell | null>(8, 6, null),
		water: writable(99),
		get_transform: function (gfx) {
			const h_scale = gfx.canvas.width / (game.width + 1)
			const v_scale = gfx.canvas.height / (game.height + 2)
			const scale = Math.min(h_scale, v_scale)

			const x = get(this.editor_active) ? 0 : (gfx.canvas.width - game.width * scale) / 2
			const y = (gfx.canvas.height - game.height * scale) / 2 + .5 * scale

			return {
				translation: { x, y },
				scale,
			}
		},
		get_connected: function (x, y) {
			return [
				(this.grid[x - 1] || [])[y] || null,
				(this.grid[x + 1] || [])[y] || null,
				this.grid[x][y - 1] || null,
				this.grid[x][y + 1] || null,
			]
		},
	} as Game

	game.grid[2][2] = { id: 'vine', color: Color.Green } as VineCell
	game.grid[4][2] = { id: 'vine', color: Color.Yellow } as VineCell
	game.grid[2][4] = { id: 'vine', color: Color.Blue } as VineCell
	game.grid[4][4] = { id: 'vine', color: Color.Red } as VineCell

	engine.load_content = async function () {
		await document.onload
		await document.fonts.ready
	}

	engine.on_render = function () {
		render_board(game)
		const gfx = this.gfx
		gfx.textAlign = 'center'
		gfx.textBaseline = 'bottom'
		gfx.font = `bold 1px "Nippo"`
		gfx.fillStyle = '#457cd6'
		const text = get(game.water).toString()
		gfx.fillText(text, game.width / 2, 1 / 16)
		gfx.fillStyle = '#fff4e0'
		gfx.fillText(text, game.width / 2, 0)
	}

	let down = false
	let vine_color: Color | null = Color.None
	engine.canvas.addEventListener('pointerdown', (ev) => {
		const { x, y } = engine.transform_client_point(ev.clientX, ev.clientY)
		const transform = game.get_transform(engine.gfx)
		const mx = (x - transform.translation.x) / transform.scale
		const my = (y - transform.translation.y) / transform.scale
		const ix = Math.floor(mx)
		const iy = Math.floor(my)

		down = true
		document.addEventListener('pointerup', (e) => {
			if (ev.pointerId === e.pointerId) {
				down = false
			}
		})

		const cell = game.grid[ix][iy]

		if (cell && cell.id === 'vine') {
			vine_color = (cell as VineCell).color
		}

		if (get(game.editor_active)) {
			place_tile(ix, iy)
		}
	})

	engine.canvas.addEventListener('pointermove', (ev) => {
		const { x, y } = engine.transform_client_point(ev.clientX, ev.clientY)
		const transform = game.get_transform(engine.gfx)
		const mx = (x - transform.translation.x) / transform.scale
		const my = (y - transform.translation.y) / transform.scale
		const ix = Math.floor(mx)
		const iy = Math.floor(my)

		const is_in_bounds = ix >= 0 && ix < game.width && iy >= 0 && iy < game.height

		engine.canvas.style.cursor = is_in_bounds ? 'crosshair' : 'default'

		if (!down) return

		place_tile(ix, iy)
	})

	function place_tile(x: number, y: number) {
		if (x < 0 || x >= game.width || y < 0 || y >= game.height) return

		const debug_item = get(game.editor_item)
		if (debug_item >= 0) {
			// set_tile(x, y, debug_item as Cell)
			return
		}

		const cell = game.grid[x][y]
		if (cell) return

		const connected = game.get_connected(x, y)
		const vines = connected.filter(t => t && t.id === 'vine' && (t as VineCell).color === vine_color).length

		if (vines == 1) {
			if (get(game.water) <= 0) return
			game.water.update(x => x - 1)

			set_tile(x, y, { id: 'vine', color: vine_color } as VineCell)
		}
	}

	function set_tile(x: number, y: number, tile: Cell) {
		const cell = game.grid[x][y]
		if (cell == tile) return
		game.grid[x][y] = tile
		engine.render()
	}

	return game
}
