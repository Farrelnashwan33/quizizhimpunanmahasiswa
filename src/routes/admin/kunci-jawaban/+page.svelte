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
				Kunci Jawaban Resmi Quiz
			</h1>
			<p class="text-xs sm:text-sm text-slate-400 mt-1">
				Tabel ringkas pedoman kunci jawaban pilihan ganda (A/B/C/D) dan pembahasan untuk setiap butir soal.
			</p>
		</div>
	</div>

	<!-- Alert Info -->
	<div class="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-start gap-3 text-xs text-slate-400">
		<ShieldAlert class="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
		<span>
			Kunci jawaban dienkripsi dan hanya dapat diakses oleh admin pengurus. Mengubah kunci jawaban di sini akan memperbarui basis data referensi penilaian evaluasi otomatis mahasiswa.
		</span>
	</div>

	<!-- Table of 30 Answer Keys -->
	<div class="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shadow-xl">
		<div class="overflow-x-auto">
			<table class="w-full text-left text-xs text-slate-300">
				<thead class="bg-slate-850 text-slate-400 uppercase tracking-wider text-[11px] font-bold border-b border-slate-800">
					<tr>
						<th class="py-3.5 px-4 w-14">No</th>
						<th class="py-3.5 px-4 w-40">Kategori</th>
						<th class="py-3.5 px-4 min-w-[240px]">Pertanyaan & Opsi</th>
						<th class="py-3.5 px-4 min-w-[140px]">Kunci Resmi</th>
						<th class="py-3.5 px-4 min-w-[220px]">Pembahasan Singkat</th>
						<th class="py-3.5 px-4 w-20 text-center">Aksi</th>
					</tr>
				</thead>
				<tbody class="divide-y divide-slate-800/80">
					{#each questions as q}
						<tr class="hover:bg-slate-800/40 transition-colors">
							<td class="py-3.5 px-4 font-mono font-bold text-white align-top">
								{q.questionNumber}
							</td>
							<td class="py-3.5 px-4 font-medium text-emerald-400 align-top">
								{q.section}
							</td>
							<td class="py-3.5 px-4 text-slate-200 align-top space-y-2">
								<p class="leading-relaxed font-semibold">{q.questionText}</p>
								<div class="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-[11px] pt-1">
									<div class="p-1.5 rounded-lg border {q.correctAnswer === 'A' ? 'bg-emerald-950/60 border-emerald-700 text-emerald-300 font-bold' : 'bg-slate-850/60 border-slate-800 text-slate-400'}">
										<span class="font-bold">A.</span> {q.optionA}
									</div>
									<div class="p-1.5 rounded-lg border {q.correctAnswer === 'B' ? 'bg-emerald-950/60 border-emerald-700 text-emerald-300 font-bold' : 'bg-slate-850/60 border-slate-800 text-slate-400'}">
										<span class="font-bold">B.</span> {q.optionB}
									</div>
									<div class="p-1.5 rounded-lg border {q.correctAnswer === 'C' ? 'bg-emerald-950/60 border-emerald-700 text-emerald-300 font-bold' : 'bg-slate-850/60 border-slate-800 text-slate-400'}">
										<span class="font-bold">C.</span> {q.optionC}
									</div>
									<div class="p-1.5 rounded-lg border {q.correctAnswer === 'D' ? 'bg-emerald-950/60 border-emerald-700 text-emerald-300 font-bold' : 'bg-slate-850/60 border-slate-800 text-slate-400'}">
										<span class="font-bold">D.</span> {q.optionD}
									</div>
								</div>
							</td>
							<td class="py-3.5 px-4 align-top">
								<div class="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-950 border border-emerald-700 text-emerald-300 font-bold text-sm shadow-xs">
									<KeyRound class="w-3.5 h-3.5 text-emerald-400" />
									<span>Opsi {q.correctAnswer}</span>
								</div>
							</td>
							<td class="py-3.5 px-4 text-slate-400 align-top">
								<div class="p-2.5 rounded-xl bg-slate-850/60 border border-slate-800 text-slate-300 text-xs leading-relaxed">
									{q.explanation || '-'}
								</div>
							</td>
							<td class="py-3.5 px-4 text-center align-top">
								<button
									type="button"
									onclick={() => openEditModal(q)}
									class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-700 text-emerald-400 text-xs font-bold transition-colors cursor-pointer shadow-xs"
									title="Edit Kunci Jawaban & Pembahasan"
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
	<Modal bind:open={editModalOpen} title={`Edit Kunci Jawaban Soal #${editingQuestion.questionNumber}`} maxWidth="lg">
		<form
			action="?/updateKey"
			method="POST"
			use:enhance={() => {
				isSaving = true;
				return async ({ result, update }) => {
					isSaving = false;
					if (result.type === 'success') {
						editModalOpen = false;
						toasts.success(`Kunci jawaban soal #${editingQuestion.questionNumber} berhasil diperbarui.`);
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

			<div class="space-y-2">
				<label class="block text-xs font-bold text-slate-200">
					Pilih Opsi Kunci Jawaban Benar:
				</label>
				<div class="grid grid-cols-2 gap-2">
					{#each ['A', 'B', 'C', 'D'] as opt}
						<label class="flex items-center gap-2.5 p-3 rounded-xl border cursor-pointer transition-colors {editingQuestion.correctAnswer === opt ? 'bg-emerald-950/80 border-emerald-600 text-emerald-300' : 'bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-850'}">
							<input
								type="radio"
								name="correctAnswer"
								value={opt}
								bind:group={editingQuestion.correctAnswer}
								class="accent-emerald-500 w-4 h-4"
							/>
							<span class="font-bold text-xs">Opsi {opt}</span>
						</label>
					{/each}
				</div>
			</div>

			<div class="space-y-1.5">
				<label for="modal-explanation" class="block text-xs font-bold text-slate-200">
					Pembahasan Singkat:
				</label>
				<textarea
					id="modal-explanation"
					name="explanation"
					rows="3"
					bind:value={editingQuestion.explanation}
					placeholder="Tuliskan pembahasan singkat atau poin penting soal ini..."
					class="w-full p-3 bg-slate-900 border border-slate-700 focus:border-emerald-500 rounded-xl text-xs text-slate-100 outline-none leading-relaxed transition-colors"
				></textarea>
			</div>

			<div class="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
				<Button type="button" variant="outline" size="sm" onclick={() => editModalOpen = false}>
					Batal
				</Button>
				<Button type="submit" variant="primary" size="sm" loading={isSaving}>
					<Save class="w-3.5 h-3.5 mr-1.5" />
					<span>Simpan Perubahan</span>
				</Button>
			</div>
		</form>
	</Modal>
{/if}
