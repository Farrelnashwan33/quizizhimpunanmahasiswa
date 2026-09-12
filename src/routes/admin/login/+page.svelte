<script lang="ts">
	import { enhance } from '$app/forms';
	import Card from '$lib/components/ui/Card.svelte';
	import Input from '$lib/components/ui/Input.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import Badge from '$lib/components/ui/Badge.svelte';
	import logoHima from '$lib/assets/logo-hima.png';
	import { ShieldCheck, Mail, Lock, LogIn, ArrowLeft } from 'lucide-svelte';

	let { form } = $props();
	let loading = $state(false);
</script>

<svelte:head>
	<title>Login Admin Pengurus - HIMA FST UT Bandung</title>
</svelte:head>

<div class="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12 bg-linear-to-b from-slate-900 via-slate-900 to-slate-950 text-slate-100">
	<div class="max-w-md w-full">
		<!-- Header -->
		<div class="text-center mb-8">
			<div class="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-white p-2 border border-slate-700 shadow-xl mb-4 overflow-hidden">
				<img src={logoHima} alt="Logo HIMA FST UT" class="w-full h-full object-contain" />
			</div>
			<Badge variant="emerald" size="md" class="mb-3">Portal Khusus Pengurus</Badge>
			<h1 class="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
				Admin Pengurus HIMA
			</h1>
			<p class="text-sm text-slate-400 mt-2">
				Fakultas Sains dan Teknologi Universitas Terbuka Bandung
			</p>
		</div>

		<!-- Error Alert -->
		{#if form?.error}
			<div class="mb-6 p-4 rounded-xl bg-rose-950/80 border border-rose-800 text-rose-200 text-sm font-medium flex items-start gap-3 animate-in fade-in duration-200">
				<div class="shrink-0 w-5 h-5 rounded-full bg-rose-800 text-rose-100 flex items-center justify-center font-bold text-xs mt-0.5">!</div>
				<div class="flex-1">{form.error}</div>
			</div>
		{/if}

		<!-- Card Form (Dark Theme Glass) -->
		<div class="glass-panel-dark rounded-3xl p-8 shadow-2xl border border-slate-800">
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
				<div>
					<label for="email" class="text-xs font-semibold text-slate-300 tracking-wide block mb-1.5">
						Email Akun Admin <span class="text-emerald-400">*</span>
					</label>
					<div class="relative flex items-center">
						<div class="absolute left-3.5 flex items-center pointer-events-none text-slate-400">
							<Mail class="w-4 h-4" />
						</div>
						<input
							type="email"
							name="email"
							id="email"
							required
							placeholder="admin@hima-fst.ut.ac.id"
							value={form?.values?.email || ''}
							class="w-full bg-slate-800/90 border border-slate-700 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/20 text-white text-sm rounded-xl pl-10 pr-4 py-2.5 outline-none transition-all placeholder:text-slate-500"
						/>
					</div>
				</div>

				<div>
					<label for="password" class="text-xs font-semibold text-slate-300 tracking-wide block mb-1.5">
						Kata Sandi Admin <span class="text-emerald-400">*</span>
					</label>
					<div class="relative flex items-center">
						<div class="absolute left-3.5 flex items-center pointer-events-none text-slate-400">
							<Lock class="w-4 h-4" />
						</div>
						<input
							type="password"
							name="password"
							id="password"
							required
							placeholder="••••••••"
							class="w-full bg-slate-800/90 border border-slate-700 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/20 text-white text-sm rounded-xl pl-10 pr-4 py-2.5 outline-none transition-all placeholder:text-slate-500"
						/>
					</div>
				</div>

				<div class="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700 text-xs text-slate-300">
					<div class="flex items-center justify-between font-semibold text-emerald-400 mb-1">
						<span>Akun Admin Default:</span>
						<span class="text-[10px] bg-emerald-950 text-emerald-300 px-2 py-0.5 rounded border border-emerald-800">Siap Pakai</span>
					</div>
					<div class="font-mono text-[11px] text-slate-300 space-y-0.5">
						<div>Email: <strong class="text-white">admin@hima-fst.ut.ac.id</strong></div>
						<div>Password: <strong class="text-white">admin123</strong></div>
					</div>
				</div>

				<div class="pt-2">
					<Button type="submit" variant="primary" size="lg" fullWidth {loading}>
						<LogIn class="w-4 h-4 mr-2" />
						<span>Masuk Dashboard Admin</span>
					</Button>
				</div>
			</form>

			<div class="mt-6 pt-6 border-t border-slate-800 text-center">
				<a href="/" class="inline-flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-emerald-400 transition-colors">
					<ArrowLeft class="w-3.5 h-3.5" />
					Kembali ke Beranda
				</a>
			</div>
		</div>

		<div class="mt-6 text-center text-xs text-slate-500">
			Panel ini dienkripsi khusus untuk jajaran pengurus & panitia kaderisasi HIMA FST UT Bandung.
		</div>
	</div>
</div>
