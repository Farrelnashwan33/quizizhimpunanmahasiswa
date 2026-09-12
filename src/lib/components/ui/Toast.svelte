<script lang="ts">
	import { toasts } from '$lib/stores/toast';
	import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-svelte';

	const typeIcons = {
		success: CheckCircle2,
		error: AlertCircle,
		info: Info,
		warning: AlertTriangle
	};

	const typeStyles = {
		success: 'bg-white border-emerald-200 text-emerald-900 shadow-emerald-500/10',
		error: 'bg-white border-rose-200 text-rose-900 shadow-rose-500/10',
		info: 'bg-white border-sky-200 text-sky-900 shadow-sky-500/10',
		warning: 'bg-white border-amber-200 text-amber-900 shadow-amber-500/10'
	};

	const iconColors = {
		success: 'text-emerald-500',
		error: 'text-rose-500',
		info: 'text-sky-500',
		warning: 'text-amber-500'
	};
</script>

<div class="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-4 sm:px-0">
	{#each $toasts as toast (toast.id)}
		{@const Icon = typeIcons[toast.type]}
		<div
			class="pointer-events-auto flex items-start gap-3 p-4 rounded-2xl border shadow-xl transition-all duration-300 transform translate-y-0 animate-in slide-in-from-bottom-5 fade-in {typeStyles[toast.type]}"
			role="alert"
		>
			<div class="shrink-0 mt-0.5 {iconColors[toast.type]}">
				<Icon class="w-5 h-5" />
			</div>
			<div class="flex-1 text-sm font-medium leading-snug">
				{toast.message}
			</div>
			<button
				type="button"
				class="shrink-0 text-slate-400 hover:text-slate-700 p-0.5 rounded-lg transition-colors"
				onclick={() => toasts.remove(toast.id)}
				aria-label="Tutup notifikasi"
			>
				<X class="w-4 h-4" />
			</button>
		</div>
	{/each}
</div>
