<script lang="ts">
	import { goto } from '$app/navigation';
	import Card from '$lib/components/ui/Card.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import Badge from '$lib/components/ui/Badge.svelte';
	import { Users, Search, Phone, Mail, Hash, Calendar, CheckCircle2, Clock } from 'lucide-svelte';

	let { data } = $props();
	const students = $derived(data.students || []);
	const prodiList = $derived(data.prodiList || []);

	let searchQuery = $state('');
	let selectedProdi = $state('');

	$effect(() => {
		searchQuery = data.filters?.search || '';
		selectedProdi = data.filters?.prodi || '';
	});

	function applyFilter() {
		const q = new URLSearchParams();
		if (searchQuery) q.set('q', searchQuery);
		if (selectedProdi) q.set('prodi', selectedProdi);
		goto(`?${q.toString()}`);
	}
</script>

<svelte:head>
	<title>Data Mahasiswa Terdaftar - Admin HIMA FST UT Bandung</title>
</svelte:head>

<div class="space-y-6">
	<div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
		<div>
			<div class="flex items-center gap-2 mb-1">
				<Badge variant="emerald" size="sm">Master Akun</Badge>
				<span class="text-xs text-slate-400">Total: {students.length} Mahasiswa Terdaftar</span>
			</div>
			<h1 class="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
				Data Mahasiswa Peserta
			</h1>
			<p class="text-xs sm:text-sm text-slate-400 mt-1">
				Daftar seluruh akun mahasiswa yang telah terdaftar dalam sistem kuis kaderisasi.
			</p>
		</div>
	</div>

	<!-- Filter Bar -->
	<div class="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row gap-3">
		<input
			type="text"
			placeholder="Cari Nama, NIM, Email..."
			bind:value={searchQuery}
			onkeydown={(e) => e.key === 'Enter' && applyFilter()}
			class="flex-1 bg-slate-800 border border-slate-700 text-white text-xs rounded-xl px-3.5 py-2.5 outline-none focus:border-emerald-500"
		/>

		<select
			bind:value={selectedProdi}
			onchange={applyFilter}
			class="bg-slate-800 border border-slate-700 text-white text-xs rounded-xl px-3 py-2.5 outline-none focus:border-emerald-500"
		>
			<option value="">Semua Program Studi</option>
			{#each prodiList as p}
				<option value={p}>{p}</option>
			{/each}
		</select>

		<Button variant="primary" size="sm" onclick={applyFilter}>
			<Search class="w-3.5 h-3.5 mr-1.5" />
			Cari
		</Button>
	</div>

	<!-- Table -->
	<div class="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shadow-xl">
		<div class="overflow-x-auto">
			<table class="w-full text-left text-xs text-slate-300">
				<thead class="bg-slate-850 text-slate-400 uppercase tracking-wider text-[11px] font-bold border-b border-slate-800">
					<tr>
						<th class="py-3.5 px-4">No</th>
						<th class="py-3.5 px-4">Nama Lengkap</th>
						<th class="py-3.5 px-4">NIM</th>
						<th class="py-3.5 px-4">Program Studi</th>
						<th class="py-3.5 px-4">Kontak (Email / WA)</th>
						<th class="py-3.5 px-4">Status Quiz</th>
						<th class="py-3.5 px-4">Terdaftar Pada</th>
					</tr>
				</thead>
				<tbody class="divide-y divide-slate-800/80">
					{#if students.length > 0}
						{#each students as s, idx}
							{@const lastAttempt = s.attempts?.[0]}
							<tr class="hover:bg-slate-800/50 transition-colors">
								<td class="py-3.5 px-4 font-mono text-slate-500">{idx + 1}</td>
								<td class="py-3.5 px-4 font-bold text-white text-sm">{s.fullName}</td>
								<td class="py-3.5 px-4 font-mono font-bold text-emerald-400">{s.nim}</td>
								<td class="py-3.5 px-4">{s.programStudi}</td>
								<td class="py-3.5 px-4 text-slate-400">
									<div>{s.email}</div>
									{#if s.whatsapp}
										<div class="text-[11px] text-emerald-400 mt-0.5">WA: {s.whatsapp}</div>
									{/if}
								</td>
								<td class="py-3.5 px-4">
									{#if lastAttempt?.status === 'completed'}
										<Badge variant="emerald" size="sm">Nilai: {lastAttempt.score}</Badge>
									{:else if lastAttempt?.status === 'in_progress'}
										<Badge variant="amber" size="sm">Sedang Mengerjakan</Badge>
									{:else}
										<Badge variant="slate" size="sm">Belum Memulai</Badge>
									{/if}
								</td>
								<td class="py-3.5 px-4 text-slate-400 text-[11px]">
									{new Date(s.createdAt).toLocaleDateString('id-ID', { dateStyle: 'medium' })}
								</td>
							</tr>
						{/each}
					{:else}
						<tr>
							<td colspan="7" class="py-12 text-center text-slate-500">
								Tidak ada data mahasiswa yang ditemukan.
							</td>
						</tr>
					{/if}
				</tbody>
			</table>
		</div>
	</div>
</div>
