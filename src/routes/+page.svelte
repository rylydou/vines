<script lang="ts">
	import { smart_canvas } from '$lib/directives'
	import { scale_canvas } from '$lib/directives/canvas'
	import { grow_engine, type EngineConfig } from '$lib/directives/grow_engine'
	import { onMount } from 'svelte'

	let canvas: HTMLCanvasElement
	onMount(() => {
		const config = {
			content_root: 'content/',
		} as EngineConfig
		const engine = grow_engine(canvas, config)
		engine.start()
	})
</script>

<div class="w-full h-full grid place-items-center">
	<canvas
		bind:this={canvas}
		use:scale_canvas
		width="320"
		height="180"
		class="w-full h-full image-render-pixel bg-white"
	/>
</div>
