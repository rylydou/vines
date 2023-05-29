<script lang="ts">
	import { fill_canvas } from '$lib/directives/canvas'
	import { create_engine, type Engine } from '$lib/engine'
	import { Tile, type Game } from '$lib/game'
	import { create_game } from '$lib/game/game'
	import { onMount } from 'svelte'
	import type { Writable } from 'svelte/store'

	let canvas: HTMLCanvasElement
	let container: HTMLDivElement

	let engine: Engine
	let game: Game
	let debug_item: Writable<number>

	onMount(() => {
		engine = create_engine(canvas, { show_update_spinner: true })
		game = create_game(engine)
		debug_item = game.debug_item
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
</script>

<div bind:this={container} class="bg-[#2c1b2e] w-full h-full grid place-items-center">
	<canvas
		bind:this={canvas}
		use:fill_canvas={() => engine.render()}
		class="w-full h-full image-render-pixel"
	/>

	{#if game}
		<div class="absolute left-[50%] translate-[-50%] top-8 flex flex-row color-white">
			{#each Object.values(Tile).filter((x) => typeof x == 'string') as tile, index (tile)}
				<button
					class="px-4 py-2 font-bold bg-transparent hover:(underline decoration-2 decoration-offset-2)"
					class:bg-white={$debug_item == index}
					class:color-black={$debug_item == index}
					on:click={() => {
						if ($debug_item == index) {
							$debug_item = -1
							return
						}
						$debug_item = index
						console.log($debug_item)
					}}
				>
					{tile}
				</button>
			{/each}
		</div>
	{/if}
</div>

<button
	class="absolute z-50 bottom-6 right-6 p-2 bg-black color-white hover:(bg-white color-black)"
	on:click={fullscreen}
	title="Go fullscreen"
>
	<div class="i-pixelarticons-scale min-w-6 min-h-6" />
</button>
