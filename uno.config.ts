import { defineConfig, presetUno, presetTypography, presetWebFonts } from 'unocss'
import extractorSvelte from '@unocss/extractor-svelte'
import transformerVariantGroup from '@unocss/transformer-variant-group'
import transformerDirectives from '@unocss/transformer-directives'
import presetIcons from '@unocss/preset-icons'

export default defineConfig({
	theme: {
		colors: {
			fg: '#fff4e0',
			bg: '#2c1b2e',
			yellow: '#f2b63d',
		}
	},
	presets: [
		presetUno({ dark: 'media' }),
		presetTypography(),
		presetIcons(),
		presetWebFonts({
			provider: 'fontshare',
			fonts: {
				body: ['General Sans'],
				display: ['Teko', 'Tanker', 'Nippo'],
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
