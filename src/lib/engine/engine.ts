import { create_content, type ConfigConfig, type Content } from '.'
import type { EngineContext } from './engine_context'
import { polar } from './utils'

export interface Engine {
	is_ready: boolean
	error?: string
	show_update_spinner: boolean

	readonly canvas: HTMLCanvasElement
	readonly gfx: CanvasRenderingContext2D
	readonly audio: AudioContext
	readonly content: Content

	readonly initialize: () => Promise<void>
	load_content: () => Promise<void>
	start: () => void

	readonly render: () => void
	on_render: () => void
	on_render_loading: (progress: number) => void
	on_render_error: () => void

	readonly play_audio: (audio_buffer: AudioBuffer) => AudioBufferSourceNode
	readonly transform_client_point: (cx: number, cy: number) => { x: number, y: number }
}

export interface EngineConfig {
	show_update_spinner?: boolean

	content?: ConfigConfig

	gfx_settings?: CanvasRenderingContext2DSettings
	gfx_image_smoothing?: boolean

	audio_options?: AudioContextOptions
}

export function create_engine(canvas: HTMLCanvasElement, config: EngineConfig): Engine {
	const gfx = canvas.getContext('2d', config.gfx_settings) as CanvasRenderingContext2D
	gfx.imageSmoothingEnabled = config.gfx_image_smoothing || false
	const audio = new AudioContext(config.audio_options)
	const content = create_content(audio, config.content)

	let frame_index = 0

	return {
		is_ready: false,
		show_update_spinner: config.show_update_spinner || import.meta.env.DEV,

		canvas,
		gfx,
		audio,
		content,

		initialize: async function (): Promise<void> {
			console.log('loading game...')
			this.on_render_loading(-1)

			console.time('loaded game')
			await this.load_content()
			console.timeEnd('loaded game')

			this.is_ready = true

			console.log('starting...')
			this.start()
			console.log('initial render...')
			this.render()
			console.log('initial render successful!')

			let last_dpr = window.devicePixelRatio
			window.addEventListener('resize', () => {
				const dpr = window.devicePixelRatio
				if (last_dpr != dpr) {
					last_dpr = dpr
					this.render()
				}
			})
			window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', this.render)
		},
		load_content: async function (): Promise<void> { },
		start: function () { },
		render: function () {
			const start_time = performance.now()

			if (this.error)
				this.on_render_error()
			else if (this.is_ready)
				this.on_render()
			else
				this.on_render_loading(-1)

			const end_time = performance.now()
			const time_taken = end_time - start_time

			if (this.show_update_spinner && !document.fullscreenElement) {
				gfx.save()
				gfx.resetTransform()

				gfx.translate(64, 64)

				gfx.font = 'bold 20px monospace'
				gfx.textAlign = 'center'
				gfx.textBaseline = 'top'
				gfx.fillStyle = 'red'
				gfx.filter = 'drop-shadow(0 0 6px black)'
				gfx.fillStyle = 'white'
				gfx.fillText(`${time_taken}ms`, 0, 32)
				gfx.filter = 'none'

				gfx.beginPath()
				gfx.ellipse(0, 0, 20, 20, 0, 0, 2 * Math.PI)
				gfx.fillStyle = 'black'
				gfx.strokeStyle = 'white'
				gfx.lineWidth = 4
				gfx.lineCap = 'round'
				gfx.fill()
				gfx.stroke()

				gfx.rotate(frame_index++ / 12 * 2 * Math.PI)

				gfx.beginPath()
				gfx.moveTo(0, 0)
				gfx.lineTo(0, -10)
				gfx.stroke()

				gfx.restore()
			}
		},
		on_render: function () {
			gfx.save()

			gfx.resetTransform()
			gfx.clearRect(0, 0, canvas.width, canvas.height)

			gfx.translate(canvas.width / 2, canvas.height / 2)
			gfx.beginPath()
			const a = Math.min(canvas.width, canvas.height) * 0.4
			const b = 4
			for (const { x, y } of polar(-1.1 * Math.PI, 1.1 * Math.PI, 256, (t) => a * Math.cos(b * t))) {
				gfx.lineTo(x, y)
			}
			gfx.fillStyle = 'pink'
			gfx.fill()

			gfx.beginPath()
			const r = Math.min(canvas.width, canvas.height) * 0.1
			gfx.ellipse(0, 0, r, r, 0, 0, 2 * Math.PI)
			gfx.fillStyle = 'yellow'
			gfx.strokeStyle = 'black'
			gfx.lineWidth = 4
			gfx.fill()
			gfx.stroke()

			gfx.restore()
		},
		on_render_loading: function (progress: number) {
			gfx.save()
			gfx.resetTransform()
			gfx.clearRect(0, 0, canvas.width, canvas.height)

			const text = progress > 0 ? `Loading ${Math.round(progress * 100)}%` : 'Loading...'

			gfx.font = 'bold 32px sans-serif'
			gfx.textAlign = 'center'
			gfx.textBaseline = 'middle'
			gfx.fillStyle = 'white'
			gfx.filter = 'blur(0 0 6px black)'
			gfx.fillText(text, (canvas.width) / 2, (canvas.height) / 2)

			gfx.restore()
		},
		on_render_error: function () {
			gfx.save()
			gfx.resetTransform()
			gfx.clearRect(0, 0, canvas.width, canvas.height)
			gfx.font = 'monospace 32px'
			gfx.textAlign = 'center'
			gfx.textBaseline = 'middle'
			if (this.error)
				gfx.fillText('ERROR: ' + this.error, (canvas.width) / 2, (canvas.height) / 2)
			else
				gfx.fillText('An unknown error has occurred', (canvas.width) / 2, (canvas.height) / 2)
			gfx.restore()
		},

		play_audio: function (audio_buffer: AudioBuffer): AudioBufferSourceNode {
			const source = audio.createBufferSource()
			source.buffer = audio_buffer
			source.connect(audio.destination)
			source.start()
			return source
		},
		transform_client_point: function (cx: number, cy: number) {
			let x, y = 0
			x = cx - canvas.offsetLeft
			x *= canvas.width / canvas.clientWidth
			x = Math.round(x)

			y = cy - canvas.offsetTop
			y *= canvas.height / canvas.clientHeight
			y = Math.round(y)

			return { x, y }
		}
	}
}
