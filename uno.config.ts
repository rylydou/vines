import { defineConfig, presetUno, presetTypography, presetWebFonts } from 'unocss'
import extractorSvelte from '@unocss/extractor-svelte'
import transformerVariantGroup from '@unocss/transformer-variant-group'
import transformerDirectives from '@unocss/transformer-directives'
import presetIcons from '@unocss/preset-icons'

export default defineConfig({
	theme: {
		colors: {
			fg: 'var(--fg)',
			bg: 'var(--bg)',
		}
	},
	presets: [
		presetUno({ dark: 'media' }),
		presetTypography(),
		presetIcons(),
		presetWebFonts({
			provider: 'fontshare',
			fonts: {
				sans: ['Nippo']
			}
		}),
	],
	extractors: [
		extractorSvelte(),
	],
	transformers: [
		transformerVariantGroup(),
		transformerDirectives({
			applyVariable: ['--apply'],
		}),
	],
})
