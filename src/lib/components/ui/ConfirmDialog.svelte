<script lang="ts">
	import Modal from './Modal.svelte';
	import Button from './Button.svelte';
	import { AlertTriangle } from 'lucide-svelte';

	interface Props {
		open?: boolean;
		title?: string;
		message?: string;
		confirmText?: string;
		cancelText?: string;
		variant?: 'danger' | 'primary';
		loading?: boolean;
		onconfirm?: () => void;
		oncancel?: () => void;
	}

	let {
		open = $bindable(false),
		title = 'Konfirmasi',
		message = 'Apakah Anda yakin ingin melanjutkan?',
		confirmText = 'Ya, Lanjutkan',
		cancelText = 'Batal',
		variant = 'primary',
		loading = false,
		onconfirm,
		oncancel
	}: Props = $props();

	const handleCancel = () => {
		open = false;
		if (oncancel) oncancel();
	};

	const handleConfirm = () => {
		if (onconfirm) onconfirm();
	};
</script>

<Modal bind:open maxWidth="sm">
	<div class="flex flex-col items-center text-center py-2">
		<div class="w-12 h-12 rounded-full {variant === 'danger' ? 'bg-rose-100 text-rose-600' : 'bg-emerald-100 text-emerald-600'} flex items-center justify-center mb-4">
			<AlertTriangle class="w-6 h-6" />
		</div>
		<h3 class="text-lg font-bold text-slate-900 mb-2">{title}</h3>
		<p class="text-sm text-slate-600 leading-relaxed">{message}</p>
	</div>

	{#snippet footer()}
		<Button variant="outline" onclick={handleCancel} disabled={loading}>
			{cancelText}
		</Button>
		<Button
			variant={variant === 'danger' ? 'danger' : 'primary'}
			onclick={handleConfirm}
			{loading}
		>
			{confirmText}
		</Button>
	{/snippet}
</Modal>
