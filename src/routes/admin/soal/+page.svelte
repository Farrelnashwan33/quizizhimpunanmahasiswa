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
		AlertCircle
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
	let editOptA = $state('');
	let editOptB = $state('');
	let editOptC = $state('');
	let editOptD = $state('');
	let editCorrect = $state('B');
	let editExplanation = $state('');

	function openEditModal(q: any) {
		selectedQuestion = q;
		editId = q.id;
		editNumber = q.questionNumber;
		editSection = q.section;
		editText = q.questionText;
		editOptA = q.optionA;
		editOptB = q.optionB;
		editOptC = q.optionC;
		editOptD = q.optionD;
		editCorrect = q.correctAnswer;
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
	<title>Kelola Soal Quiz (CRUD) - Admin HIMA FST UT Bandung</title>
</svelte:head>

<div class="space-y-6">
	<!-- Header -->
	<div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
		<div>
			<div class="flex items-center gap-2 mb-1">
				<Badge variant="emerald" size="sm">Bank Soal</Badge>
				<span class="text-xs text-slate-400">Total: {questions.length} Butir Soal</span>
			</div>
			<h1 class="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
				Manajemen Soal Quiz Kaderisasi
			</h1>
			<p class="text-xs sm:text-sm text-slate-400 mt-1">
				Tambah, perbarui teks pertanyaan, pilihan opsi A–D, kunci jawaban, atau pembahasan soal.
			</p>
		</div>

		<div class="flex items-center gap-3">
			<Button variant="primary" size="md" onclick={() => createModalOpen = true}>
				<Plus class="w-4 h-4 mr-2" />
				<span>Tambah Soal Baru</span>
			</Button>
		</div>
	</div>

	<!-- Filter by Category Section -->
	<div class="flex flex-wrap items-center gap-2 pb-2">
		<button
			type="button"
			class="px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer {!currentSection ? 'bg-emerald-600 text-white shadow-xs' : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'}"
			onclick={() => handleFilterSection('')}
		>
			Semua Kategori ({questions.length})
		</button>
		{#each sections as sec}
			<button
				type="button"
				class="px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer {currentSection === sec ? 'bg-emerald-600 text-white shadow-xs' : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'}"
				onclick={() => handleFilterSection(sec)}
			>
				{sec}
			</button>
		{/each}
	</div>

	<!-- Questions List Cards -->
	<div class="space-y-4">
		{#if questions.length > 0}
			{#each questions as q (q.id)}
				<div class="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 hover:border-slate-700 transition-colors">
					<!-- Card Header -->
					<div class="flex items-start justify-between gap-4 pb-3 border-b border-slate-800">
						<div class="flex items-center gap-3">
							<span class="w-8 h-8 rounded-xl emerald-gradient text-white flex items-center justify-center font-bold text-sm">
								{q.questionNumber}
							</span>
							<div>
								<span class="text-xs font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-800/80 px-2.5 py-1 rounded-lg">
									{q.section}
								</span>
							</div>
						</div>

						<!-- Action Buttons -->
						<div class="flex items-center gap-2">
							<Button variant="outline" size="sm" onclick={() => openEditModal(q)} class="bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700">
								<Edit3 class="w-3.5 h-3.5 mr-1" />
								Edit Soal
							</Button>
							<Button variant="danger" size="sm" onclick={() => openDeleteDialog(q)} class="bg-rose-950/60 border-rose-800 text-rose-300 hover:bg-rose-900">
								<Trash2 class="w-3.5 h-3.5" />
							</Button>
						</div>
					</div>

					<!-- Question Text -->
					<p class="text-sm font-semibold text-white whitespace-pre-line leading-relaxed">
						{q.questionText}
					</p>

					<!-- Options 2x2 Grid -->
					<div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
						{#each [
							{ key: 'A', text: q.optionA },
							{ key: 'B', text: q.optionB },
							{ key: 'C', text: q.optionC },
							{ key: 'D', text: q.optionD }
						] as opt}
							{@const isKey = q.correctAnswer === opt.key}
							<div class="p-3 rounded-xl border flex items-start gap-2.5 {isKey ? 'bg-emerald-950/70 border-emerald-500 text-white font-semibold' : 'bg-slate-850 border-slate-750 text-slate-300'}">
								<span class="w-5 h-5 rounded-md flex items-center justify-center font-bold text-[11px] shrink-0 {isKey ? 'bg-emerald-600 text-white' : 'bg-slate-750 text-slate-400'}">
									{opt.key}
								</span>
								<span class="flex-1 leading-snug">{opt.text}</span>
								{#if isKey}
									<span class="text-[10px] font-bold text-emerald-400 bg-emerald-900/80 px-1.5 py-0.5 rounded shrink-0">KUNCI ({opt.key})</span>
								{/if}
							</div>
						{/each}
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
<Modal bind:open={createModalOpen} title="Tambah Soal Quiz Baru" maxWidth="2xl">
	<form
		action="?/create"
		method="POST"
		use:enhance={() => {
			loadingAction = true;
			return async ({ result, update }) => {
				loadingAction = false;
				if (result.type === 'success') {
					createModalOpen = false;
					toasts.success('Soal berhasil ditambahkan ke database.');
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
			<label for="new_questionText" class="block font-bold text-slate-700 mb-1">Pertanyaan / Soal *</label>
			<textarea
				id="new_questionText"
				name="questionText"
				required
				rows="3"
				placeholder="Tuliskan kalimat pertanyaan di sini..."
				class="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 outline-none focus:border-emerald-500 text-slate-900 text-xs leading-relaxed"
			></textarea>
		</div>

		<!-- Options A, B, C, D -->
		<div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
			<div>
				<label for="new_optionA" class="block font-bold text-slate-700 mb-1">Pilihan A *</label>
				<input type="text" id="new_optionA" name="optionA" required placeholder="Teks pilihan A" class="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 outline-none focus:border-emerald-500 text-slate-900 text-xs" />
			</div>
			<div>
				<label for="new_optionB" class="block font-bold text-slate-700 mb-1">Pilihan B *</label>
				<input type="text" id="new_optionB" name="optionB" required placeholder="Teks pilihan B" class="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 outline-none focus:border-emerald-500 text-slate-900 text-xs" />
			</div>
			<div>
				<label for="new_optionC" class="block font-bold text-slate-700 mb-1">Pilihan C *</label>
				<input type="text" id="new_optionC" name="optionC" required placeholder="Teks pilihan C" class="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 outline-none focus:border-emerald-500 text-slate-900 text-xs" />
			</div>
			<div>
				<label for="new_optionD" class="block font-bold text-slate-700 mb-1">Pilihan D *</label>
				<input type="text" id="new_optionD" name="optionD" required placeholder="Teks pilihan D" class="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 outline-none focus:border-emerald-500 text-slate-900 text-xs" />
			</div>
		</div>

		<div class="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
			<div>
				<label for="new_correctAnswer" class="block font-bold text-slate-700 mb-1">Kunci Jawaban Benar *</label>
				<select id="new_correctAnswer" name="correctAnswer" required class="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 outline-none focus:border-emerald-500 text-slate-900 text-xs font-bold text-emerald-700">
					<option value="A">Pilihan A</option>
					<option value="B" selected>Pilihan B</option>
					<option value="C">Pilihan C</option>
					<option value="D">Pilihan D</option>
				</select>
			</div>

			<div>
				<label for="new_explanation" class="block font-bold text-slate-700 mb-1">Pembahasan / Penjelasan (Opsional)</label>
				<input type="text" id="new_explanation" name="explanation" placeholder="Alasan mengapa jawaban tersebut benar" class="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 outline-none focus:border-emerald-500 text-slate-900 text-xs" />
			</div>
		</div>

		<div class="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
			<Button variant="outline" size="sm" onclick={() => createModalOpen = false}>Batal</Button>
			<Button type="submit" variant="primary" size="sm" loading={loadingAction}>Simpan Soal</Button>
		</div>
	</form>
</Modal>

<!-- Modal Edit Soal -->
<Modal bind:open={editModalOpen} title="Edit Soal Quiz #{editNumber}" maxWidth="2xl">
	<form
		action="?/update"
		method="POST"
		use:enhance={() => {
			loadingAction = true;
			return async ({ result, update }) => {
				loadingAction = false;
				if (result.type === 'success') {
					editModalOpen = false;
					toasts.success('Soal berhasil diperbarui.');
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
				<label for="edit_number" class="block font-bold text-slate-700 mb-1">Nomor Urut Soal *</label>
				<input
					type="number"
					id="edit_number"
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
			<label for="edit_text" class="block font-bold text-slate-700 mb-1">Pertanyaan / Soal *</label>
			<textarea
				id="edit_text"
				name="questionText"
				required
				rows="3"
				bind:value={editText}
				class="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 outline-none focus:border-emerald-500 text-slate-900 text-xs leading-relaxed"
			></textarea>
		</div>

		<!-- Options A, B, C, D -->
		<div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
			<div>
				<label for="edit_optA" class="block font-bold text-slate-700 mb-1">Pilihan A *</label>
				<input type="text" id="edit_optA" name="optionA" required bind:value={editOptA} class="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 outline-none focus:border-emerald-500 text-slate-900 text-xs" />
			</div>
			<div>
				<label for="edit_optB" class="block font-bold text-slate-700 mb-1">Pilihan B *</label>
				<input type="text" id="edit_optB" name="optionB" required bind:value={editOptB} class="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 outline-none focus:border-emerald-500 text-slate-900 text-xs" />
			</div>
			<div>
				<label for="edit_optC" class="block font-bold text-slate-700 mb-1">Pilihan C *</label>
				<input type="text" id="edit_optC" name="optionC" required bind:value={editOptC} class="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 outline-none focus:border-emerald-500 text-slate-900 text-xs" />
			</div>
			<div>
				<label for="edit_optD" class="block font-bold text-slate-700 mb-1">Pilihan D *</label>
				<input type="text" id="edit_optD" name="optionD" required bind:value={editOptD} class="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 outline-none focus:border-emerald-500 text-slate-900 text-xs" />
			</div>
		</div>

		<div class="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
			<div>
				<label for="edit_correctAnswer" class="block font-bold text-slate-700 mb-1">Kunci Jawaban Benar *</label>
				<select id="edit_correctAnswer" name="correctAnswer" required bind:value={editCorrect} class="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 outline-none focus:border-emerald-500 text-slate-900 text-xs font-bold text-emerald-700">
					<option value="A">Pilihan A</option>
					<option value="B">Pilihan B</option>
					<option value="C">Pilihan C</option>
					<option value="D">Pilihan D</option>
				</select>
			</div>

			<div>
				<label for="edit_explanation" class="block font-bold text-slate-700 mb-1">Pembahasan / Penjelasan</label>
				<input type="text" id="edit_explanation" name="explanation" bind:value={editExplanation} class="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 outline-none focus:border-emerald-500 text-slate-900 text-xs" />
			</div>
		</div>

		<div class="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
			<Button variant="outline" size="sm" onclick={() => editModalOpen = false}>Batal</Button>
			<Button type="submit" variant="primary" size="sm" loading={loadingAction}>Perbarui Soal</Button>
		</div>
	</form>
</Modal>

<!-- Delete Dialog -->
<ConfirmDialog
	bind:open={deleteDialogOpen}
	title="Hapus Soal #{selectedQuestion?.questionNumber}?"
	message="Apakah Anda yakin ingin menghapus butir soal ini dari database? Tindakan ini tidak dapat dibatalkan."
	confirmText="Hapus Soal"
	variant="danger"
	loading={loadingAction}
	onconfirm={async () => {
		loadingAction = true;
		const form = new FormData();
		form.append('id', selectedQuestion.id);

		const res = await fetch('?/delete', {
			method: 'POST',
			body: form
		});

		loadingAction = false;
		deleteDialogOpen = false;
		toasts.success('Soal berhasil dihapus.');
		goto('/admin/soal', { invalidateAll: true });
	}}
/>
