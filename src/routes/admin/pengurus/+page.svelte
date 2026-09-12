<script lang="ts">
	import Card from '$lib/components/ui/Card.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import Badge from '$lib/components/ui/Badge.svelte';
	import {
		ShieldCheck,
		UserCheck,
		Key,
		Lock,
		Terminal,
		CheckCircle2,
		Copy,
		Check,
		User,
		Mail,
		Hash,
		Building2,
		ShieldAlert
	} from 'lucide-svelte';

	let { data } = $props();
	const admins = $derived(data.admins || []);
	const currentAdmin = $derived(data.currentAdmin);

	let copiedSql = $state(false);

	function copySnippet(text: string) {
		navigator.clipboard.writeText(text);
		copiedSql = true;
		setTimeout(() => {
			copiedSql = false;
		}, 2000);
	}
</script>

<svelte:head>
	<title>Profil & Admin - HIMA FST UT Bandung</title>
</svelte:head>

<div class="space-y-6 max-w-5xl mx-auto">
	<!-- Page Header -->
	<div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-800/80">
		<div>
			<div class="flex items-center gap-2 mb-1.5">
				<Badge variant="emerald" size="sm">Otoritas & Keamanan</Badge>
				<span class="text-xs text-slate-400 font-medium">Kaderisasi Tingkat I</span>
			</div>
			<h1 class="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
				Profil & Manajemen Admin
			</h1>
			<p class="text-xs sm:text-sm text-slate-400 mt-1">
				Kelola identitas akun pengurus dan kontrol hak akses administrator sistem kuis.
			</p>
		</div>

		<div class="flex items-center gap-2 self-start sm:self-auto">
			<div class="px-3.5 py-1.5 rounded-full bg-emerald-950/80 border border-emerald-800/80 text-emerald-300 text-xs font-semibold flex items-center gap-2">
				<span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
				<span>Sesi Aktif: Administrator</span>
			</div>
		</div>
	</div>

	<!-- Top Grid: Current Profile & Access Info -->
	<div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
		<!-- Profile Card (2 cols) -->
		<div class="lg:col-span-2 rounded-2xl bg-slate-900/90 border border-slate-800 p-6 sm:p-7 shadow-xl relative overflow-hidden">
			<div class="absolute top-0 right-0 w-64 h-64 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none"></div>

			<div class="flex flex-col sm:flex-row items-start sm:items-center gap-5 pb-6 border-b border-slate-800/80 relative">
				<div class="w-16 h-16 rounded-2xl emerald-gradient flex items-center justify-center text-white shadow-lg shadow-emerald-700/30 shrink-0 ring-4 ring-emerald-500/20">
					<ShieldCheck class="w-8 h-8" />
				</div>
				<div class="flex-1">
					<div class="flex flex-wrap items-center gap-2 mb-1">
						<h2 class="text-lg sm:text-xl font-bold text-white">
							{currentAdmin?.fullName || 'Administrator HIMA FST'}
						</h2>
						<span class="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[11px] font-bold">
							Pengurus Utama
						</span>
					</div>
					<p class="text-xs text-slate-400 font-medium">
						Himpunan Mahasiswa Fakultas Sains dan Teknologi • UT Bandung
					</p>
				</div>
			</div>

			<div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6 text-xs">
				<div class="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-1">
					<span class="text-slate-500 font-medium flex items-center gap-1.5">
						<Mail class="w-3.5 h-3.5 text-slate-400" />
						Email Resmi
					</span>
					<p class="text-white font-mono font-medium truncate">{currentAdmin?.email || 'admin@hima-fst.ut.ac.id'}</p>
				</div>

				<div class="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-1">
					<span class="text-slate-500 font-medium flex items-center gap-1.5">
						<Hash class="w-3.5 h-3.5 text-slate-400" />
						ID / NIM Pengurus
					</span>
					<p class="text-white font-mono font-medium">{currentAdmin?.nim || 'ADMIN-HIMA'}</p>
				</div>

				<div class="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-1">
					<span class="text-slate-500 font-medium flex items-center gap-1.5">
						<Building2 class="w-3.5 h-3.5 text-slate-400" />
						Fakultas & Unit
					</span>
					<p class="text-white font-medium">{currentAdmin?.programStudi || 'Sains & Teknologi (FST)'}</p>
				</div>

				<div class="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-1">
					<span class="text-slate-500 font-medium flex items-center gap-1.5">
						<ShieldCheck class="w-3.5 h-3.5 text-emerald-400" />
						Status Akses
					</span>
					<p class="text-emerald-400 font-semibold flex items-center gap-1">
						<CheckCircle2 class="w-3.5 h-3.5" />
						Super Administrator (Aktif)
					</p>
				</div>
			</div>
		</div>

		<!-- Security & Role Overview (1 col) -->
		<div class="rounded-2xl bg-slate-900/90 border border-slate-800 p-6 flex flex-col justify-between shadow-xl">
			<div>
				<h3 class="text-sm font-bold text-white flex items-center gap-2 mb-4 pb-3 border-b border-slate-800">
					<Lock class="w-4 h-4 text-emerald-400" />
					<span>Hak Istimewa Admin</span>
				</h3>
				<ul class="space-y-3 text-xs text-slate-300">
					<li class="flex items-start gap-2.5">
						<Check class="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
						<span>Melihat seluruh rekap hasil dan nilai 30 butir soal peserta.</span>
					</li>
					<li class="flex items-start gap-2.5">
						<Check class="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
						<span>Ekspor laporan data peserta ke file Excel / CSV.</span>
					</li>
					<li class="flex items-start gap-2.5">
						<Check class="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
						<span>Kelola bank soal pilihan ganda (A–D) dan kunci jawaban.</span>
					</li>
					<li class="flex items-start gap-2.5">
						<Check class="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
						<span>Buka / tutup akses pengerjaan kuis kaderisasi.</span>
					</li>
				</ul>
			</div>

			<div class="mt-6 pt-4 border-t border-slate-800/80">
				<a href="/admin/dashboard" class="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-750 text-white text-xs font-semibold flex items-center justify-center gap-2 transition-all">
					<span>Kembali ke Dashboard Utama</span>
				</a>
			</div>
		</div>
	</div>

	<!-- List of Current Admins Table Card -->
	<div class="rounded-2xl bg-slate-900/90 border border-slate-800 p-6 shadow-xl">
		<div class="flex items-center justify-between pb-4 mb-4 border-b border-slate-800">
			<div>
				<h3 class="text-sm font-bold text-white flex items-center gap-2">
					<UserCheck class="w-4 h-4 text-emerald-400" />
					<span>Daftar Pengurus & Administrator ({admins.length})</span>
				</h3>
				<p class="text-xs text-slate-400 mt-0.5">Akun dengan wewenang mengelola sistem kaderisasi HIMA FST.</p>
			</div>
		</div>

		<div class="space-y-3">
			{#each admins as adm}
				{@const isCurrent = adm.id === currentAdmin?.id || adm.email === currentAdmin?.email}
				<div class="p-4 rounded-xl bg-slate-950/70 border {isCurrent ? 'border-emerald-500/40' : 'border-slate-800'} flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all">
					<div class="flex items-center gap-3.5">
						<div class="w-10 h-10 rounded-xl {isCurrent ? 'emerald-gradient' : 'bg-slate-800'} flex items-center justify-center text-white font-bold text-sm shrink-0">
							<User class="w-5 h-5" />
						</div>
						<div>
							<div class="flex items-center gap-2">
								<span class="text-sm font-bold text-white">{adm.fullName}</span>
								{#if isCurrent}
									<span class="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold">
										AKUN ANDA
									</span>
								{/if}
							</div>
							<p class="text-xs text-slate-400 font-mono mt-0.5">{adm.email} • ID: {adm.nim}</p>
						</div>
					</div>

					<div class="flex items-center gap-3 self-end sm:self-auto">
						<span class="px-3 py-1 rounded-lg bg-emerald-950 text-emerald-400 border border-emerald-800/60 text-xs font-semibold">
							Role Admin
						</span>
					</div>
				</div>
			{/each}
		</div>
	</div>

	<!-- Safe Admin Creation Guide Card -->
	<div class="rounded-2xl bg-slate-900/90 border border-slate-800 p-6 sm:p-7 shadow-xl space-y-4">
		<div class="flex items-center justify-between pb-3 border-b border-slate-800">
			<h3 class="text-sm font-bold text-white flex items-center gap-2">
				<Key class="w-4 h-4 text-emerald-400" />
				<span>Panduan Menambah Akun Pengurus Baru</span>
			</h3>
			<span class="text-[11px] text-slate-400">Prosedur Keamanan Database</span>
		</div>

		<p class="text-xs text-slate-300 leading-relaxed">
			Untuk menjaga keamanan sistem dan mencegah modifikasi tidak terotorisasi, peningkatan hak akses admin baru dapat dilakukan langsung melalui query SQL di Supabase:
		</p>

		<div class="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
			<div class="flex items-center justify-between">
				<span class="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
					<Terminal class="w-3.5 h-3.5 text-emerald-400" />
					Jalankan di Supabase SQL Editor:
				</span>
				<button
					type="button"
					class="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
					onclick={() => copySnippet("UPDATE public.profiles SET role = 'admin' WHERE email = 'email_pengurus@ut.ac.id';")}
				>
					{#if copiedSql}
						<Check class="w-3.5 h-3.5 text-emerald-400" />
						<span class="text-emerald-400 font-semibold">Tersalin!</span>
					{:else}
						<Copy class="w-3.5 h-3.5" />
						<span>Salin SQL</span>
					{/if}
				</button>
			</div>

			<pre class="p-3 rounded-lg bg-slate-900/90 font-mono text-xs text-emerald-400 overflow-x-auto border border-slate-800 select-all">UPDATE public.profiles
SET role = 'admin'
WHERE email = 'email_pengurus@ut.ac.id';</pre>
		</div>
	</div>
</div>

