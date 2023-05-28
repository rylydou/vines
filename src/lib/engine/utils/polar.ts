export function* polar(start: number, end: number, steps: number, f: (t: number) => number): Generator<{ x: number, y: number }> {
	const range = end - start
	const step = range / steps
	for (let t = start; t <= end; t += step) {
		const r = f(t)
		const x = r * Math.cos(t)
		const y = r * Math.sin(t)
		yield { x, y }
	}
}
