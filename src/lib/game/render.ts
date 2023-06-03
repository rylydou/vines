import { Color, colors, type Game, type VineCell, type WatcherCell } from '.'

export function render_board(game: Game) {
	const gfx = game.engine.gfx

	gfx.resetTransform()
	gfx.clearRect(0, 0, gfx.canvas.width, gfx.canvas.height)

	const transform = game.get_transform(gfx)
	gfx.translate(transform.translation.x, transform.translation.y)
	gfx.scale(transform.scale, transform.scale)

	const gray = new Path2D()
	const brown = new Path2D()
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

	const black = new Path2D()

	function get_path(color: Color): { fg: Path2D, bg: Path2D } {
		switch (color) {
			case Color.Green: return { fg: lime, bg: green }
			case Color.Yellow: return { fg: yellow, bg: orange }
			case Color.Red: return { fg: red, bg: dark_red }
			case Color.Blue: return { fg: cyan, bg: blue }
			default: return { fg: tan, bg: brown }
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
				gray.moveTo(x + .5, y + .5)
				gray.ellipse(x + .5, y + .5, 1 / 16, 1 / 16, 0, 0, 2 * Math.PI)
				continue
			}

			switch (tile.id) {
				case 'wall':
					brown.roundRect(x + .1, y + .1, .8, .8, 2 / 16)
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

					let color = colors.tan
					switch (watcher.color) {
						case Color.Green: color = colors.lime; break
						case Color.Yellow: color = colors.yellow; break
						case Color.Red: color = colors.red; break
						case Color.Blue: color = colors.cyan; break
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

					if (count == 0) {
						console.log('black')
						gfx.fillStyle = colors.black
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

	gfx.fillStyle = colors.gray; gfx.fill(gray)
	gfx.fillStyle = colors.brown; gfx.fill(brown)
	gfx.fillStyle = colors.tan; gfx.fill(tan)

	gfx.fillStyle = colors.green; gfx.fill(green)
	gfx.fillStyle = colors.lime; gfx.fill(lime)

	gfx.fillStyle = colors.orange; gfx.fill(orange)
	gfx.fillStyle = colors.yellow; gfx.fill(yellow)

	gfx.fillStyle = colors.dark_red; gfx.fill(dark_red)
	gfx.fillStyle = colors.red; gfx.fill(red)

	gfx.fillStyle = colors.blue; gfx.fill(blue)
	gfx.fillStyle = colors.cyan; gfx.fill(cyan)

	gfx.fillStyle = colors.white; gfx.fill(white)
	gfx.fillStyle = colors.black; gfx.fill(black)
}
