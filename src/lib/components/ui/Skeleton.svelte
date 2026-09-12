<script lang="ts">
	import { twMerge } from 'tailwind-merge';

	interface Props {
		class?: string;
		shape?: 'rectangle' | 'circle' | 'text';
	}

	let { class: className = '', shape = 'rectangle' }: Props = $props();

	const shapeStyles = {
		rectangle: 'rounded-xl',
		circle: 'rounded-full',
		text: 'rounded-md h-4 w-full'
	};
</script>

<div
	class={twMerge(
		'animate-pulse bg-slate-200/80',
		shapeStyles[shape],
		className
	)}
></div>
