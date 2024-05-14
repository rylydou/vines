import { get } from 'svelte/store';
import type { Game } from '.';

export const FORMAT_VERSION = 1;
export const PALETTE_VERSION = 1;

export function serialize(game: Game): any {
	const arr = ([] as any[]).concat.apply([], game.grid);
	const simplified_arr = arr.map(cell => {
		if (!cell) return null;
		if (!cell.initial) return null;
		let result = { ...cell };
		delete result.initial;
		return result;
	});

	const remapped_arr = simplified_arr.map(cell => {
		if (!cell) return 'a';
		switch (cell.id) {
			case 'wall': return 'b'; // b for block
			case 'vine': return 'v' + cell.color;
			case 'watcher': return 'w' + cell.color + cell.amount;
		}
	});

	return {
		VINES: [FORMAT_VERSION, PALETTE_VERSION],
		str: remapped_arr.join(' '),
		width: game.width,
		height: game.height,
		name: get(game.name),
		hint: get(game.hint),
	};
}

export function deserialize(game: Game, obj: any, format_version?: number, palette_version?: number): boolean {
	const width: number = obj.width;
	if (!width) return false;
	if (width <= 0) return false;

	const height: number = obj.height;
	if (!height) return false;
	if (height <= 0) return false;

	let arr: any[] = [];

	if (obj.str) {
		const parts = (obj.str as string).split(' ');
		arr = parts.map(part => {
			switch (part.charAt(0)) {
				case 'a': return null;
				case 'b': return { id: 'wall', };
				case 'v': return {
					id: 'vine', color:
						Number(part.substring(1, 2)),
				};
				case 'w': return {
					id: 'watcher',
					color: Number(part.substring(1, 2)),
					amount: Number(part.substring(2)),
				};
			}
		});
	}
	else if (obj.arr) {
		arr = obj.arr;
	}

	if (!arr || arr.length <= 0) return false;
	if (arr.length != width * height) return false;
	arr.map(x => {
		if (!x) return null;
		x.initial = true;
		return x;
	});
	const grid: any[] = [];
	while (arr.length)
		grid.push(arr.splice(0, height));

	game.width = width;
	game.height = height;
	game.grid = grid;
	game.name.set(obj.name || '');
	game.hint.set(obj.hint || '');

	return true;
}
