<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/state';
	import AdminSidebar from '$lib/components/AdminSidebar.svelte';
	import { ShieldAlert, Bell, X, Volume2, VolumeX, AlertTriangle, Menu } from 'lucide-svelte';

	let { data, children } = $props();

	const isLoginPage = $derived(page.url.pathname === '/admin/login');

	interface LiveViolation {
		id: string;
		studentName: string;
		nim: string;
		programStudi: string;
		violationCount: number;
		timestamp: string;
		message: string;
	}

	let latestViolations = $state<LiveViolation[]>([]);
	let activeAlert = $state<LiveViolation | null>(null);
	let soundEnabled = $state(true);
	let lastSeenId = $state<string>('');
	let showViolationsDrawer = $state(false);
	let mobileSidebarOpen = $state(false);

	function playAdminWarningBeep() {
		if (!soundEnabled) return;
		try {
			const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
			if (!AudioCtx) return;
			const ctx = new AudioCtx();
			const now = ctx.currentTime;

			const osc = ctx.createOscillator();
			const gain = ctx.createGain();

			osc.type = 'triangle';
			osc.frequency.setValueAtTime(587.33, now); // D5
			osc.frequency.setValueAtTime(880, now + 0.15); // A5

			gain.gain.setValueAtTime(0.2, now);
			gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);

			osc.connect(gain);
			gain.connect(ctx.destination);

			osc.start(now);
			osc.stop(now + 0.36);
		} catch (e) {}
	}

	onMount(() => {
		async function fetchLiveViolations() {
			try {
				const res = await fetch('/api/admin/live-violations');
				const json = await res.json();
				if (json.success && json.violations && json.violations.length > 0) {
					latestViolations = json.violations;
					const newest = json.violations[0];
					if (newest && newest.id !== lastSeenId) {
						lastSeenId = newest.id;
						activeAlert = newest;
						playAdminWarningBeep();
					}
				}
			} catch (e) {}
		}

		fetchLiveViolations();
		const interval = setInterval(fetchLiveViolations, 3000);

		return () => clearInterval(interval);
	});
</script>

