<script lang="ts">
	import { twMerge } from 'tailwind-merge';

	interface Props {
		value: number; // 0 - 100
		max?: number;
		showLabel?: boolean;
		label?: string;
		color?: 'emerald' | 'blue' | 'amber';
		size?: 'sm' | 'md' | 'lg';
		class?: string;
	}

	let {
		value = 0,
		max = 100,
		showLabel = false,
		label,
		color = 'emerald',
		size = 'md',
		class: className = ''
	}: Props = $props();

	const percentage = $derived(Math.min(Math.max(0, (value / max) * 100), 100));

	const sizeStyles = {
		sm: 'h-1.5',
		md: 'h-2.5',
		lg: 'h-4'
	};

	const colorStyles = {
		emerald: 'bg-emerald-500',
		blue: 'bg-sky-500',
		amber: 'bg-amber-500'
	};
</script>

<div class={twMerge('w-full flex flex-col gap-1.5', className)}>
	{#if showLabel || label}
		<div class="flex justify-between items-center text-xs font-semibold text-slate-700">
			<span>{label || 'Progress'}</span>
			<span>{Math.round(percentage)}%</span>
		</div>
	{/if}

	<div class={twMerge('w-full bg-slate-200/80 rounded-full overflow-hidden', sizeStyles[size])}>
		<div
			class={twMerge(
				'h-full transition-all duration-300 ease-out rounded-full',
				colorStyles[color]
			)}
			style="width: {percentage}%"
		></div>
	</div>
</div>
