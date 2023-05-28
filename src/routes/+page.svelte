<script lang="ts">
	import { fill_canvas } from '$lib/directives/canvas'
	import { create_engine, type Engine } from '$lib/engine'
	import { onMount } from 'svelte'

	let canvas: HTMLCanvasElement
	let container: HTMLDivElement

	let engine: Engine

	onMount(() => {
		engine = create_engine(canvas, {})
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

<div bind:this={container} class="bg-black w-full h-full grid place-items-center">
	<canvas
		bind:this={canvas}
		use:fill_canvas={() => engine.render()}
		class="w-full h-full image-render-pixel bg-white"
	/>
</div>

<button
	class="absolute z-50 bottom-6 right-6 p-2 bg-black color-white hover:(bg-white color-black)"
	on:click={fullscreen}
	title="Go fullscreen"
>
	<div class="i-pixelarticons-scale min-w-6 min-h-6" />
</button>
