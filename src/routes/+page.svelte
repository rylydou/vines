<script lang="ts">
	import { fill_canvas } from '$lib/directives/canvas'
	import { create_engine, type Engine } from '$lib/engine'
	import { Tile, type Game, create_grid } from '$lib/game'
	import { create_game } from '$lib/game/game'
	import { onMount } from 'svelte'
	import type { Writable } from 'svelte/store'

	let canvas: HTMLCanvasElement
	let container: HTMLDivElement

	let engine: Engine
	let game: Game

	let debug_item: Writable<number>
	let water: Writable<number>
	let enable_editor = true

	onMount(() => {
		engine = create_engine(canvas, { show_update_spinner: true })
		game = create_game(engine)
		debug_item = game.debug_item
		water = game.water
		engine.initialize()
	})

	function fullscreen() {
		const ele = container
		if (ele.requestFullscreen) {
			ele.requestFullscreen()
			// @ts-ignore
		} else if (ele.webkitRequestFullscreen) {
			// Safari
			// @ts-ignore
			ele.webkitRequestFullscreen()
			// @ts-ignore
		} else if (ele.msRequestFullscreen) {
			// IE11
			// @ts-ignore
			ele.msRequestFullscreen()
		}
	}

	function create() {
		const width = Number.parseInt(prompt('Level Width', '10') || '10')
		const height = Number.parseInt(prompt('Level Height', '10') || '10')
		game.grid = create_grid<Tile>(width, height, Tile.Empty)
		game.width = width
		game.height = height
		engine.render()
	}

	const PREFIX = 'puzzle3_'
	let filename = ''
	function save() {
		filename = prompt('Filename', filename) || filename
		if (!filename) return
		const json = JSON.stringify(game.grid)
		localStorage.setItem(PREFIX + filename, json)
	}

	function load_from() {
		filename = prompt('Filename', filename) || filename
		const json = localStorage.getItem(PREFIX + filename)
		if (!json) return
		game.grid = JSON.parse(json)
		game.width = game.grid.length
		game.height = game.grid[0].length
		engine.render()
	}
</script>

<div bind:this={container} class="bg-[#2c1b2e] w-full h-full grid place-items-center">
	<canvas
		bind:this={canvas}
		use:fill_canvas={() => engine.render()}
		class="w-full h-full image-render-pixel"
	/>

	{#if game && enable_editor}
		<div class="absolute right-12 flex flex-col bg-black color-white p-4">
			<div class="flex flex-row mb-6">
				<button on:click={create}>
					<div class="i-pixelarticons-file-plus min-w-6 min-h-6" />
					Create
				</button>
				<button on:click={save}>
					<div class="i-pixelarticons-save min-w-6 min-h-6" />
					Save
				</button>
				<button on:click={load_from}>
					<div class="i-pixelarticons-file min-w-6 min-h-6" />
					Load
				</button>
			</div>
			<div class="flex flex-row flex-wrap gap-1">
				{#each Object.values(Tile).filter((x) => typeof x == 'string') as tile, index (tile)}
					<button
						class:solid-inv={$debug_item == index}
						on:click={() => {
							if ($debug_item == index) {
								$debug_item = -1
								return
							}
							$debug_item = index
						}}
					>
						{tile}
					</button>
				{/each}
			</div>
		</div>
	{/if}
</div>

<button
	class="absolute z-50 bottom-12 right-12 solid icon"
	on:click={fullscreen}
	title="Go fullscreen"
>
	<div class="i-pixelarticons-scale min-w-6 min-h-6" />
</button>
