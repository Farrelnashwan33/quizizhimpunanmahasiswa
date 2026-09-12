<script lang="ts">
	import { enhance } from '$app/forms';
	import { page } from '$app/state';
	import Card from '$lib/components/ui/Card.svelte';
	import Input from '$lib/components/ui/Input.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import Badge from '$lib/components/ui/Badge.svelte';
	import { GraduationCap, Mail, Lock, LogIn, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-svelte';

	let { form } = $props();
	let loading = $state(false);

	const isRegistered = $derived(page.url.searchParams.get('registered') === 'true');
</script>

<svelte:head>
	<title>Masuk Mahasiswa - Quiz Kaderisasi I HIMA FST</title>
</svelte:head>

<div class="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12 bg-linear-to-b from-emerald-50/40 via-slate-50 to-slate-100">
	<div class="max-w-md w-full">
		<!-- Header -->
		<div class="text-center mb-8">
			<div class="inline-flex items-center justify-center w-14 h-14 rounded-2xl emerald-gradient text-white shadow-lg shadow-emerald-600/20 mb-4">
				<GraduationCap class="w-8 h-8" />
			</div>
			<Badge variant="emerald" size="md" class="mb-3">Portal Mahasiswa</Badge>
			<h1 class="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
				Masuk ke Quiz Kaderisasi
			</h1>
			<p class="text-sm text-slate-600 mt-2">
				HIMA Fakultas Sains dan Teknologi UT Bandung
			</p>
		</div>

		<!-- Registration success alert -->
		{#if isRegistered}
			<div class="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-medium flex items-start gap-3 animate-in fade-in duration-200">
				<CheckCircle2 class="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
				<div>
					<p class="font-bold">Pendaftaran Berhasil!</p>
					<p class="text-xs text-emerald-700 mt-0.5">Akun Anda telah aktif. Silakan masukkan email dan password untuk mulai mengerjakan quiz.</p>
				</div>
			</div>
		{/if}

		<!-- Error Alert -->
		{#if form?.error}
			<div class="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm font-medium flex items-start gap-3 animate-in fade-in duration-200">
				<div class="shrink-0 w-5 h-5 rounded-full bg-rose-200 text-rose-700 flex items-center justify-center font-bold text-xs mt-0.5">!</div>
				<div class="flex-1">{form.error}</div>
			</div>
		{/if}

		<!-- Card Form -->
		<Card glass padding="lg" class="shadow-xl">
			<form
				method="POST"
				use:enhance={() => {
					loading = true;
					return async ({ update }) => {
						loading = false;
						await update();
					};
				}}
				class="space-y-4"
			>
				<Input
					label="Alamat Email"
					type="email"
					name="email"
					id="email"
					required
					placeholder="nama@ecampus.ut.ac.id"
					value={form?.values?.email || ''}
				>
					{#snippet iconLeft()}
						<Mail class="w-4 h-4" />
					{/snippet}
				</Input>

				<Input
					label="Kata Sandi (Password)"
					type="password"
					name="password"
					id="password"
					required
					placeholder="Masukkan password Anda"
				>
					{#snippet iconLeft()}
						<Lock class="w-4 h-4" />
					{/snippet}
				</Input>

				<div class="pt-2">
					<Button type="submit" variant="primary" size="lg" fullWidth {loading}>
						<LogIn class="w-4 h-4 mr-2" />
						<span>Masuk Mahasiswa</span>
					</Button>
				</div>
			</form>

			<div class="mt-6 pt-6 border-t border-slate-100 flex flex-col gap-3 text-center">
				<p class="text-xs text-slate-600">
					Belum memiliki akun peserta?
					<a href="/register" class="font-bold text-emerald-600 hover:text-emerald-700 hover:underline ml-1">
						Daftar Sekarang
					</a>
				</p>

				<div class="pt-2">
					<a href="/admin/login" class="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors">
						<ShieldCheck class="w-3.5 h-3.5" />
						Login sebagai Admin Pengurus HIMA
					</a>
				</div>
			</div>
		</Card>
	</div>
</div>