{#if isLoginPage}
	<main class="min-h-screen w-full bg-slate-950 flex flex-col justify-center">
		{@render children()}
	</main>
{:else}
	<div class="min-h-screen flex flex-col lg:flex-row bg-slate-900 text-slate-100 relative">
		<!-- Mobile Header for Admin Panel -->
		<header class="lg:hidden bg-slate-900 border-b border-slate-800 px-4 py-3 flex items-center justify-between sticky top-0 z-30">
			<div class="flex items-center gap-2.5">
				<button
					type="button"
					class="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white transition-colors"
					onclick={() => mobileSidebarOpen = !mobileSidebarOpen}
					aria-label="Toggle Menu"
				>
					<Menu class="w-5 h-5" />
				</button>
				<span class="font-bold text-sm text-white">Admin Penilaian Kaderisasi 1</span>
			</div>
			<div class="flex items-center gap-2">
				<button
					type="button"
					class="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white"
					onclick={() => soundEnabled = !soundEnabled}
					title={soundEnabled ? 'Matikan Suara' : 'Nyalakan Suara'}
				>
					{#if soundEnabled}
						<Volume2 class="w-4 h-4 text-emerald-400" />
					{:else}
						<VolumeX class="w-4 h-4 text-slate-500" />
					{/if}
				</button>
				{#if latestViolations.length > 0}
					<button
						type="button"
						class="px-2.5 py-1 rounded-lg bg-rose-900 text-rose-200 text-xs font-bold flex items-center gap-1"
						onclick={() => showViolationsDrawer = true}
					>
						<Bell class="w-3.5 h-3.5" />
						<span>{latestViolations.length}</span>
					</button>
				{/if}
			</div>
		</header>

		<!-- Mobile Backdrop -->
		{#if mobileSidebarOpen}
			<button
				type="button"
				class="fixed inset-0 z-40 bg-black/70 backdrop-blur-xs lg:hidden cursor-default w-full h-full border-none p-0"
				onclick={() => mobileSidebarOpen = false}
				aria-label="Tutup sidebar"
			></button>
		{/if}

		<!-- Admin Sidebar Drawer for Mobile / Static for Desktop -->
		<div class="fixed inset-y-0 left-0 z-50 transform {mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static transition-transform duration-300 ease-in-out">
			<AdminSidebar profile={data.profile} />
		</div>

		<!-- Main Admin Content Area -->
		<div class="flex-1 bg-slate-950 flex flex-col overflow-y-auto min-w-0">
			<!-- Top Live Proctoring Bar (Desktop) -->
			<div class="hidden lg:flex bg-slate-900/90 border-b border-slate-800/80 px-4 sm:px-6 py-2.5 items-center justify-between gap-3 text-xs">
				<div class="flex items-center gap-2">
					<span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
					<span class="font-bold text-slate-300">Sistem Pengawas Daring (Live Proctoring)</span>
					{#if latestViolations.length > 0}
						<span class="px-2 py-0.5 rounded-full bg-rose-950 text-rose-300 border border-rose-800 text-[10px] font-bold">
							{latestViolations.length} Pelanggaran Terdeteksi
						</span>
					{:else}
						<span class="px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800 text-[10px] font-medium">
							Semua Peserta Tertib
						</span>
					{/if}
				</div>

				<div class="flex items-center gap-2">
					<button
						type="button"
						class="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-300 transition-colors cursor-pointer"
						title={soundEnabled ? 'Matikan Suara Alarm Admin' : 'Nyalakan Suara Alarm Admin'}
						onclick={() => soundEnabled = !soundEnabled}
					>
						{#if soundEnabled}
							<Volume2 class="w-4 h-4 text-emerald-400" />
						{:else}
							<VolumeX class="w-4 h-4 text-slate-500" />
						{/if}
					</button>

					{#if latestViolations.length > 0}
						<button
							type="button"
							class="px-2.5 py-1 rounded-lg bg-rose-900/60 hover:bg-rose-900 text-rose-200 border border-rose-700/80 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
							onclick={() => showViolationsDrawer = !showViolationsDrawer}
						>
							<Bell class="w-3.5 h-3.5" />
							<span>Log Pelanggaran ({latestViolations.length})</span>
						</button>
					{/if}
				</div>
			</div>

			<!-- Live Cheating Alert Emergency Banner (When someone opens a new tab) -->
			{#if activeAlert}
				<div class="bg-rose-600 text-white px-4 sm:px-6 py-3 shadow-xl flex items-center justify-between gap-4 animate-in slide-in-from-top duration-300">
					<div class="flex items-center gap-3">
						<div class="w-8 h-8 rounded-full bg-white text-rose-600 flex items-center justify-center font-bold shrink-0 animate-bounce">
							<AlertTriangle class="w-5 h-5" />
						</div>
						<div>
							<p class="font-bold text-sm tracking-tight flex flex-wrap items-center gap-2">
								<span>🚨 PERINGATAN KECURANGAN LIVE:</span>
								<span class="underline decoration-white underline-offset-2">{activeAlert.studentName}</span>
								<span class="font-mono text-xs opacity-90">(NIM: {activeAlert.nim} • {activeAlert.programStudi})</span>
							</p>
							<p class="text-xs text-rose-100 mt-0.5">
								Terdeteksi membuka tab baru atau berpindah jendela browser! (Pelanggaran ke-{activeAlert.violationCount}) • Pukul {activeAlert.timestamp}
							</p>
						</div>
					</div>

					<button
						type="button"
						class="p-1 rounded-lg hover:bg-rose-700 text-white/80 hover:text-white transition-colors cursor-pointer"
						onclick={() => activeAlert = null}
						aria-label="Tutup notifikasi"
					>
						<X class="w-5 h-5" />
					</button>
				</div>
			{/if}

			<!-- Page Content -->
			<div class="p-3 sm:p-6 lg:p-8 flex-1 w-full max-w-full overflow-x-hidden">
				{@render children()}
			</div>
		</div>
	</div>

	<!-- Modal/Drawer Log Pelanggaran Real-Time -->
	{#if showViolationsDrawer}
		<div class="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex justify-end animate-in fade-in duration-200">
			<div class="w-full max-w-md bg-slate-900 border-l border-slate-800 h-full p-6 flex flex-col shadow-2xl overflow-hidden">
				<div class="flex items-center justify-between pb-4 border-b border-slate-800">
					<div>
						<h3 class="font-bold text-white text-base flex items-center gap-2">
							<ShieldAlert class="w-5 h-5 text-rose-400" />
							<span>Log Deteksi Buka Tab Baru</span>
						</h3>
						<p class="text-xs text-slate-400 mt-0.5">Aktivitas peserta yang tertangkap pengawas.</p>
					</div>
					<button
						type="button"
						class="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
						onclick={() => showViolationsDrawer = false}
					>
						<X class="w-5 h-5" />
					</button>
				</div>

				<div class="flex-1 overflow-y-auto py-4 space-y-3">
					{#each latestViolations as v}
						<div class="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
							<div class="flex items-center justify-between">
								<span class="font-bold text-white text-sm">{v.studentName}</span>
								<span class="px-2 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800 text-[10px] font-bold">
									Ke-{v.violationCount}x
								</span>
							</div>
							<p class="text-xs text-slate-400 font-mono">NIM: {v.nim} • {v.programStudi}</p>
							<div class="flex items-center justify-between pt-1 text-[11px] text-slate-500 border-t border-slate-900">
								<span class="text-rose-400 font-medium">Buka Tab / Unfocus</span>
								<span>{v.timestamp}</span>
							</div>
						</div>
					{/each}
				</div>

				<div class="pt-4 border-t border-slate-800 text-center">
					<button
						type="button"
						class="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold transition-colors cursor-pointer"
						onclick={() => showViolationsDrawer = false}
					>
						Tutup Log
					</button>
				</div>
			</div>
		</div>
	{/if}
{/if}
