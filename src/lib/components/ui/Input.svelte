<script lang="ts">
	import type { Snippet } from 'svelte';
	import { twMerge } from 'tailwind-merge';

	interface Props {
		id?: string;
		name?: string;
		type?: string;
		label?: string;
		placeholder?: string;
		value?: string | number;
		required?: boolean;
		disabled?: boolean;
		readonly?: boolean;
		error?: string;
		hint?: string;
		class?: string;
		iconLeft?: Snippet;
		iconRight?: Snippet;
		oninput?: (e: Event) => void;
		onchange?: (e: Event) => void;
	}

	let {
		id = Math.random().toString(36).substring(2, 9),
		name,
		type = 'text',
		label,
		placeholder,
		value = $bindable(''),
		required = false,
		disabled = false,
		readonly = false,
		error,
		hint,
		class: className = '',
		iconLeft,
		iconRight,
		oninput,
		onchange
	}: Props = $props();
</script>

<div class="w-full flex flex-col gap-1.5">
	{#if label}
		<label for={id} class="text-xs font-semibold text-slate-700 tracking-wide flex items-center justify-between">
			<span>{label} {#if required}<span class="text-rose-500">*</span>{/if}</span>
		</label>
	{/if}

	<div class="relative flex items-center">
		{#if iconLeft}
			<div class="absolute left-3.5 flex items-center pointer-events-none text-slate-400">
				{@render iconLeft()}
			</div>
		{/if}

		<input
			{id}
			{name}
			{type}
			{placeholder}
			bind:value
			{required}
			{disabled}
			{readonly}
			{oninput}
			{onchange}
			class={twMerge(
				'w-full bg-white border text-slate-900 text-sm rounded-xl px-4 py-2.5 transition-all duration-200 outline-none placeholder:text-slate-400',
				iconLeft ? 'pl-10' : '',
				iconRight ? 'pr-10' : '',
				error
					? 'border-rose-300 focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10'
					: 'border-slate-200 hover:border-slate-300 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10',
				disabled ? 'bg-slate-50 text-slate-400 cursor-not-allowed border-slate-200' : '',
				className
			)}
		/>

		{#if iconRight}
			<div class="absolute right-3.5 flex items-center text-slate-400">
				{@render iconRight()}
			</div>
		{/if}
	</div>

	{#if error}
		<p class="text-xs text-rose-500 font-medium flex items-center gap-1 mt-0.5">
			<svg class="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
				<path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
			</svg>
			{error}
		</p>
	{:else if hint}
		<p class="text-xs text-slate-500">{hint}</p>
	{/if}
</div>
