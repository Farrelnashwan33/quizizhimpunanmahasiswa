<script lang="ts">
	import { enhance } from '$app/forms';
	import Card from '$lib/components/ui/Card.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import Badge from '$lib/components/ui/Badge.svelte';
	import { toasts } from '$lib/stores/toast';
	import { KeyRound, ShieldAlert, Check, HelpCircle } from 'lucide-svelte';

	let { data } = $props();
	const questions = $derived(data.questions || []);

	let updatingId = $state<string | null>(null);
</script>

<svelte:head>
	<title>Kunci Jawaban Resmi - Admin HIMA FST UT Bandung</title>
</svelte:head>

<div class="space-y-6">
	<!-- Header -->
	<div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
		<div>
			<div class="flex items-center gap-2 mb-1">
				<Badge variant="emerald" size="sm">Master Key</Badge>
				<span class="text-xs text-slate-400">30 Butir Soal</span>
			</div>
			<h1 class="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
				Kunci Jawaban Resmi Quiz
			</h1>
			<p class="text-xs sm:text-sm text-slate-400 mt-1">
				Tabel ringkas kunci jawaban pilihan ganda dan pembahasan untuk setiap butir soal.
			</p>
		</div>
	</div>

	<!-- Alert Info -->
	<div class="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-start gap-3 text-xs text-slate-400">
		<ShieldAlert class="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
		<span>
			Kunci jawaban dienkripsi dan hanya dapat diakses oleh admin pengurus. Mengubah kunci jawaban di sini akan memperbarui basis data referensi penilaian masa depan.
		</span>
	</div>

	<!-- Table of 30 Answer Keys -->
	<div class="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shadow-xl">
		<div class="overflow-x-auto">
			<table class="w-full text-left text-xs text-slate-300">
				<thead class="bg-slate-850 text-slate-400 uppercase tracking-wider text-[11px] font-bold border-b border-slate-800">
					<tr>
						<th class="py-3.5 px-4 w-16">No</th>
						<th class="py-3.5 px-4 w-48">Kategori</th>
						<th class="py-3.5 px-4">Ringkasan Soal</th>
						<th class="py-3.5 px-4 w-36 text-center">Kunci Jawaban</th>
						<th class="py-3.5 px-4">Pembahasan Singkat</th>
					</tr>
				</thead>
				<tbody class="divide-y divide-slate-800/80">
					{#each questions as q}
						<tr class="hover:bg-slate-800/40 transition-colors">
							<td class="py-3.5 px-4 font-mono font-bold text-white">
								{q.questionNumber}
							</td>
							<td class="py-3.5 px-4 font-medium text-emerald-400">
								{q.section}
							</td>
							<td class="py-3.5 px-4 text-slate-200">
								<p class="line-clamp-2 max-w-md">{q.questionText}</p>
							</td>
							<td class="py-3.5 px-4 text-center">
								<form
									action="?/updateKey"
									method="POST"
									use:enhance={() => {
										updatingId = q.id;
										return async ({ result, update }) => {
											updatingId = null;
											if (result.type === 'success') {
												toasts.success(`Kunci soal #${q.questionNumber} berhasil diperbarui.`);
											} else {
												toasts.error('Gagal memperbarui kunci jawaban.');
											}
											await update();
										};
									}}
									class="inline-flex items-center gap-1.5"
								>
									<input type="hidden" name="id" value={q.id} />
									<select
										name="correctAnswer"
										value={q.correctAnswer}
										onchange={(e) => (e.target as HTMLSelectElement).form?.requestSubmit()}
										class="bg-emerald-950 border border-emerald-600 text-emerald-400 font-extrabold text-xs rounded-lg px-2.5 py-1 outline-none cursor-pointer hover:bg-emerald-900 transition-colors"
									>
										<option value="A">A</option>
										<option value="B">B</option>
										<option value="C">C</option>
										<option value="D">D</option>
									</select>
								</form>
							</td>
							<td class="py-3.5 px-4 text-slate-400">
								<p class="line-clamp-2 max-w-md text-[11px]">{q.explanation || '-'}</p>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	</div>
</div>
