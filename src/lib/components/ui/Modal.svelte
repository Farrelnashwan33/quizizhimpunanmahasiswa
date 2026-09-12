<script lang="ts">
	import type { Snippet } from 'svelte';
	import { twMerge } from 'tailwind-merge';

	interface Props {
		open?: boolean;
		title?: string;
		maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
		onclose?: () => void;
		children?: Snippet;
		footer?: Snippet;
	}

	let {
		open = $bindable(false),
		title,
		maxWidth = 'md',
		onclose,
		children,
		footer
	}: Props = $props();

	const maxWidthStyles = {
		sm: 'max-w-sm',
		md: 'max-w-md',
		lg: 'max-w-lg',
		xl: 'max-w-xl',
		'2xl': 'max-w-2xl'
	};

	const handleClose = () => {
		open = false;
		if (onclose) onclose();
	};

	const handleKeydown = (e: KeyboardEvent) => {
		if (e.key === 'Escape' && open) {
			handleClose();
		}
	};
</script>

<svelte:window onkeydown={handleKeydown} />

{#if open}
	<div
		class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200"
		role="dialog"
		aria-modal="true"
	>
		<!-- Backdrop click -->
		<button
			type="button"
			class="fixed inset-0 w-full h-full cursor-default bg-transparent border-none"
			onclick={handleClose}
			tabindex="-1"
			aria-label="Tutup modal"
		></button>

		<!-- Modal Container -->
		<div
			class={twMerge(
				'relative z-10 w-full bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden transform transition-all duration-200 animate-in zoom-in-95',
				maxWidthStyles[maxWidth]
			)}
		>
			{#if title}
				<div class="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
					<h3 class="text-lg font-bold text-slate-900">{title}</h3>
					<button
						type="button"
						class="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
						onclick={handleClose}
						aria-label="Tutup"
					>
						<svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
							<line x1="18" y1="6" x2="6" y2="18"></line>
							<line x1="6" y1="6" x2="18" y2="18"></line>
						</svg>
					</button>
				</div>
			{/if}

			<div class="px-6 py-5 max-h-[75vh] overflow-y-auto">
				{@render children?.()}
			</div>

			{#if footer}
				<div class="px-6 py-4 border-t border-slate-100 bg-slate-50/80 flex items-center justify-end gap-3">
					{@render footer()}
				</div>
			{/if}
		</div>
	</div>
{/if}
