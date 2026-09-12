<script lang="ts">
	import type { Snippet } from 'svelte';
	import { clsx } from 'clsx';
	import { twMerge } from 'tailwind-merge';

	interface Props {
		type?: 'button' | 'submit' | 'reset';
		variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost' | 'emerald-light';
		size?: 'sm' | 'md' | 'lg';
		disabled?: boolean;
		loading?: boolean;
		fullWidth?: boolean;
		class?: string;
		href?: string;
		id?: string;
		onclick?: (e: MouseEvent) => void;
		children?: Snippet;
	}

	let {
		type = 'button',
		variant = 'primary',
		size = 'md',
		disabled = false,
		loading = false,
		fullWidth = false,
		class: className = '',
		href = '',
		id,
		onclick,
		children
	}: Props = $props();

	const variantStyles = {
		primary: 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm shadow-emerald-600/20 active:bg-emerald-800 focus-visible:ring-emerald-500',
		secondary: 'bg-slate-900 hover:bg-slate-800 text-white shadow-sm active:bg-slate-950 focus-visible:ring-slate-900',
		outline: 'border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 hover:border-slate-400 active:bg-slate-100 focus-visible:ring-emerald-500',
		danger: 'bg-red-600 hover:bg-red-700 text-white shadow-sm active:bg-red-800 focus-visible:ring-red-500',
		ghost: 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 active:bg-slate-200 focus-visible:ring-slate-400',
		'emerald-light': 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 active:bg-emerald-200 border border-emerald-200 focus-visible:ring-emerald-500'
	};

	const sizeStyles = {
		sm: 'px-3 py-1.5 text-xs font-medium rounded-lg gap-1.5',
		md: 'px-4 py-2.5 text-sm font-medium rounded-xl gap-2',
		lg: 'px-6 py-3.5 text-base font-semibold rounded-2xl gap-2.5'
	};

	const mergedClass = $derived(
		twMerge(
			'inline-flex items-center justify-center font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed disabled:pointer-events-none cursor-pointer',
			variantStyles[variant],
			sizeStyles[size],
			fullWidth ? 'w-full' : '',
			className
		)
	);
</script>

{#if href}
	<a {href} {id} class={mergedClass} aria-disabled={disabled}>
		{#if loading}
			<svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
				<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
				<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
			</svg>
		{/if}
		{@render children?.()}
	</a>
{:else}
	<button
		{type}
		{id}
		disabled={disabled || loading}
		class={mergedClass}
		{onclick}
	>
		{#if loading}
			<svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
				<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
				<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
			</svg>
		{/if}
		{@render children?.()}
	</button>
{/if}
