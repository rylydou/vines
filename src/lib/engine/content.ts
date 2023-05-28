import type { Engine } from '.'

export interface Content {
	audio_ctx: AudioContext
	load: (path: string) => Promise<Response>
	load_image: (path: string) => Promise<HTMLImageElement>
	load_audio: (path: string, audio_ctx: AudioContext) => Promise<AudioBuffer>
}

export interface ConfigConfig {
	root_path: string
}

export function create_content(audio_ctx: AudioContext, config?: ConfigConfig): Content {
	const cfg = { root_path: 'content/', ...config }
	if (!cfg.root_path.endsWith('/')) {
		cfg.root_path += '/'
	}

	async function load(path: string): Promise<Response> {
		return fetch(cfg.root_path + path)
	}

	async function load_image(path: string): Promise<HTMLImageElement> {
		const img = new Image()
		img.src = cfg.root_path + path
		await (async () => new Promise(resolve => img.onload = () => resolve(true)))()
		return img
	}

	async function load_audio(path: string): Promise<AudioBuffer> {
		const response = await fetch(cfg.root_path + path)
		const array_buffer = await response.arrayBuffer()
		const audio_buffer = await audio_ctx.decodeAudioData(array_buffer)
		return audio_buffer
	}

	return {
		audio_ctx,
		load,
		load_image,
		load_audio,
	}
}
