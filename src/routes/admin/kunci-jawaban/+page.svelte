<script lang="ts">
	import { enhance } from '$app/forms';
	import Card from '$lib/components/ui/Card.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import Badge from '$lib/components/ui/Badge.svelte';
	import Modal from '$lib/components/ui/Modal.svelte';
	import { toasts } from '$lib/stores/toast';
	import { KeyRound, ShieldAlert, Check, HelpCircle, Edit3, Save, PenLine, Sparkles } from 'lucide-svelte';

	let { data } = $props();
	const questions = $derived(data.questions || []);

	let editingQuestion = $state<any>(null);
	let editModalOpen = $state(false);
	let isSaving = $state(false);

	function openEditModal(q: any) {
		editingQuestion = {
			id: q.id,
			questionNumber: q.questionNumber,
			section: q.section,
			questionText: q.questionText,
			optionA: q.optionA,
			optionB: q.optionB,
			optionC: q.optionC,
			optionD: q.optionD,
			correctAnswer: q.correctAnswer || 'A',
			explanation: q.explanation || ''
		};
		editModalOpen = true;
	}
</script>

<svelte:head>
	<title>Kunci Jawaban Resmi - Admin HIMA FST UT Bandung</title>
</svelte:head>

<div class="space-y-6">
	<!-- Header -->
	<div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
		<div>
			<div class="flex items-center gap-2 mb-1">
				<Badge variant="emerald" size="sm">Master Kunci Jawaban</Badge>
				<span class="text-xs text-slate-400">30 Butir Soal Pilihan Ganda</span>
			</div>
			<h1 class="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
				Daftar Master Kunci Jawaban Essay (1–30)
			</h1>
			<p class="text-xs sm:text-sm text-slate-400 mt-1">
				Tabel pedoman referensi kunci jawaban essay (uraian deskriptif) dan pembahasan untuk setiap butir soal.
			</p>
		</div>
	</div>

	<!-- Alert Info -->
	<div class="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-start gap-3 text-xs text-slate-400">
		<ShieldAlert class="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
		<span>
			Kunci jawaban essay ini menjadi basis referensi sistem penilaian evaluasi otomatis kuis mahasiswa serta panduan pengurus dalam mereview lembar jawaban essay.
		</span>
	</div>

	<!-- Table of 30 Answer Keys -->
	<div class="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shadow-xl">
		<div class="overflow-x-auto">
			<table class="w-full text-left text-xs text-slate-300">
				<thead class="bg-slate-850 text-slate-400 uppercase tracking-wider text-[11px] font-bold border-b border-slate-800">
					<tr>
						<th class="py-3.5 px-4 w-12 text-center">No</th>
						<th class="py-3.5 px-4 w-44">Kategori</th>
						<th class="py-3.5 px-4 min-w-[260px]">Pertanyaan Essay</th>
						<th class="py-3.5 px-4 min-w-[320px]">Kunci Referensi Jawaban Essay</th>
						<th class="py-3.5 px-4 min-w-[240px]">Pembahasan & Rubrik</th>
						<th class="py-3.5 px-4 w-20 text-center">Aksi</th>
					</tr>
				</thead>
				<tbody class="divide-y divide-slate-800/80">
					{#each questions as q}
						<tr class="hover:bg-slate-800/40 transition-colors">
							<td class="py-3.5 px-4 font-mono font-bold text-white align-top text-center">
								{q.questionNumber}
							</td>
							<td class="py-3.5 px-4 font-medium text-emerald-400 align-top">
								<Badge variant="emerald" size="sm">{q.section}</Badge>
							</td>
							<td class="py-3.5 px-4 text-slate-200 align-top space-y-2">
								<p class="leading-relaxed font-semibold text-white">{q.questionText}</p>
							</td>
							<td class="py-3.5 px-4 align-top">
								<div class="p-3 rounded-xl bg-emerald-950/40 border border-emerald-800/50 text-emerald-200 text-xs leading-relaxed font-medium">
									<div class="flex items-center gap-1.5 text-emerald-400 font-bold mb-1.5 text-[11px] uppercase tracking-wide">
										<KeyRound class="w-3.5 h-3.5" />
										<span>Referensi Jawaban Resmi</span>
									</div>
									<p class="whitespace-pre-line">{q.correctAnswer}</p>
								</div>
							</td>
							<td class="py-3.5 px-4 text-slate-400 align-top">
								<div class="p-3 rounded-xl bg-slate-850/70 border border-slate-800 text-slate-300 text-xs leading-relaxed">
									{q.explanation || '-'}
								</div>
							</td>
							<td class="py-3.5 px-4 text-center align-top">
								<button
									type="button"
									onclick={() => openEditModal(q)}
									class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-700 text-emerald-400 text-xs font-bold transition-colors cursor-pointer shadow-xs"
									title="Edit Kunci Jawaban Essay & Pembahasan"
								>
									<Edit3 class="w-3.5 h-3.5" />
									<span>Edit</span>
								</button>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	</div>
</div>

<!-- Edit Kunci Jawaban Modal -->
{#if editingQuestion}
	<Modal bind:open={editModalOpen} title={`Edit Referensi Kunci Jawaban Soal #${editingQuestion.questionNumber}`} maxWidth="lg">
		<form
			action="?/updateKey"
			method="POST"
			use:enhance={() => {
				isSaving = true;
				return async ({ result, update }) => {
					isSaving = false;
					if (result.type === 'success') {
						editModalOpen = false;
						toasts.success(`Referensi kunci jawaban soal #${editingQuestion.questionNumber} berhasil diperbarui.`);
					} else {
						toasts.error('Gagal memperbarui kunci jawaban.');
					}
					await update();
				};
			}}
			class="space-y-4"
		>
			<input type="hidden" name="id" value={editingQuestion.id} />

			<div class="p-3.5 bg-slate-800/80 rounded-xl border border-slate-700 text-xs">
				<p class="text-emerald-400 font-bold mb-1">{editingQuestion.section}</p>
				<p class="text-slate-200 leading-relaxed font-semibold">{editingQuestion.questionText}</p>
			</div>

			<div class="space-y-1.5">
				<label for="correct-answer-input" class="block text-xs font-bold text-slate-200">
					Uraian Referensi Kunci Jawaban Essay:
				</label>
				<textarea
					id="correct-answer-input"
					name="correctAnswer"
					rows="4"
					required
					bind:value={editingQuestion.correctAnswer}
					placeholder="Tuliskan poin-poin dan uraian jawaban ideal..."
					class="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white text-xs leading-relaxed focus:border-emerald-500 outline-none resize-y"
				></textarea>
			</div>

			<div class="space-y-1.5">
				<label for="explanation-input" class="block text-xs font-bold text-slate-200">
					Pembahasan / Rubrik Penilaian Singkat:
				</label>
				<textarea
					id="explanation-input"
					name="explanation"
					rows="3"
					bind:value={editingQuestion.explanation}
					placeholder="Penjelasan esensi konsep..."
					class="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white text-xs leading-relaxed focus:border-emerald-500 outline-none resize-y"
				></textarea>
			</div>

			<div class="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
				<Button type="button" variant="outline" size="sm" onclick={() => (editModalOpen = false)}>
					Batal
				</Button>
				<Button type="submit" variant="primary" size="sm" loading={isSaving}>
					Simpan Perubahan
				</Button>
			</div>
		</form>
	</Modal>
{/if}
