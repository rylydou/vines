export function grow_engine(canvas: HTMLCanvasElement, config: EngineConfig) {
	const pen = canvas.getContext('2d', {}) as CanvasRenderingContext2D
	pen.imageSmoothingEnabled = false
	const speaker = new AudioContext({ latencyHint: 'interactive' })

	canvas.onpointerdown = (ev) => {
		x = ev.clientX - canvas.offsetLeft
		x *= canvas.width / canvas.clientWidth
		x = Math.round(x)

		y = ev.clientY - canvas.offsetTop
		y *= canvas.height / canvas.clientHeight
		y = Math.round(y)

		render()
	}

	async function start() {
		console.log('starting engine...')

		pen.clearRect(0, 0, canvas.width, canvas.height)
		pen.fillText('Loading...', 16, 16)

		await load_content()

		render()
	}

	let img: HTMLImageElement
	let sfx: AudioBuffer
	let x = 0
	let y = 0
	async function load_content() {
		console.log('loading atlas...')
		img = await get_image('atlas.png')
		console.log('loading sound...')
		sfx = await get_audio('sound.wav')
	}

	async function get_image(path: string): Promise<HTMLImageElement> {
		const img = new Image()
		img.src = config.content_root + path
		await (async () => new Promise(resolve => img.onload = () => resolve(true)))()
		return img
	}

	async function get_audio(path: string): Promise<AudioBuffer> {
		const response = await fetch(config.content_root + path)
		const array_buffer = await response.arrayBuffer()
		const audio_buffer = await speaker.decodeAudioData(array_buffer)
		return audio_buffer
	}

	async function render() {
		console.log('rendering...')
		pen.clearRect(0, 0, canvas.width, canvas.height)
		pen.drawImage(img, 0, 0, 16, 16, x - 16, y - 16, 32, 32)
		play_sound(sfx)
	}

	let audio_offset = 0
	async function play_sound(audio_buffer: AudioBuffer) {
		const source = speaker.createBufferSource()
		source.buffer = audio_buffer
		source.connect(speaker.destination)
		source.start()
	}

	function destroy() {
		console.log('Destroying engine')
	}

	return {
		start,
		load_content,
		destroy,
	}
}

export interface EngineConfig {
	content_root: string
}
