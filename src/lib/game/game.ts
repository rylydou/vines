import type { Engine } from '$lib/engine'
import { get, writable, type Writable } from 'svelte/store'
import { create_grid, colors, render_board, type Cell, create_grid_ex, type VineCell, Color, type WatcherCell, cells_with_color, cells_with_amount } from '.'

export interface Game {
	engine: Engine
	editor_active: Writable<boolean>
	editor_item: Writable<string | null>
	editor_color: Writable<number>
	editor_amount: Writable<number>

	name: Writable<string>
	hint: Writable<string>
	grid: (Cell | null)[][]
	width: number
	height: number

	get_transform: (gfx: CanvasRenderingContext2D) => { translation: { x: number, y: number }, scale: number }
	get_connected: (x: number, y: number) => Cell[]
}

export function create_game(engine: Engine): Game {
	let game = {
		engine,
		editor_active: writable(false),
		editor_item: writable(null),
		editor_color: writable(0),
		editor_amount: writable(0),
		name: writable(''),
		hint: writable(''),
		width: 8,
		height: 6,
		grid: create_grid<Cell | null>(8, 6, null),
		get_transform: function (gfx) {
			let pl = 0
			let pr = get(game.editor_active) ? 400 * window.devicePixelRatio : 0
			let pt = 0
			let pb = 0

			const h_scale = (gfx.canvas.width - pl - pr) / (game.width + 1)
			const v_scale = (gfx.canvas.height - pt - pb) / (game.height + 1)
			let scale = Math.min(h_scale, v_scale)

			let x = (gfx.canvas.width - pr - game.width * scale) / 2
			let y = (gfx.canvas.height - pb - game.height * scale) / 2 // + .5 * scale

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

	engine.load_content = async function () {
		// Wait for the document to completely load
		if (document.readyState != 'complete') {
			console.log('waiting for document to completely load')
			await document.onload
		}

		// Draw with the font to initiate loading
		this.gfx.fillStyle = 'transparent'
		this.gfx.font = 'bold 16px Teko'
		this.gfx.fillText('Teko', 0, 0)

		// Wait for the font to load
		if (!document.fonts.check('1px Teko')) {
			console.log('waiting for the "Teko" font to load')
			await document.fonts.ready
		}
	}

	engine.on_render = function () {
		render_board(game)
	}

	let down = false

	let vine_x = 0
	let vine_y = 0
	let vine_color = Color.None
	let vine_erasable = false

	function start_draw(x: number, y: number) {
		const cell = game.grid[x][y]
		if (!cell) return
		if (cell.id != 'vine') return
		const vine = (cell as VineCell)

		vine_x = x
		vine_y = y
		vine_color = vine.color

		const connected = game.get_connected(x, y)
		const connect_count = connected.filter(t => t && t.id == 'vine' && (t as VineCell).color == vine_color)
		vine_erasable = connect_count.length == 1 && !vine.initial
	}

	function draw(x: number, y: number) {
		if (vine_x == x && vine_y == y) return

		const cell = game.grid[x][y]
		if (!cell) {
			const connected = game.get_connected(x, y)
			const connect_count = connected.filter(t => t && t.id == 'vine' && (t as VineCell).color == vine_color)
			if (connect_count.length != 1) return
			set_tile(x, y, { id: 'vine', color: vine_color } as VineCell)
			start_draw(x, y)
			return
		}
		if (cell.id != 'vine') return
		const vine = (cell as VineCell)

		if (vine.color != vine_color) return
		// Erase previous vine if it is the end
		if (vine_erasable) {
			set_tile(vine_x, vine_y, null)
			start_draw(x, y)
		}
	}

	engine.canvas.addEventListener('pointerdown', (ev) => {
		const { x, y } = engine.transform_client_point(ev.clientX, ev.clientY)
		const transform = game.get_transform(engine.gfx)
		const mx = (x - transform.translation.x) / transform.scale
		const my = (y - transform.translation.y) / transform.scale
		const ix = Math.floor(mx)
		const iy = Math.floor(my)

		down = true
		document.addEventListener('pointerup', (e) => {
			if (ev.pointerId == e.pointerId) {
				down = false
			}
		}, { once: true })

		const is_in_bounds = ix >= 0 && ix < game.width && iy >= 0 && iy < game.height
		if (!is_in_bounds) return

		if (get(game.editor_active)) {
			vine_x = ix
			vine_y = iy
			place_tile(ix, iy)
		}
		else {
			start_draw(ix, iy)
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
		if (!is_in_bounds) return

		if (get(game.editor_active)) {
			if (vine_x == ix && vine_y == iy) return
			vine_x = ix
			vine_y = iy
			place_tile(ix, iy)
		}
		else {
			draw(ix, iy)
		}
	})

	function place_tile(x: number, y: number) {
		const debug_item = get(game.editor_item)
		if (debug_item) {
			let cell = { id: debug_item, initial: true } as Cell
			if (cells_with_color.indexOf(debug_item) >= 0) {
				// @ts-ignore
				cell.color = get(game.editor_color)
			}
			if (cells_with_amount.indexOf(debug_item) >= 0) {
				// @ts-ignore
				cell.amount = get(game.editor_amount)
			}

			set_tile(x, y, cell)
		}
		else {
			set_tile(x, y, null)
		}
		return
	}

	function set_tile(x: number, y: number, tile: Cell | null) {
		const cell = game.grid[x][y]
		if (cell == tile) return
		game.grid[x][y] = tile
		engine.render()
	}

	return game
}
