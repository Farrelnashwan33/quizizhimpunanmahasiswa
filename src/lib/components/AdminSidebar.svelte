<script lang="ts">
	import { page } from '$app/state';
	import logoHima from '$lib/assets/logo-hima.png';
	import {
		LayoutDashboard,
		Users,
		ClipboardList,
		HelpCircle,
		KeyRound,
		BarChart3,
		FileSpreadsheet,
		Settings,
		ShieldCheck,
		LogOut,
		GraduationCap
	} from 'lucide-svelte';

	interface Props {
		profile?: any;
	}

	let { profile }: Props = $props();

	const currentPath = $derived(page.url.pathname);

	const navItems = [
		{ name: '1. Dashboard Admin', href: '/admin/dashboard', icon: LayoutDashboard },
		{ name: '2. Data Mahasiswa', href: '/admin/mahasiswa', icon: Users },
		{ name: '3. Daftar Peserta Quiz', href: '/admin/peserta', icon: ClipboardList },
		{ name: '4. Soal Quiz (CRUD)', href: '/admin/soal', icon: HelpCircle },
		{ name: '5. Kunci Jawaban', href: '/admin/kunci-jawaban', icon: KeyRound },
		{ name: '6. Hasil & Statistik', href: '/admin/hasil', icon: BarChart3 },
		{ name: '7. Detail Jawaban', href: '/admin/peserta', icon: FileSpreadsheet },
		{ name: '8. Pengaturan Quiz', href: '/admin/pengaturan', icon: Settings },
		{ name: '9. Profil & Admin', href: '/admin/pengurus', icon: ShieldCheck }
	];
</script>

<aside class="w-64 shrink-0 border-r border-slate-200/80 bg-slate-900 text-slate-300 min-h-[calc(100vh-4rem)] flex flex-col justify-between p-4">
	<div class="space-y-6">
		<!-- Header -->
		<div class="px-2 py-1 flex items-center gap-3 border-b border-slate-800 pb-4">
			<div class="w-10 h-10 rounded-xl bg-white p-1 flex items-center justify-center border border-slate-700 shadow-sm overflow-hidden shrink-0">
				<img src={logoHima} alt="Logo HIMA FST UT" class="w-full h-full object-contain" />
			</div>
			<div>
				<h3 class="text-sm font-bold text-white tracking-tight">Admin Penilaian Kaderisasi 1</h3>
				<p class="text-[11px] text-emerald-400 font-medium">HIMA FST UT Bandung</p>
			</div>
		</div>

		<!-- Nav links -->
		<nav class="space-y-1">
			{#each navItems as item}
				{@const Icon = item.icon}
				{@const isActive = currentPath === item.href || (item.href !== '/admin/dashboard' && currentPath.startsWith(item.href))}
				<a
					href={item.href}
					class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 {isActive ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/30' : 'text-slate-400 hover:text-white hover:bg-slate-800/70'}"
				>
					<Icon class="w-4 h-4 shrink-0 {isActive ? 'text-white' : 'text-slate-400'}" />
					<span>{item.name}</span>
				</a>
			{/each}
		</nav>
	</div>

	<!-- Footer Admin info & logout -->
	<div class="pt-4 border-t border-slate-800 space-y-3">
		<div class="px-2">
			<p class="text-xs font-bold text-white truncate">{profile?.fullName || 'Pengurus Admin'}</p>
			<p class="text-[11px] text-slate-400 truncate">{profile?.email || 'admin@ut.ac.id'}</p>
		</div>

		<form action="/logout" method="POST">
			<button
				type="submit"
				class="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold text-rose-400 hover:text-white hover:bg-rose-600/20 rounded-xl border border-rose-950/60 transition-colors"
			>
				<LogOut class="w-3.5 h-3.5" />
				10. Logout Admin
			</button>
		</form>
	</div>
</aside>
