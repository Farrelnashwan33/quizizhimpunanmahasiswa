<script lang="ts">
	import type { Snippet } from 'svelte';
	import { twMerge } from 'tailwind-merge';

	interface Props {
		class?: string;
		hover?: boolean;
		glass?: boolean;
		padding?: 'none' | 'sm' | 'md' | 'lg';
		children?: Snippet;
	}

	let {
		class: className = '',
		hover = false,
		glass = false,
		padding = 'md',
		children
	}: Props = $props();

	const paddingStyles = {
		none: '',
		sm: 'p-4',
		md: 'p-6',
		lg: 'p-8'
	};
</script>

<div
	class={twMerge(
		'rounded-2xl border transition-all duration-200',
		glass ? 'glass-panel shadow-sm' : 'bg-white border-slate-200/80 shadow-sm shadow-slate-200/40',
		hover ? 'hover:shadow-md hover:border-slate-300 hover:-translate-y-0.5' : '',
		paddingStyles[padding],
		className
	)}
>
	{@render children?.()}
</div>
