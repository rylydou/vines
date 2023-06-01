import { Color, type Game, type VineCell, type WatcherCell } from '.'

export function render_board(game: Game) {
	const gfx = game.engine.gfx

	gfx.resetTransform()
	gfx.clearRect(0, 0, gfx.canvas.width, gfx.canvas.height)

	const transform = game.get_transform(gfx)
	gfx.translate(transform.translation.x, transform.translation.y)
	gfx.scale(transform.scale, transform.scale)

	const dark_gray = new Path2D()
	const gray = new Path2D()
	const tan = new Path2D()

	const green = new Path2D()
	const lime = new Path2D()

	const orange = new Path2D()
	const yellow = new Path2D()

	const dark_red = new Path2D()
	const red = new Path2D()

	const blue = new Path2D()
	const cyan = new Path2D()

	const white = new Path2D()

	function get_path(color: Color): { fg: Path2D, bg: Path2D } {
		switch (color) {
			case Color.Green: return { fg: lime, bg: green }
			case Color.Yellow: return { fg: yellow, bg: orange }
			case Color.Red: return { fg: red, bg: dark_red }
			case Color.Blue: return { fg: cyan, bg: blue }
			default: return { fg: tan, bg: gray }
		}
	}

	function get_cell_color(x: number, y: number): number {
		if (x < 0 || x >= game.width || y < 0 || y >= game.height) return -1
		const cell = game.grid[x][y]
		if (!cell) return -1
		if (cell.id != 'vine') return -1
		return (cell as VineCell).color
	}

	for (let x = 0; x < game.width; x++) {
		for (let y = 0; y < game.height; y++) {
			const tile = game.grid[x][y]

			if (!tile) {
				dark_gray.moveTo(x + .5, y + .5)
				dark_gray.ellipse(x + .5, y + .5, 1 / 16, 1 / 16, 0, 0, 2 * Math.PI)
				continue
			}

			switch (tile.id) {
				case 'wall':
					gray.roundRect(x + .1, y + .1, .8, .8, 2 / 16)
					break
				case 'vine': {
					const color = (tile as VineCell).color
					const { fg, bg } = get_path(color)

					let count = 0
					if (get_cell_color(x - 1, y) === color) {
						count++
						bg.moveTo(x, y + .4)
						bg.lineTo(x + .5, y + .4)
						bg.lineTo(x + .5, y + .6)
						bg.lineTo(x, y + .6)
					}

					if (get_cell_color(x + 1, y) === color) {
						count++
						bg.moveTo(x + 1, y + .4)
						bg.lineTo(x + .5, y + .4)
						bg.lineTo(x + .5, y + .6)
						bg.lineTo(x + 1, y + .6)
					}

					if (get_cell_color(x, y - 1) === color) {
						count++
						bg.moveTo(x + .4, y)
						bg.lineTo(x + .4, y + .5)
						bg.lineTo(x + .6, y + .5)
						bg.lineTo(x + .6, y)
					}
					if (get_cell_color(x, y + 1) === color) {
						count++
						bg.moveTo(x + .4, y + 1)
						bg.lineTo(x + .4, y + .5)
						bg.lineTo(x + .6, y + .5)
						bg.lineTo(x + .6, y + 1)
					}

					if (tile.initial) {
						fg.moveTo(x + .5, y + .5)
						fg.ellipse(x + .5, y + .5, .35, .35, 0, 0, 2 * Math.PI)
						continue
					}
					if (count > 2) {
						fg.roundRect(x + .2, y + .2, .6, .6, 2 / 16)
						continue
					}
					fg.moveTo(x + .5, y + .5)
					fg.ellipse(x + .5, y + .5, .25, .25, 0, 0, 2 * Math.PI)
				}
					break
				case 'water':
					white.moveTo(x + .5, y + .5)
					white.ellipse(x + .5, y + .5, .25, .25, 0, 0, 7)
					break
				case 'watcher': {
					const watcher = (tile as WatcherCell)

					let count = watcher.amount
					for (let xx = -1; xx <= 1; xx++) {
						for (let yy = -1; yy <= 1; yy++) {
							if (xx === 0 && yy === 0) continue
							const cell_color = get_cell_color(x + xx, y + yy)
							if (cell_color < 0) continue

							if (cell_color == watcher.color) {
								count -= 1
							}
							else {
								count += 1
							}
						}
					}

					const { fg, bg } = get_path(watcher.color)
					let color = '#d1b48c'
					switch (watcher.color) {
						case Color.Green: color = '#b4ba47'; break
						case Color.Yellow: color = '#f2b63d'; break
						case Color.Red: color = '#e34262'; break
						case Color.Blue: color = '#457cd6'; break
					}

					gfx.fillStyle = color
					gfx.strokeStyle = color
					gfx.beginPath()

					if (count == 0) {
						gfx.roundRect(x + 1 / 16, y + 1 / 16, 14 / 16, 14 / 16, 2 / 16)
						gfx.fill()
					}
					else {
						gfx.roundRect(x + 2 / 16, y + 2 / 16, 12 / 16, 12 / 16, 1 / 16)
						gfx.lineWidth = 2 / 16
						gfx.stroke()
					}

					gfx.textAlign = 'center'
					gfx.textBaseline = 'middle'
					gfx.fontKerning = 'none'
					gfx.font = `bold .5px ${getComputedStyle(gfx.canvas).fontFamily}`
					// gfx.fillStyle = 'white'
					if (isNaN(count))
						gfx.fillText(':(', x + .5, y + .4)
					else
						gfx.fillText(count.toString(), x + .5, y + .4)

					// for (let index = 0; index < count; index++) {
					// 	white.moveTo(x + .5, y + .5)
					// 	let value = (index * 2) / (watcher.amount * 2) * Math.PI * 2
					// 	white.lineTo(x + .5 + Math.cos(value) / 3, y + .5 + Math.sin(value) / 3)
					// 	value = (index * 2 + 1) / (watcher.amount * 2) * Math.PI * 2
					// 	white.lineTo(x + .5 + Math.cos(value) / 3, y + .5 + Math.sin(value) / 3)
					// }
				}
					break
				case undefined:
					gfx.fillStyle = 'red'
					gfx.fillRect(x, y, 1, 1)
					break
				default:
					gfx.fillStyle = 'magenta'
					gfx.fillRect(x, y, 1, 1)
					break
			}
		}
	}

	gfx.fillStyle = '#57253b'; gfx.fill(dark_gray)
	gfx.fillStyle = '#9c656c'; gfx.fill(gray)
	gfx.fillStyle = '#d1b48c'; gfx.fill(tan)

	gfx.fillStyle = '#6d8c32'; gfx.fill(green)
	gfx.fillStyle = '#b4ba47'; gfx.fill(lime)

	gfx.fillStyle = '#d46e33'; gfx.fill(orange)
	gfx.fillStyle = '#f2b63d'; gfx.fill(yellow)

	gfx.fillStyle = '#94353d'; gfx.fill(dark_red)
	gfx.fillStyle = '#e34262'; gfx.fill(red)

	gfx.fillStyle = '#4b3b9c'; gfx.fill(blue)
	gfx.fillStyle = '#457cd6'; gfx.fill(cyan)
	gfx.fillStyle = '#fff4e0'; gfx.fill(white)
}
