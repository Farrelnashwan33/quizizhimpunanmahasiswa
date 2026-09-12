<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import Card from '$lib/components/ui/Card.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import Badge from '$lib/components/ui/Badge.svelte';
	import Input from '$lib/components/ui/Input.svelte';
	import {
		ClipboardList,
		Search,
		Filter,
		Download,
		Eye,
		ChevronLeft,
		ChevronRight,
		CheckCircle2,
		Clock,
		ArrowUpDown,
		User
	} from 'lucide-svelte';

	let { data } = $props();
	const attempts = $derived(data.attempts || []);
	const totalCount = $derived(data.totalCount || 0);
	const currentPage = $derived(data.page || 1);
	const totalPages = $derived(data.totalPages || 1);
	const prodiList = $derived(data.prodiList || []);

	let searchQuery = $state('');
	let selectedProdi = $state('');
	let selectedStatus = $state('');
	let selectedSort = $state('score_desc');

	$effect(() => {
		searchQuery = data.filters?.search || '';
		selectedProdi = data.filters?.prodi || '';
		selectedStatus = data.filters?.status || '';
		selectedSort = data.filters?.sort || 'score_desc';
	});

	function applyFilters() {
		const query = new URLSearchParams();
		if (searchQuery) query.set('q', searchQuery);
		if (selectedProdi) query.set('prodi', selectedProdi);
		if (selectedStatus) query.set('status', selectedStatus);
		if (selectedSort) query.set('sort', selectedSort);
		query.set('page', '1');
		goto(`?${query.toString()}`);
	}

	function goToPage(p: number) {
		const query = new URLSearchParams(page.url.searchParams);
		query.set('page', p.toString());
		goto(`?${query.toString()}`);
	}

	function resetFilters() {
		searchQuery = '';
		selectedProdi = '';
		selectedStatus = '';
		selectedSort = 'score_desc';
		goto('/admin/peserta');
	}
</script>

<svelte:head>
	<title>Daftar Peserta Quiz - Admin HIMA FST UT Bandung</title>
</svelte:head>

