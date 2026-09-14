<script lang="ts">
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import Card from '$lib/components/ui/Card.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import Badge from '$lib/components/ui/Badge.svelte';
	import Modal from '$lib/components/ui/Modal.svelte';
	import ConfirmDialog from '$lib/components/ui/ConfirmDialog.svelte';
	import { toasts } from '$lib/stores/toast';
	import {
		HelpCircle,
		Plus,
		Edit3,
		Trash2,
		Filter,
		Check,
		FileText,
		CheckCircle2,
		AlertCircle,
		PenLine,
		ShieldCheck,
		KeyRound
	} from 'lucide-svelte';

	let { data, form } = $props();
	const quiz = $derived(data.quiz);
	const questions = $derived(data.questions || []);
	const sections = $derived(data.sections || []);
	const currentSection = $derived(data.currentSection || '');

	// Modal States
	let createModalOpen = $state(false);
	let editModalOpen = $state(false);
	let deleteDialogOpen = $state(false);
	let loadingAction = $state(false);

	let selectedQuestion = $state<any>(null);

	// Edit form state
	let editId = $state('');
	let editNumber = $state(1);
	let editSection = $state('Nilai dan Karakter Dasar');
	let editText = $state('');
	let editCorrect = $state('');
	let editExplanation = $state('');

	function openEditModal(q: any) {
		selectedQuestion = q;
		editId = q.id;
		editNumber = q.questionNumber;
		editSection = q.section;
		editText = q.questionText;
		editCorrect = q.correctAnswer || '';
		editExplanation = q.explanation || '';
		editModalOpen = true;
	}

	function openDeleteDialog(q: any) {
		selectedQuestion = q;
		deleteDialogOpen = true;
	}

	function handleFilterSection(sec: string) {
		if (sec) {
			goto(`?section=${encodeURIComponent(sec)}`);
		} else {
			goto('/admin/soal');
		}
	}
</script>

<svelte:head>
	<title>Kelola Bank Soal Essay (CRUD) - Admin HIMA FST UT Bandung</title>
</svelte:head>

