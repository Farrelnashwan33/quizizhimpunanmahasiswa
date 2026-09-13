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
			correctAnswer: q.correctAnswer || '',
			explanation: q.explanation || ''
		};
		editModalOpen = true;
	}
</script>

<svelte:head>
	<title>Kunci Jawaban Resmi (Essai) - Admin HIMA FST UT Bandung</title>
</svelte:head>

<div class="space-y-6">
	<!-- Header -->
	<div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
		<div>
			<div class="flex items-center gap-2 mb-1">
				<Badge variant="emerald" size="sm">Master Key Essai</Badge>
				<span class="text-xs text-slate-400">30 Butir Soal</span>
			</div>
			<h1 class="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
				Kunci Jawaban Resmi Quiz
			</h1>
			<p class="text-xs sm:text-sm text-slate-400 mt-1">
				Tabel ringkas pedoman kunci jawaban essai dan pembahasan untuk setiap butir soal.
			</p>
		</div>
	</div>

	<!-- Alert Info -->
	<div class="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-start gap-3 text-xs text-slate-400">
		<ShieldAlert class="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
		<span>
			Kunci jawaban dienkripsi dan hanya dapat diakses oleh admin pengurus. Mengubah pedoman kunci jawaban essai di sini akan memperbarui basis data referensi penilaian evaluasi mahasiswa.
		</span>
	</div>

	<!-- Table of 30 Answer Keys -->
	<div class="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shadow-xl">
		<div class="overflow-x-auto">
			<table class="w-full text-left text-xs text-slate-300">
				<thead class="bg-slate-850 text-slate-400 uppercase tracking-wider text-[11px] font-bold border-b border-slate-800">
					<tr>
						<th class="py-3.5 px-4 w-14">No</th>
						<th class="py-3.5 px-4 w-44">Kategori</th>
						<th class="py-3.5 px-4 min-w-[220px]">Ringkasan Soal</th>
						<th class="py-3.5 px-4 min-w-[280px]">Kunci Jawaban / Pedoman Jawaban Essai</th>
						<th class="py-3.5 px-4 min-w-[240px]">Pembahasan Singkat</th>
						<th class="py-3.5 px-4 w-24 text-center">Aksi</th>
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
							<td class="py-3.5 px-4 text-slate-200 align-top">
								<p class="leading-relaxed">{q.questionText}</p>
							</td>
							<td class="py-3.5 px-4 align-top">
								<div class="p-2.5 rounded-xl bg-slate-850 border border-emerald-900/40 text-emerald-300 text-xs leading-relaxed font-medium">
									{q.correctAnswer}
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
									title="Edit Pedoman Jawaban & Pembahasan"
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

<!-- Edit Pedoman Jawaban Modal -->
{#if editingQuestion}
	<Modal bind:open={editModalOpen} title={`Edit Pedoman Jawaban Soal #${editingQuestion.questionNumber}`} maxWidth="lg">
		<form
			action="?/updateKey"
			method="POST"
			use:enhance={() => {
				isSaving = true;
				return async ({ result, update }) => {
					isSaving = false;
					if (result.type === 'success') {
						editModalOpen = false;
						toasts.success(`Pedoman kunci jawaban soal #${editingQuestion.questionNumber} berhasil diperbarui.`);
					} else {
						toasts.error('Gagal memperbarui pedoman kunci jawaban.');
					}
					await update();
				};
			}}
			class="space-y-4"
		>
			<input type="hidden" name="id" value={editingQuestion.id} />

			<div class="p-3 bg-slate-800/80 rounded-xl border border-slate-700 text-xs">
				<p class="text-emerald-400 font-bold mb-1">{editingQuestion.section}</p>
				<p class="text-slate-200 leading-relaxed font-medium">{editingQuestion.questionText}</p>
			</div>

			<div class="space-y-1.5">
				<label for="modal-correctAnswer" class="block text-xs font-bold text-slate-200">
					Kunci Jawaban / Pedoman Jawaban Essai:
				</label>
				<textarea
					id="modal-correctAnswer"
					name="correctAnswer"
					rows="4"
					required
					bind:value={editingQuestion.correctAnswer}
					placeholder="Tuliskan pedoman jawaban resmi essai untuk butir soal ini..."
					class="w-full p-3 bg-slate-900 border border-slate-700 focus:border-emerald-500 rounded-xl text-xs text-slate-100 outline-none leading-relaxed transition-colors"
				></textarea>
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