<div class="space-y-6">
	<!-- Header -->
	<div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
		<div>
			<div class="flex items-center gap-2 mb-1">
				<Badge variant="emerald" size="sm">Data Peserta</Badge>
				<span class="text-xs text-slate-400">Total: {totalCount} Pengerjaan</span>
			</div>
			<h1 class="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
				Daftar Peserta & Nilai Quiz
			</h1>
			<p class="text-xs sm:text-sm text-slate-400 mt-1">
				Pantau detail pengerjaan, nilai akhir, dan rekam jejak jawaban 30 butir soal setiap mahasiswa.
			</p>
		</div>

		<div class="flex items-center gap-3">
			<a
				href="/admin/peserta/export"
				data-sveltekit-reload
				download="Rekap_Nilai_Quiz_Kaderisasi_HIMA_FST.csv"
				class="inline-flex items-center justify-center px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
			>
				<Download class="w-4 h-4 mr-2" />
				<span>Export Data (CSV / Excel)</span>
			</a>
		</div>
	</div>

	<!-- Filter & Search Bar -->
	<div class="p-4 sm:p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
		<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
			<!-- Search -->
			<div class="relative">
				<input
					type="text"
					placeholder="Cari Nama, NIM, Email..."
					bind:value={searchQuery}
					onkeydown={(e) => e.key === 'Enter' && applyFilters()}
					class="w-full bg-slate-800 border border-slate-700 text-white text-xs rounded-xl px-3.5 py-2.5 outline-none focus:border-emerald-500 transition-colors placeholder:text-slate-500"
				/>
			</div>

			<!-- Filter Prodi -->
			<div>
				<select
					bind:value={selectedProdi}
					onchange={applyFilters}
					class="w-full bg-slate-800 border border-slate-700 text-white text-xs rounded-xl px-3 py-2.5 outline-none focus:border-emerald-500"
				>
					<option value="">Semua Program Studi</option>
					{#each prodiList as pr}
						<option value={pr}>{pr}</option>
					{/each}
				</select>
			</div>

			<!-- Filter Status -->
			<div>
				<select
					bind:value={selectedStatus}
					onchange={applyFilters}
					class="w-full bg-slate-800 border border-slate-700 text-white text-xs rounded-xl px-3 py-2.5 outline-none focus:border-emerald-500"
				>
					<option value="">Semua Status</option>
					<option value="completed">Selesai (Completed)</option>
					<option value="in_progress">Sedang Mengerjakan</option>
				</select>
			</div>

			<!-- Sort By -->
			<div>
				<select
					bind:value={selectedSort}
					onchange={applyFilters}
					class="w-full bg-slate-800 border border-slate-700 text-white text-xs rounded-xl px-3 py-2.5 outline-none focus:border-emerald-500"
				>
					<option value="score_desc">Nilai Tertinggi → Terendah</option>
					<option value="score_asc">Nilai Terendah → Tertinggi</option>
					<option value="time_desc">Waktu Kirim Terbaru</option>
					<option value="time_asc">Waktu Mulai Awal</option>
					<option value="name_asc">Nama Mahasiswa (A-Z)</option>
				</select>
			</div>
		</div>

		<div class="flex items-center justify-between pt-2 text-xs">
			<div class="flex items-center gap-2">
				<Button variant="primary" size="sm" onclick={applyFilters}>
					<Search class="w-3.5 h-3.5 mr-1.5" />
					Terapkan Filter
				</Button>
				<Button variant="ghost" size="sm" onclick={resetFilters} class="text-slate-400 hover:text-white">
					Reset Filter
				</Button>
			</div>

			<span class="text-slate-400">
				Menampilkan {attempts.length} dari {totalCount} data
			</span>
		</div>
	</div>

	<!-- Main Table -->
	<div class="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shadow-xl">
		<div class="overflow-x-auto">
			<table class="w-full text-left text-xs text-slate-300">
				<thead class="bg-slate-850 text-slate-400 uppercase tracking-wider text-[11px] font-bold border-b border-slate-800">
					<tr>
						<th class="py-3.5 px-4">No</th>
						<th class="py-3.5 px-4">Mahasiswa</th>
						<th class="py-3.5 px-4">NIM</th>
						<th class="py-3.5 px-4">Program Studi</th>
						<th class="py-3.5 px-4">Waktu Pengerjaan</th>
						<th class="py-3.5 px-4">Status</th>
						<th class="py-3.5 px-4">Benar / Salah</th>
						<th class="py-3.5 px-4 text-center">Nilai Akhir</th>
						<th class="py-3.5 px-4 text-right">Aksi</th>
					</tr>
				</thead>
				<tbody class="divide-y divide-slate-800/80">
					{#if attempts.length > 0}
						{#each attempts as att, idx}
							{@const isPassed = (att.score ?? 0) >= 65}
							<tr class="hover:bg-slate-800/50 transition-colors">
								<td class="py-3.5 px-4 font-mono text-slate-500">
									{(currentPage - 1) * 15 + idx + 1}
								</td>
								<td class="py-3.5 px-4">
									<div class="font-bold text-white text-sm">{att.student?.fullName || '-'}</div>
									<div class="text-[11px] text-slate-400 font-mono">{att.student?.email}</div>
								</td>
								<td class="py-3.5 px-4 font-mono font-bold text-emerald-400">
									{att.student?.nim || '-'}
								</td>
								<td class="py-3.5 px-4 text-slate-300">
									{att.student?.programStudi || '-'}
								</td>
								<td class="py-3.5 px-4 text-slate-400">
									<div>Mulai: {new Date(att.startedAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</div>
									{#if att.submittedAt}
										<div class="text-[10px] text-emerald-400">Selesai: {new Date(att.submittedAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</div>
									{/if}
								</td>
								<td class="py-3.5 px-4">
									<div class="space-y-1">
										{#if att.status === 'completed'}
											<Badge variant="emerald" size="sm">Selesai</Badge>
										{:else}
											<Badge variant="amber" size="sm">Berjalan</Badge>
										{/if}
										{#if ((att as any).tabSwitchCount ?? 0) > 0}
											<div class="inline-flex items-center gap-1 text-[10px] font-bold text-rose-300 bg-rose-950/80 border border-rose-800 px-1.5 py-0.5 rounded">
												⚠️ {(att as any).tabSwitchCount}x Buka Tab
											</div>
										{/if}
									</div>
								</td>
								<td class="py-3.5 px-4 font-medium">
									<span class="text-emerald-400 font-bold">{att.correctCount}</span> / <span class="text-rose-400 font-bold">{att.wrongCount}</span>
								</td>
								<td class="py-3.5 px-4 text-center">
									{#if att.status === 'completed'}
										<span class="text-base font-black {isPassed ? 'text-emerald-400' : 'text-rose-400'} font-mono">
											{att.score}
										</span>
										<span class="text-[10px] text-slate-500">/100</span>
									{:else}
										<span class="text-slate-500">-</span>
									{/if}
								</td>
								<td class="py-3.5 px-4 text-right">
									<Button href="/admin/peserta/{att.id}" variant="outline" size="sm" class="bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700">
										<Eye class="w-3.5 h-3.5 mr-1" />
										Detail Jawaban
									</Button>
								</td>
							</tr>
						{/each}
					{:else}
						<tr>
							<td colspan="9" class="py-12 text-center text-slate-500">
								Tidak ada data peserta yang sesuai dengan pencarian atau filter.
							</td>
						</tr>
					{/if}
				</tbody>
			</table>
		</div>

		<!-- Pagination Footer -->
		{#if totalPages > 1}
			<div class="p-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
				<div>
					Halaman <strong class="text-white">{currentPage}</strong> dari <strong class="text-white">{totalPages}</strong>
				</div>

				<div class="flex items-center gap-1.5">
					<button
						type="button"
						disabled={currentPage <= 1}
						onclick={() => goToPage(currentPage - 1)}
						class="p-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-700 transition-colors"
					>
						<ChevronLeft class="w-4 h-4" />
					</button>

					{#each Array.from({ length: totalPages }, (_, i) => i + 1) as p}
						{#if p === 1 || p === totalPages || (p >= currentPage - 2 && p <= currentPage + 2)}
							<button
								type="button"
								class="w-8 h-8 rounded-lg text-xs font-bold transition-colors {p === currentPage ? 'bg-emerald-600 text-white' : 'bg-slate-800 border border-slate-700 text-slate-300 hover:bg-slate-700'}"
								onclick={() => goToPage(p)}
							>
								{p}
							</button>
						{/if}
					{/each}

					<button
						type="button"
						disabled={currentPage >= totalPages}
						onclick={() => goToPage(currentPage + 1)}
						class="p-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-700 transition-colors"
					>
						<ChevronRight class="w-4 h-4" />
					</button>
				</div>
			</div>
		{/if}
	</div>
</div>
