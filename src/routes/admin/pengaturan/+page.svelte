<script lang="ts">
	import { enhance } from '$app/forms';
	import Card from '$lib/components/ui/Card.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import Badge from '$lib/components/ui/Badge.svelte';
	import { toasts } from '$lib/stores/toast';
	import { Settings, Save, CheckCircle2, ShieldCheck, Clock, ToggleLeft, ToggleRight, AlertTriangle } from 'lucide-svelte';

	let { data, form } = $props();
	const quiz = $derived(data.quiz);

	let loading = $state(false);
	let isActive = $state(true);
	let showResult = $state(true);
	let allowRetry = $state(false);

	$effect(() => {
		if (data.quiz) {
			isActive = data.quiz.isActive;
			showResult = data.quiz.showResult;
			allowRetry = data.quiz.allowRetry;
		}
	});
</script>

<svelte:head>
	<title>Pengaturan Quiz - Admin HIMA FST UT Bandung</title>
</svelte:head>

<div class="space-y-6 max-w-4xl">
	<!-- Header -->
	<div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
		<div>
			<div class="flex items-center gap-2 mb-1">
				<Badge variant="emerald" size="sm">Konfigurasi</Badge>
				<span class="text-xs text-slate-400">Kontrol Pelaksanaan</span>
			</div>
			<h1 class="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
				Pengaturan Quiz Kaderisasi
			</h1>
			<p class="text-xs sm:text-sm text-slate-400 mt-1">
				Aktifkan/nonaktifkan pengerjaan, kontrol keterbukaan kunci jawaban, dan durasi pengerjaan.
			</p>
		</div>
	</div>

	{#if quiz}
		<form
			method="POST"
			use:enhance={() => {
				loading = true;
				return async ({ result, update }) => {
					loading = false;
					if (result.type === 'success') {
						toasts.success('Pengaturan quiz berhasil diperbarui!');
					} else if (result.type === 'failure') {
						toasts.error((result.data as any)?.error || 'Gagal menyimpan pengaturan.');
					}
					await update();
				};
			}}
			class="space-y-6"
		>
			<input type="hidden" name="id" value={quiz.id} />

			<!-- General Card -->
			<div class="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 space-y-5">
				<h2 class="text-base font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
					<Settings class="w-4 h-4 text-emerald-400" />
					<span>Informasi Umum Quiz</span>
				</h2>

				<div>
					<label for="title" class="block text-xs font-bold text-slate-300 mb-1.5">
						Judul Quiz Kaderisasi *
					</label>
					<input
						type="text"
						id="title"
						name="title"
						required
						value={quiz.title}
						class="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white font-bold outline-none focus:border-emerald-500 transition-colors"
					/>
				</div>

				<div>
					<label for="description" class="block text-xs font-bold text-slate-300 mb-1.5">
						Deskripsi / Petunjuk Awal
					</label>
					<textarea
						id="description"
						name="description"
						rows="3"
						class="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-slate-200 outline-none focus:border-emerald-500 transition-colors leading-relaxed"
					>{quiz.description || ''}</textarea>
				</div>

				<div class="max-w-xs">
					<label for="durationMinutes" class="block text-xs font-bold text-slate-300 mb-1.5">
						Alokasi Waktu (Menit) *
					</label>
					<div class="relative flex items-center">
						<input
							type="number"
							id="durationMinutes"
							name="durationMinutes"
							required
							value={quiz.durationMinutes}
							class="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white font-mono font-bold outline-none focus:border-emerald-500"
						/>
						<span class="absolute right-3.5 text-xs text-slate-500 font-semibold pointer-events-none">Menit</span>
					</div>
				</div>
			</div>

			<!-- Switches Card -->
			<div class="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
				<h2 class="text-base font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
					<ShieldCheck class="w-4 h-4 text-emerald-400" />
					<span>Kontrol Akses & Visibilitas Mahasiswa</span>
				</h2>

				<!-- Switch 1: Is Active -->
				<label class="p-4 rounded-2xl bg-slate-850 border border-slate-800 flex items-center justify-between cursor-pointer hover:border-slate-700 transition-colors">
					<div>
						<p class="text-xs font-bold text-white">Status Pelaksanaan Quiz (Buka / Tutup)</p>
						<p class="text-[11px] text-slate-400 mt-0.5">Jika nonaktif, mahasiswa tidak dapat memulai atau mengirim pengerjaan kuis.</p>
					</div>
					<input type="checkbox" name="isActive" bind:checked={isActive} class="w-5 h-5 accent-emerald-500 cursor-pointer rounded" />
				</label>

				<!-- Switch 2: Show Result & Answer Key Review -->
				<label class="p-4 rounded-2xl bg-slate-850 border border-slate-800 flex items-center justify-between cursor-pointer hover:border-slate-700 transition-colors">
					<div>
						<p class="text-xs font-bold text-white">Izinkan Mahasiswa Melihat Pembahasan & Kunci Jawaban</p>
						<p class="text-[11px] text-slate-400 mt-0.5">Jika dimatikan, mahasiswa hanya melihat nilai angka tanpa rincian kunci jawaban soal.</p>
					</div>
					<input type="checkbox" name="showResult" bind:checked={showResult} class="w-5 h-5 accent-emerald-500 cursor-pointer rounded" />
				</label>

				<!-- Switch 3: Allow Retry -->
				<label class="p-4 rounded-2xl bg-slate-850 border border-slate-800 flex items-center justify-between cursor-pointer hover:border-slate-700 transition-colors">
					<div>
						<p class="text-xs font-bold text-white">Izinkan Mahasiswa Mengerjakan Ulang (Retry)</p>
						<p class="text-[11px] text-slate-400 mt-0.5">Disarankan dimatikan (default) agar setiap mahasiswa hanya dapat mengirim quiz 1 kali.</p>
					</div>
					<input type="checkbox" name="allowRetry" bind:checked={allowRetry} class="w-5 h-5 accent-emerald-500 cursor-pointer rounded" />
				</label>
			</div>

			<div class="flex items-center justify-end gap-3 pt-2">
				<Button type="submit" variant="primary" size="lg" {loading}>
					<Save class="w-4 h-4 mr-2" />
					<span>Simpan Perubahan Pengaturan</span>
				</Button>
			</div>
		</form>
	{/if}
</div>
