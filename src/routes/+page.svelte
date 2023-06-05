<script lang="ts">
	import { fill_canvas } from '$lib/directives/canvas'
	import { create_engine, type Engine } from '$lib/engine'
	import {
		cells,
		cells_with_amount,
		cells_with_color,
		color_palettes,
		create_game,
		create_grid,
		deserialize,
		serialize,
		type Cell,
		type Game,
	} from '$lib/game'
	import { onMount } from 'svelte'
	import type { Writable } from 'svelte/store'

	let canvas: HTMLCanvasElement
	let container: HTMLDivElement

	let engine: Engine
	let game: Game

	let editor_active: Writable<boolean>
	let editor_item: Writable<string | null>
	let editor_color: Writable<number>
	let editor_amount: Writable<number>

	let is_beaten: Writable<boolean>
	let name: Writable<string>
	let hint: Writable<string>

	let meta_page = false

	onMount(async function () {
		engine = create_engine(canvas, {})
		game = create_game(engine)
		editor_item = game.editor_item
		editor_active = game.editor_active
		editor_color = game.editor_color
		editor_amount = game.editor_amount

		is_beaten = game.is_beaten
		name = game.name
		hint = game.hint

		await engine.initialize()

		load_level()
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
		let input: string | null

		input = prompt('Level Width', '8')
		if (!input) return
		const width = Number.parseInt(input)

		input = prompt('Level Height', '6')
		if (!input) return
		const height = Number.parseInt(input)

		game.grid = create_grid<Cell | null>(width, height, null)
		game.width = width
		game.height = height
		engine.render()
	}

	const PREFIX = 'puzzle3_'
	let input = ''
	function save() {
		input = prompt('Filename', input) || input
		if (!input) return

		const obj = serialize(game)
		const json = JSON.stringify(obj)
		localStorage.setItem(PREFIX + input, json)
	}

	function load() {
		input = prompt('Filename or JSON', input) || input
		input.trim()
		if (!input) return

		let json: string | null
		if (input.startsWith('{') && input.endsWith('}')) {
			json = input
		} else {
			json = localStorage.getItem(PREFIX + input.toLowerCase())
		}

		if (!json) return

		const obj = JSON.parse(json)
		if (!deserialize(game, obj)) {
			console.error('An error occurred while deserializing level json!')
			return
		}

		engine.render()
	}

	function copy_json() {
		const obj = serialize(game)
		const json = JSON.stringify(obj)
		navigator.clipboard.writeText(json)
	}

	let levels = ['tut1', 'tut2', 'tut3', 'lvl_watchers', 'lvl_rgb', 'lvl_rgby']
	let level_index = 0

	function next_level() {
		if (level_index < levels.length - 1) level_index++
		load_level()
	}

	function prev_level() {
		if (level_index > 0) level_index--
		load_level()
	}

	async function load_level() {
		const responce = await fetch('/data/levels/' + levels[level_index] + '.json')
		const obj = await responce.json()
		is_beaten.set(false)
		deserialize(game, obj)
		engine.render()
	}
</script>

<div bind:this={container} class="bg-[#2c1b2e] w-full h-full grid place-items-center">
	<canvas
		bind:this={canvas}
		use:fill_canvas={() => engine.render()}
		class="w-full h-full font-display"
	/>

	{#if game}
		{#if $hint}
			<div
				class="absolute bottom-12 flex flex-row gap-2 p-2 pr-4 bg-black color-white transition-opacity-1000 hover:opacity-10 hover:transition-opacity-100"
			>
				<div class="i-pixelarticons-info-box min-w-6 min-h-6" />
				{$hint}
			</div>
		{/if}

		<div class="absolute top-12 left-12 flex flex-row gap-2">
			{#if level_index < levels.length - 1}
				<button on:click={next_level} class="solid" class:solid-inv={$is_beaten}>
					{#if $is_beaten}
						Next Level
					{:else}
						Skip Level
					{/if}
				</button>
			{/if}
			{#if level_index > 0}
				<button on:click={prev_level} class="solid"> Previous Level </button>
			{/if}
		</div>

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
			<div class="absolute right-12 flex flex-col max-w-sm h-96 p-4 bg-black color-white">
				<h1 class="color-red mb-2">Level Editor (not the game)</h1>

				<div class="flex flex-row flex-wrap gap-2 mb-4">
					<button class="px-3 py-1" on:click={create}>
						<div class="i-pixelarticons-file-plus min-w-6 min-h-6" />
						Create
					</button>
					<button class="px-3 py-1" on:click={save}>
						<div class="i-pixelarticons-save min-w-6 min-h-6" />
						Save
					</button>
					<button class="px-3 py-1" on:click={load}>
						<div class="i-pixelarticons-file min-w-6 min-h-6" />
						Load
					</button>
					<button class="px-3 py-1" on:click={copy_json}>
						<div class="i-pixelarticons-code min-w-6 min-h-6" />
						Copy JSON
					</button>
				</div>

				<div class="flex flex-row w-full mb-4">
					<button
						class="w-full"
						class:solid-inv={meta_page == false}
						on:click={() => (meta_page = false)}>Tiles</button
					>
					<button
						class="w-full"
						class:solid-inv={meta_page == true}
						on:click={() => (meta_page = true)}>Metadata</button
					>
				</div>

				{#if meta_page}
					<label>
						<span>Name</span>
						<input type="text" bind:value={$name} />
					</label>

					<label>
						<span>Tutorial Text</span>
						<textarea rows="4" bind:value={$hint} />
					</label>
				{:else}
					<div class="flex flex-row">
						{#each cells as cell, index (index)}
							<button
								class="px-1.5 py-0.5"
								class:solid-inv={$editor_item == cell}
								on:click={() => {
									if ($editor_item == cell) {
										$editor_item = null
										return
									}
									$editor_item = cell
								}}
							>
								{cell}
							</button>
						{/each}
					</div>

					<div class="my-2 flex flex-col gap-2">
						{#if cells_with_color.indexOf($editor_item || '') >= 0}
							<div class="w-full h-10 flex flex-row justify-stretch gap-2">
								{#each color_palettes as palette, index (index)}
									<button
										on:click={() => ($editor_color = index)}
										class="w-full p-0 justify-center items-center color-black"
										style="background-color: {palette.fg};"
									>
										{#if index == $editor_color}
											<div class="i-pixelarticons-drop-full min-w-6 min-h-6" />
										{:else}
											{palette.char}
										{/if}
									</button>
								{/each}
							</div>
						{/if}
						{#if cells_with_amount.indexOf($editor_item || '') >= 0}
							<label>
								<span>Amount</span>
								<div class="flex flex-row">
									<input class="flex-grow w-0 min-w-0" type="number" bind:value={$editor_amount} />
									<button class="p-2 ml-2" on:click={() => $editor_amount++}>
										<div class="i-pixelarticons-plus min-w-6 min-h-6" />
									</button>
									<button class="p-2" on:click={() => $editor_amount--}>
										<div class="i-pixelarticons-minus min-w-6 min-h-6" />
									</button>
								</div>
							</label>
						{/if}
					</div>
				{/if}
			</div>
		{/if}
	{/if}
</div>

<div class="absolute z-50 bottom-12 right-12 flex flex-row-reverse gap-2">
	<button class=" solid icon" on:click={fullscreen} title="Go fullscreen">
		<div class="i-pixelarticons-scale min-w-6 min-h-6" />
	</button>
</div>
