export const colors = {
	red: '#e34262',
	dark_red: '#94353d',
	orange: '#d46e33',
	yellow: '#f2b63d',
	lime: '#b4ba47',
	green: '#6d8c32',
	cyan: '#457cd6',
	blue: '#4b3b9c',

	tan: '#d1b48c',
	brown: '#9c656c',
	gray: '#57253b',
	black: '#2c1b2e',
	white: '#fff4e0',
}

export enum Color {
	None,
	Green,
	Yellow,
	Blue,
	Red,
}

export const color_palettes = [
	{ fg: colors.tan, bg: colors.gray, char: 'W', },
	{ fg: colors.lime, bg: colors.green, char: 'G', },
	{ fg: colors.yellow, bg: colors.orange, char: 'Y', },
	{ fg: colors.cyan, bg: colors.blue, char: 'B', },
	{ fg: colors.red, bg: colors.dark_red, char: 'R', },
]