<div class="space-y-6">
	<!-- Header -->
	<div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
		<div>
			<div class="flex items-center gap-2 mb-1">
				<Badge variant="emerald" size="sm">Bank Soal Essay</Badge>
				<span class="text-xs text-slate-400">Total: {questions.length} Butir Soal</span>
			</div>
			<h1 class="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
				Manajemen Soal Essay Kaderisasi
			</h1>
			<p class="text-xs sm:text-sm text-slate-400 mt-1">
				Kelola 30 butir pertanyaan essay, rubrik referensi jawaban resmi, dan pembahasan materi.
			</p>
		</div>

		<div class="flex items-center gap-3">
			<Button
				variant="primary"
				size="md"
				onclick={() => {
					createModalOpen = true;
				}}
				class="shadow-lg shadow-emerald-900/20 font-bold text-xs"
			>
				<Plus class="w-4 h-4 mr-1.5" />
				<span>Tambah Soal Essay</span>
			</Button>
		</div>
	</div>

	<!-- Filter by Category / Section -->
	<div class="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
		<span class="text-xs text-slate-400 font-bold flex items-center gap-1.5 shrink-0 mr-1">
			<Filter class="w-3.5 h-3.5 text-emerald-400" />
			Kategori:
		</span>
		<button
			type="button"
			class="px-3.5 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer {!currentSection ? 'bg-emerald-600 text-white shadow-xs' : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'}"
			onclick={() => handleFilterSection('')}
		>
			Semua ({questions.length})
		</button>
		{#each sections as sec}
			<button
				type="button"
				class="px-3.5 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer {currentSection === sec ? 'bg-emerald-600 text-white shadow-xs' : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'}"
				onclick={() => handleFilterSection(sec)}
			>
				{sec}
			</button>
		{/each}
	</div>

	<!-- Questions List Cards -->
	<div class="space-y-4">
		{#if questions && questions.length > 0}
			{#each questions as q}
				<div class="p-5 sm:p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 shadow-lg hover:border-slate-750 transition-all">
					<!-- Card Header -->
					<div class="flex items-start justify-between gap-3 pb-3 border-b border-slate-800">
						<div class="flex items-center gap-2.5">
							<span class="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-sm">
								{q.questionNumber}
							</span>
							<div>
								<span class="text-xs font-bold text-emerald-400">{q.section}</span>
								<span class="text-xs text-slate-500 ml-2">• Soal Uraian Essay</span>
							</div>
						</div>

						<div class="flex items-center gap-2">
							<Button variant="outline" size="sm" class="px-2.5 bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-750" onclick={() => openEditModal(q)}>
								<Edit3 class="w-3.5 h-3.5 mr-1" />
								<span>Edit</span>
							</Button>
							<Button variant="outline" size="sm" class="px-2.5 bg-slate-800 border-slate-700 text-rose-400 hover:bg-rose-950/60 hover:text-rose-300" onclick={() => openDeleteDialog(q)}>
								<Trash2 class="w-3.5 h-3.5" />
							</Button>
						</div>
					</div>

					<!-- Question Text -->
					<p class="text-sm font-semibold text-white whitespace-pre-line leading-relaxed">
						{q.questionText}
					</p>

					<!-- Official Answer Key Reference -->
					{#if q.correctAnswer}
						<div class="p-3.5 rounded-xl bg-slate-850/80 border border-emerald-900/60 text-xs space-y-1">
							<div class="flex items-center gap-1.5 text-emerald-400 font-bold">
								<KeyRound class="w-3.5 h-3.5" />
								<span>Referensi Jawaban Resmi:</span>
							</div>
							<p class="text-slate-200 whitespace-pre-line leading-relaxed font-medium">
								{q.correctAnswer}
							</p>
						</div>
					{/if}

					<!-- Explanation -->
					{#if q.explanation}
						<div class="p-3 rounded-xl bg-slate-850/50 border border-slate-750 text-xs text-slate-400">
							<strong class="text-emerald-400">Pembahasan:</strong> {q.explanation}
						</div>
					{/if}
				</div>
			{/each}
		{:else}
			<div class="p-12 text-center text-slate-500 bg-slate-900 border border-dashed border-slate-800 rounded-2xl">
				Belum ada soal pada kategori ini.
			</div>
		{/if}
	</div>
</div>

<!-- Modal Tambah Soal Baru -->
<Modal bind:open={createModalOpen} title="Tambah Soal Essay Baru" maxWidth="2xl">
	<form
		action="?/create"
		method="POST"
		use:enhance={() => {
			loadingAction = true;
			return async ({ result, update }) => {
				loadingAction = false;
				if (result.type === 'success') {
					createModalOpen = false;
					toasts.success('Soal essay berhasil ditambahkan.');
				} else if (result.type === 'failure') {
					toasts.error((result.data as any)?.error || 'Gagal menambahkan soal.');
				}
				await update();
			};
		}}
		class="space-y-4 text-xs"
	>
		<input type="hidden" name="quizId" value={quiz?.id || '11111111-1111-1111-1111-111111111111'} />

		<div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
			<div>
				<label for="new_questionNumber" class="block font-bold text-slate-700 mb-1">Nomor Urut Soal *</label>
				<input
					type="number"
					id="new_questionNumber"
					name="questionNumber"
					required
					value={questions.length + 1}
					class="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 outline-none focus:border-emerald-500 text-slate-900 text-xs font-bold"
				/>
			</div>

			<div>
				<label for="new_section" class="block font-bold text-slate-700 mb-1">Kategori / Section *</label>
				<select
					id="new_section"
					name="section"
					required
					class="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 outline-none focus:border-emerald-500 text-slate-900 text-xs font-semibold"
				>
					<option value="Nilai dan Karakter Dasar">Nilai dan Karakter Dasar</option>
					<option value="Gerakan Mahasiswa">Gerakan Mahasiswa</option>
					<option value="Tridharma Perguruan Tinggi">Tridharma Perguruan Tinggi</option>
					<option value="Peran dan Fungsi Mahasiswa">Peran dan Fungsi Mahasiswa</option>
					<option value="Organisasi Kemahasiswaan dan HIMA FST">Organisasi Kemahasiswaan dan HIMA FST</option>
					<option value="Studi Kasus">Studi Kasus</option>
				</select>
			</div>
		</div>

		<div>
			<label for="new_questionText" class="block font-bold text-slate-700 mb-1">Teks Pertanyaan Essay *</label>
			<textarea
				id="new_questionText"
				name="questionText"
				rows="3"
				required
				placeholder="Tuliskan butir pertanyaan essay secara jelas..."
				class="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 outline-none focus:border-emerald-500 text-slate-900 text-xs leading-relaxed"
			></textarea>
		</div>

		<div>
			<label for="new_correctAnswer" class="block font-bold text-slate-700 mb-1">Uraian Kunci / Referensi Jawaban Resmi *</label>
			<textarea
				id="new_correctAnswer"
				name="correctAnswer"
				rows="4"
				required
				placeholder="Tuliskan poin-poin dan uraian referensi jawaban ideal..."
				class="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 outline-none focus:border-emerald-500 text-slate-900 text-xs leading-relaxed"
			></textarea>
		</div>

		<div>
			<label for="new_explanation" class="block font-bold text-slate-700 mb-1">Pembahasan / Rubrik Singkat (Opsional)</label>
			<textarea
				id="new_explanation"
				name="explanation"
				rows="2"
				placeholder="Penjelasan rujukan materi..."
				class="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 outline-none focus:border-emerald-500 text-slate-900 text-xs leading-relaxed"
			></textarea>
		</div>

		<div class="pt-4 border-t border-slate-200 flex items-center justify-end gap-2">
			<Button type="button" variant="outline" size="sm" onclick={() => (createModalOpen = false)}>Batal</Button>
			<Button type="submit" variant="primary" size="sm" loading={loadingAction}>
				<Plus class="w-4 h-4 mr-1.5" />
				<span>Simpan Soal Essay</span>
			</Button>
		</div>
	</form>
</Modal>

<!-- Modal Edit Soal -->
<Modal bind:open={editModalOpen} title={`Edit Soal Essay #${editNumber}`} maxWidth="2xl">
	<form
		action="?/update"
		method="POST"
		use:enhance={() => {
			loadingAction = true;
			return async ({ result, update }) => {
				loadingAction = false;
				if (result.type === 'success') {
					editModalOpen = false;
					toasts.success('Soal essay berhasil diperbarui.');
				} else if (result.type === 'failure') {
					toasts.error((result.data as any)?.error || 'Gagal memperbarui soal.');
				}
				await update();
			};
		}}
		class="space-y-4 text-xs"
	>
		<input type="hidden" name="id" value={editId} />

		<div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
			<div>
				<label for="edit_questionNumber" class="block font-bold text-slate-700 mb-1">Nomor Urut Soal *</label>
				<input
					type="number"
					id="edit_questionNumber"
					name="questionNumber"
					required
					bind:value={editNumber}
					class="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 outline-none focus:border-emerald-500 text-slate-900 text-xs font-bold"
				/>
			</div>

			<div>
				<label for="edit_section" class="block font-bold text-slate-700 mb-1">Kategori / Section *</label>
				<select
					id="edit_section"
					name="section"
					required
					bind:value={editSection}
					class="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 outline-none focus:border-emerald-500 text-slate-900 text-xs font-semibold"
				>
					<option value="Nilai dan Karakter Dasar">Nilai dan Karakter Dasar</option>
					<option value="Gerakan Mahasiswa">Gerakan Mahasiswa</option>
					<option value="Tridharma Perguruan Tinggi">Tridharma Perguruan Tinggi</option>
					<option value="Peran dan Fungsi Mahasiswa">Peran dan Fungsi Mahasiswa</option>
					<option value="Organisasi Kemahasiswaan dan HIMA FST">Organisasi Kemahasiswaan dan HIMA FST</option>
					<option value="Studi Kasus">Studi Kasus</option>
				</select>
			</div>
		</div>

		<div>
			<label for="edit_questionText" class="block font-bold text-slate-700 mb-1">Teks Pertanyaan Essay *</label>
			<textarea
				id="edit_questionText"
				name="questionText"
				rows="3"
				required
				bind:value={editText}
				class="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 outline-none focus:border-emerald-500 text-slate-900 text-xs leading-relaxed"
			></textarea>
		</div>

		<div>
			<label for="edit_correctAnswer" class="block font-bold text-slate-700 mb-1">Uraian Kunci / Referensi Jawaban Resmi *</label>
			<textarea
				id="edit_correctAnswer"
				name="correctAnswer"
				rows="4"
				required
				bind:value={editCorrect}
				placeholder="Tuliskan poin-poin dan uraian referensi jawaban ideal..."
				class="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 outline-none focus:border-emerald-500 text-slate-900 text-xs leading-relaxed"
			></textarea>
		</div>

		<div>
			<label for="edit_explanation" class="block font-bold text-slate-700 mb-1">Pembahasan / Rubrik Singkat (Opsional)</label>
			<textarea
				id="edit_explanation"
				name="explanation"
				rows="2"
				bind:value={editExplanation}
				placeholder="Penjelasan rujukan materi..."
				class="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 outline-none focus:border-emerald-500 text-slate-900 text-xs leading-relaxed"
			></textarea>
		</div>

		<div class="pt-4 border-t border-slate-200 flex items-center justify-end gap-2">
			<Button type="button" variant="outline" size="sm" onclick={() => (editModalOpen = false)}>Batal</Button>
			<Button type="submit" variant="primary" size="sm" loading={loadingAction}>
				<span>Simpan Perubahan</span>
			</Button>
		</div>
	</form>
</Modal>

<!-- Delete Confirmation Dialog -->
<ConfirmDialog
	bind:open={deleteDialogOpen}
	title="Hapus Soal Essay?"
	message={`Apakah Anda yakin ingin menghapus soal nomor #${selectedQuestion?.questionNumber}? Tindakan ini tidak dapat dibatalkan.`}
	confirmText="Hapus Soal"
	variant="danger"
	loading={loadingAction}
	onconfirm={async () => {
		if (!selectedQuestion) return;
		loadingAction = true;
		const formData = new FormData();
		formData.append('id', selectedQuestion.id);

		try {
			const res = await fetch('?/delete', {
				method: 'POST',
				body: formData
			});
			deleteDialogOpen = false;
			toasts.success('Soal berhasil dihapus.');
			window.location.reload();
		} catch (err) {
			toasts.error('Gagal menghapus soal.');
		} finally {
			loadingAction = false;
		}
	}}
/>
