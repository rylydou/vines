import { Color, type Game, type VineCell } from '.'

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
					let path = tan
					let path_under = gray
					const color = (tile as VineCell).color
					switch (color) {
						case Color.Green:
							path = lime
							path_under = green
							break
						case Color.Yellow:
							path = yellow
							path_under = orange
							break
						case Color.Blue:
							path = cyan
							path_under = blue
							break
						case Color.Red:
							path = red
							path_under = dark_red
							break
					}
					path.moveTo(x + .5, y + .5)
					path.ellipse(x + .5, y + .5, .25, .25, 0, 0, 2 * Math.PI)
					// path.roundRect(x + .2, y + .2, .6, .6, 4 / 16)
					// path.moveTo(x + .2, y + .2)
					// path.lineTo(x + .8, y + .2)
					// path.lineTo(x + .8, y + .8)
					// path.lineTo(x + .2, y + .8)

					function get_vine_color(x: number, y: number): number {
						if (x < 0 || x >= game.width || y < 0 || y >= game.height) return -1
						const cell = game.grid[x][y]
						if (!cell) return -1
						if (cell.id != 'vine') return -1
						return (cell as VineCell).color
					}

					if (get_vine_color(x - 1, y) === color) {
						path_under.moveTo(x, y + .4)
						path_under.lineTo(x + .5, y + .4)
						path_under.lineTo(x + .5, y + .6)
						path_under.lineTo(x, y + .6)
					}

					if (get_vine_color(x + 1, y) === color) {
						path_under.moveTo(x + 1, y + .4)
						path_under.lineTo(x + .5, y + .4)
						path_under.lineTo(x + .5, y + .6)
						path_under.lineTo(x + 1, y + .6)
					}

					if (get_vine_color(x, y - 1) === color) {
						path_under.moveTo(x + .4, y)
						path_under.lineTo(x + .4, y + .5)
						path_under.lineTo(x + .6, y + .5)
						path_under.lineTo(x + .6, y)
					}
					if (get_vine_color(x, y + 1) === color) {
						path_under.moveTo(x + .4, y + 1)
						path_under.lineTo(x + .4, y + .5)
						path_under.lineTo(x + .6, y + .5)
						path_under.lineTo(x + .6, y + 1)
					}
				}
					break
				case 'water':
					blue.roundRect(x + .1, y + .1, .8, .8, 2 / 16)
					break
				case undefined:
					gfx.fillStyle = 'red'
					gfx.fillRect(x, y, 1, 1)
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
}
