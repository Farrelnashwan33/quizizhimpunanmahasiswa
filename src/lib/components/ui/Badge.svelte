<script lang="ts">
	import type { Snippet } from 'svelte';
	import { twMerge } from 'tailwind-merge';

	interface Props {
		variant?: 'emerald' | 'slate' | 'blue' | 'amber' | 'rose' | 'purple';
		size?: 'sm' | 'md';
		class?: string;
		children?: Snippet;
	}

	let {
		variant = 'emerald',
		size = 'md',
		class: className = '',
		children
	}: Props = $props();

	const variantStyles = {
		emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
		slate: 'bg-slate-100 text-slate-700 border-slate-200',
		blue: 'bg-sky-50 text-sky-700 border-sky-200',
		amber: 'bg-amber-50 text-amber-700 border-amber-200',
		rose: 'bg-rose-50 text-rose-700 border-rose-200',
		purple: 'bg-purple-50 text-purple-700 border-purple-200'
	};

	const sizeStyles = {
		sm: 'px-2 py-0.5 text-xs',
		md: 'px-2.5 py-1 text-xs font-semibold'
	};
</script>

<span
	class={twMerge(
		'inline-flex items-center gap-1.5 rounded-full border font-medium transition-colors',
		variantStyles[variant],
		sizeStyles[size],
		className
	)}
>
	{@render children?.()}
</span>
