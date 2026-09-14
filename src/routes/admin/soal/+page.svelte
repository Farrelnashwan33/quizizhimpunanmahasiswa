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
	let editOptionA = $state('');
	let editOptionB = $state('');
	let editOptionC = $state('');
	let editOptionD = $state('');
	let editCorrect = $state('A');
	let editExplanation = $state('');

	function openEditModal(q: any) {
		selectedQuestion = q;
		editId = q.id;
		editNumber = q.questionNumber;
		editSection = q.section;
		editText = q.questionText;
		editOptionA = q.optionA || '';
		editOptionB = q.optionB || '';
		editOptionC = q.optionC || '';
		editOptionD = q.optionD || '';
		editCorrect = q.correctAnswer || 'A';
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
	<title>Kelola Bank Soal Pilihan Ganda (CRUD) - Admin HIMA FST UT Bandung</title>
</svelte:head>

<div class="space-y-6">
	<!-- Header -->
	<div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
		<div>
			<div class="flex items-center gap-2 mb-1">
				<Badge variant="emerald" size="sm">Bank Soal Pilihan Ganda</Badge>
				<span class="text-xs text-slate-400">Total: {questions.length} Butir Soal</span>
			</div>
			<h1 class="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
				Manajemen Soal Quiz Kaderisasi
			</h1>
			<p class="text-xs sm:text-sm text-slate-400 mt-1">
				Kelola 30 butir pertanyaan, opsi A/B/C/D, kunci jawaban resmi, dan pembahasan materi.
			</p>
		</div>

		<div class="flex items-center gap-3">
			<Button variant="primary" size="md" onclick={() => createModalOpen = true}>
				<Plus class="w-4 h-4 mr-2" />
				<span>Tambah Soal Baru</span>
			</Button>
		</div>
	</div>

	<!-- Section Filter Tabs -->
	<div class="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
		<button
			type="button"
			class="px-3.5 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer {!currentSection ? 'bg-emerald-600 text-white shadow-xs' : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'}"
			onclick={() => handleFilterSection('')}
		>
			Semua Kategori ({questions.length})
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

	<!-- Question List -->
	<div class="space-y-4">
		{#if questions.length > 0}
			{#each questions as q}
				<div class="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700/80 transition-all space-y-4 shadow-md">
					<!-- Top Row -->
					<div class="flex items-start justify-between gap-4 pb-3 border-b border-slate-800">
						<div class="flex items-center gap-2.5">
							<span class="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-sm">
								{q.questionNumber}
							</span>
							<div>
								<span class="text-xs font-bold text-emerald-400">{q.section}</span>
								<span class="text-xs text-slate-500 ml-2">• Pilihan Ganda</span>
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

					<!-- Options Grid -->
					<div class="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
						<div class="p-3 rounded-xl border {q.correctAnswer === 'A' ? 'bg-emerald-950/70 border-emerald-600 text-emerald-300 font-bold' : 'bg-slate-850 border-slate-800 text-slate-300'}">
							<span class="font-bold mr-1">A.</span> {q.optionA}
						</div>
						<div class="p-3 rounded-xl border {q.correctAnswer === 'B' ? 'bg-emerald-950/70 border-emerald-600 text-emerald-300 font-bold' : 'bg-slate-850 border-slate-800 text-slate-300'}">
							<span class="font-bold mr-1">B.</span> {q.optionB}
						</div>
						<div class="p-3 rounded-xl border {q.correctAnswer === 'C' ? 'bg-emerald-950/70 border-emerald-600 text-emerald-300 font-bold' : 'bg-slate-850 border-slate-800 text-slate-300'}">
							<span class="font-bold mr-1">C.</span> {q.optionC}
						</div>
						<div class="p-3 rounded-xl border {q.correctAnswer === 'D' ? 'bg-emerald-950/70 border-emerald-600 text-emerald-300 font-bold' : 'bg-slate-850 border-slate-800 text-slate-300'}">
							<span class="font-bold mr-1">D.</span> {q.optionD}
						</div>
					</div>

					<!-- Official Answer Key Badge -->
					<div class="flex items-center gap-2 p-2.5 rounded-xl bg-emerald-950/50 border border-emerald-800/60 text-xs text-emerald-300">
						<KeyRound class="w-4 h-4 text-emerald-400 shrink-0" />
						<span>Kunci Jawaban Resmi: <strong>Opsi {q.correctAnswer}</strong></span>
					</div>

					<!-- Explanation -->
					{#if q.explanation}
						<div class="p-3 rounded-xl bg-slate-850 border border-slate-750 text-xs text-slate-300">
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
<Modal bind:open={createModalOpen} title="Tambah Soal Pilihan Ganda Baru" maxWidth="2xl">
	<form
		action="?/create"
		method="POST"
		use:enhance={() => {
			loadingAction = true;
			return async ({ result, update }) => {
				loadingAction = false;
				if (result.type === 'success') {
					createModalOpen = false;
					toasts.success('Soal pilihan ganda berhasil ditambahkan.');
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
			<label for="new_questionText" class="block font-bold text-slate-700 mb-1">Teks Pertanyaan *</label>
			<textarea
				id="new_questionText"
				name="questionText"
				rows="3"
				required
				placeholder="Tuliskan butir pertanyaan secara jelas..."
				class="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 outline-none focus:border-emerald-500 text-slate-900 text-xs leading-relaxed"
			></textarea>
		</div>

		<div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
			<div>
				<label for="new_optionA" class="block font-bold text-slate-700 mb-1">Opsi A *</label>
				<input
					type="text"
					id="new_optionA"
					name="optionA"
					required
					placeholder="Teks Opsi A"
					class="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 outline-none focus:border-emerald-500 text-slate-900 text-xs"
				/>
			</div>

			<div>
				<label for="new_optionB" class="block font-bold text-slate-700 mb-1">Opsi B *</label>
				<input
					type="text"
					id="new_optionB"
					name="optionB"
					required
					placeholder="Teks Opsi B"
					class="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 outline-none focus:border-emerald-500 text-slate-900 text-xs"
				/>
			</div>

			<div>
				<label for="new_optionC" class="block font-bold text-slate-700 mb-1">Opsi C *</label>
				<input
					type="text"
					id="new_optionC"
					name="optionC"
					required
					placeholder="Teks Opsi C"
					class="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 outline-none focus:border-emerald-500 text-slate-900 text-xs"
				/>
			</div>

			<div>
				<label for="new_optionD" class="block font-bold text-slate-700 mb-1">Opsi D *</label>
				<input
					type="text"
					id="new_optionD"
					name="optionD"
					required
					placeholder="Teks Opsi D"
					class="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 outline-none focus:border-emerald-500 text-slate-900 text-xs"
				/>
			</div>
		</div>

		<div>
			<label class="block font-bold text-slate-700 mb-1">Kunci Jawaban Benar *</label>
			<div class="grid grid-cols-4 gap-2">
				{#each ['A', 'B', 'C', 'D'] as opt}
					<label class="flex items-center justify-center gap-2 p-2.5 rounded-xl border border-slate-200 bg-slate-50 cursor-pointer hover:bg-slate-100 font-bold">
						<input type="radio" name="correctAnswer" value={opt} checked={opt === 'A'} class="accent-emerald-600" />
						<span>Opsi {opt}</span>
					</label>
				{/each}
			</div>
		</div>

		<div>
			<label for="new_explanation" class="block font-bold text-slate-700 mb-1">Pembahasan Singkat (Opsional)</label>
			<textarea
				id="new_explanation"
				name="explanation"
				rows="2"
				placeholder="Penjelasan rujukan materi..."
				class="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 outline-none focus:border-emerald-500 text-slate-900 text-xs leading-relaxed"
			></textarea>
		</div>

		<div class="pt-4 border-t border-slate-200 flex items-center justify-end gap-2">
			<Button type="button" variant="outline" size="sm" onclick={() => createModalOpen = false}>Batal</Button>
			<Button type="submit" variant="primary" size="sm" loading={loadingAction}>
				<Plus class="w-4 h-4 mr-1.5" />
				<span>Simpan Soal</span>
			</Button>
		</div>
	</form>
</Modal>

<!-- Modal Edit Soal -->
<Modal bind:open={editModalOpen} title="Edit Soal Pilihan Ganda #{editNumber}" maxWidth="2xl">
	<form
		action="?/update"
		method="POST"
		use:enhance={() => {
			loadingAction = true;
			return async ({ result, update }) => {
				loadingAction = false;
				if (result.type === 'success') {
					editModalOpen = false;
					toasts.success('Soal pilihan ganda berhasil diperbarui.');
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
			<label for="edit_questionText" class="block font-bold text-slate-700 mb-1">Teks Pertanyaan *</label>
			<textarea
				id="edit_questionText"
				name="questionText"
				rows="3"
				required
				bind:value={editText}
				class="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 outline-none focus:border-emerald-500 text-slate-900 text-xs leading-relaxed"
			></textarea>
		</div>

		<div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
			<div>
				<label for="edit_optionA" class="block font-bold text-slate-700 mb-1">Opsi A *</label>
				<input
					type="text"
					id="edit_optionA"
					name="optionA"
					required
					bind:value={editOptionA}
					class="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 outline-none focus:border-emerald-500 text-slate-900 text-xs"
				/>
			</div>

			<div>
				<label for="edit_optionB" class="block font-bold text-slate-700 mb-1">Opsi B *</label>
				<input
					type="text"
					id="edit_optionB"
					name="optionB"
					required
					bind:value={editOptionB}
					class="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 outline-none focus:border-emerald-500 text-slate-900 text-xs"
				/>
			</div>

			<div>
				<label for="edit_optionC" class="block font-bold text-slate-700 mb-1">Opsi C *</label>
				<input
					type="text"
					id="edit_optionC"
					name="optionC"
					required
					bind:value={editOptionC}
					class="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 outline-none focus:border-emerald-500 text-slate-900 text-xs"
				/>
			</div>

			<div>
				<label for="edit_optionD" class="block font-bold text-slate-700 mb-1">Opsi D *</label>
				<input
					type="text"
					id="edit_optionD"
					name="optionD"
					required
					bind:value={editOptionD}
					class="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 outline-none focus:border-emerald-500 text-slate-900 text-xs"
				/>
			</div>
		</div>

		<div>
			<label class="block font-bold text-slate-700 mb-1">Kunci Jawaban Benar *</label>
			<div class="grid grid-cols-4 gap-2">
				{#each ['A', 'B', 'C', 'D'] as opt}
					<label class="flex items-center justify-center gap-2 p-2.5 rounded-xl border border-slate-200 bg-slate-50 cursor-pointer hover:bg-slate-100 font-bold">
						<input type="radio" name="correctAnswer" value={opt} bind:group={editCorrect} class="accent-emerald-600" />
						<span>Opsi {opt}</span>
					</label>
				{/each}
			</div>
		</div>

		<div>
			<label for="edit_explanation" class="block font-bold text-slate-700 mb-1">Pembahasan Singkat (Opsional)</label>
			<textarea
				id="edit_explanation"
				name="explanation"
				rows="2"
				bind:value={editExplanation}
				class="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 outline-none focus:border-emerald-500 text-slate-900 text-xs leading-relaxed"
			></textarea>
		</div>

		<div class="pt-4 border-t border-slate-200 flex items-center justify-end gap-2">
			<Button type="button" variant="outline" size="sm" onclick={() => editModalOpen = false}>Batal</Button>
			<Button type="submit" variant="primary" size="sm" loading={loadingAction}>
				<Check class="w-4 h-4 mr-1.5" />
				<span>Perbarui Soal</span>
			</Button>
		</div>
	</form>
</Modal>

<!-- Delete Dialog Confirmation -->
<ConfirmDialog
	bind:open={deleteDialogOpen}
	title="Hapus Butir Soal?"
	message={`Apakah Anda yakin ingin menghapus soal nomor #${selectedQuestion?.questionNumber}? Tindakan ini tidak dapat dibatalkan.`}
	confirmText="Ya, Hapus Soal"
	cancelText="Batal"
	variant="danger"
	onconfirm={async () => {
		const formData = new FormData();
		formData.append('id', selectedQuestion.id);
		const res = await fetch('?/delete', { method: 'POST', body: formData });
		if (res.ok) {
			toasts.success('Soal berhasil dihapus.');
			deleteDialogOpen = false;
			window.location.reload();
		} else {
			toasts.error('Gagal menghapus soal.');
		}
	}}
/>
