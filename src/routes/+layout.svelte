<script lang="ts">
	// Reset CSS
	import '@unocss/reset/tailwind-compat.css'
	import '@unocss/reset/sanitize/reduce-motion.css'
	// Atomic CSS
	import 'uno.css'
	// Custom CSS
	import '$lib/styles.css'
</script>

<slot>This page has no content</slot>

<style lang="postcss">
	:global(body) {
		height: 100dvh;
		@apply font-body font-medium select-none bg-black color-white;
	}
</style>
