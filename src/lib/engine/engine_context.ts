export interface EngineContext extends CanvasRenderingContext2D {
	play_audio: (audio_buffer: AudioBuffer) => Promise<AudioBufferSourceNode>
}
