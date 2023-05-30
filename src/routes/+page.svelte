<script lang="ts">
	import { fill_canvas } from '$lib/directives/canvas'
	import { create_engine, type Engine } from '$lib/engine'
	import { Tile, type Game, create_grid, type Cell } from '$lib/game'
	import { create_game } from '$lib/game/game'
	import { getAllContexts, onMount } from 'svelte'
	import type { Writable } from 'svelte/store'

	let canvas: HTMLCanvasElement
	let container: HTMLDivElement

	let engine: Engine
	let game: Game

	let editor_active: Writable<boolean>
	let editor_item: Writable<number>
	let water: Writable<number>

	onMount(() => {
		engine = create_engine(canvas, { show_update_spinner: true })
		game = create_game(engine)
		editor_item = game.editor_item
		water = game.water
		editor_active = game.editor_active
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
		game.grid = create_grid<Cell | null>(width, height, null)
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

	{#if game}
		<div class="absolute top-12 right-12">
			{#if editor_active}
				<button
					class="solid icon"
					on:click={() => {
						editor_active.update((x) => !x)
						engine.render()
					}}
				>
					{#if $editor_active}
						<div class="i-pixelarticons-close min-w-6 min-h-6" />
					{:else}
						<div class="i-pixelarticons-edit min-w-6 min-h-6" />
					{/if}
				</button>
			{/if}
		</div>

		{#if $editor_active}
			<div class="absolute right-12 flex flex-col h-96 p-4 bg-black color-white">
				<div class="flex flex-row mb-2">
					<button class="px-3 py-1" on:click={create}>
						<div class="i-pixelarticons-file-plus min-w-6 min-h-6" />
						Create
					</button>
					<button class="px-3 py-1" on:click={save}>
						<div class="i-pixelarticons-save min-w-6 min-h-6" />
						Save
					</button>
					<button class="px-3 py-1" on:click={load_from}>
						<div class="i-pixelarticons-file min-w-6 min-h-6" />
						Load
					</button>
				</div>

				<div class="flex flex-row">
					{#each Object.values(Tile).filter((x) => typeof x == 'string') as tile, index (tile)}
						<button
							class="px-1.5 py-0.5"
							class:solid-inv={$editor_item == index}
							on:click={() => {
								if ($editor_item == index) {
									$editor_item = -1
									return
								}
								$editor_item = index
							}}
						>
							{tile}
						</button>
					{/each}
				</div>

				<label class="mt-6">
					<span>Starting water</span>
					<input
						class="w-full"
						type="text"
						inputmode="numeric"
						pattern="\d*"
						bind:value={$water}
						on:change={() => engine.render()}
					/>
				</label>
			</div>
		{/if}
	{/if}
</div>

<div class="absolute z-50 bottom-12 right-12 flex flex-row-reverse gap-2">
	<button class=" solid icon" on:click={fullscreen} title="Go fullscreen">
		<div class="i-pixelarticons-scale min-w-6 min-h-6" />
	</button>
</div>
