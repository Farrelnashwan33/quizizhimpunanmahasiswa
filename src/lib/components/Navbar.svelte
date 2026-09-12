<script lang="ts">
	import { page } from '$app/state';
	import Button from './ui/Button.svelte';
	import Badge from './ui/Badge.svelte';
	import logoHima from '$lib/assets/logo-hima.png';
	import { 
		GraduationCap, 
		LogOut, 
		User, 
		ShieldCheck, 
		BookOpen, 
		Home, 
		Menu, 
		X 
	} from 'lucide-svelte';

	interface Props {
		user?: any;
		profile?: any;
	}

	let { user, profile }: Props = $props();
	let mobileMenuOpen = $state(false);
</script>

<header class="sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white/90 backdrop-blur-md transition-all">
	<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
		<!-- Brand & Logo -->
		<a href="/" class="flex items-center gap-3 group">
			<div class="w-10 h-10 rounded-xl bg-white p-1 flex items-center justify-center shadow-md shadow-emerald-700/10 border border-slate-200/80 group-hover:scale-105 transition-transform overflow-hidden shrink-0">
				<img src={logoHima} alt="Logo HIMA FST UT" class="w-full h-full object-contain" />
			</div>
			<div>
				<div class="flex items-center gap-2">
					<span class="font-bold text-base sm:text-lg text-slate-900 tracking-tight leading-tight group-hover:text-emerald-600 transition-colors">
						HIMA FST UT Bandung
					</span>
					<Badge variant="emerald" size="sm">Kaderisasi I</Badge>
				</div>
				<p class="text-xs text-slate-500 font-medium hidden sm:block">
					Himpunan Mahasiswa Fakultas Sains dan Teknologi Universitas Terbuka
				</p>
			</div>
		</a>

		<!-- Desktop Navigation -->
		<nav class="hidden md:flex items-center gap-2">
			{#if !user}
				<a href="/" class="px-3.5 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all">
					Beranda
				</a>
				<Button href="/quiz" variant="primary" size="sm">
					Mulai Quiz
				</Button>
			{:else}
				{#if profile?.role === 'admin'}
					<a href="/admin/dashboard" class="px-3.5 py-2 text-sm font-semibold text-emerald-700 bg-emerald-50 rounded-xl transition-all flex items-center gap-1.5">
						<ShieldCheck class="w-4 h-4" />
						Panel Admin
					</a>
				{:else}
					<a href="/dashboard" class="px-3.5 py-2 text-sm font-semibold text-emerald-700 bg-emerald-50 rounded-xl transition-all flex items-center gap-1.5">
						<BookOpen class="w-4 h-4" />
						Dashboard Mahasiswa
					</a>
				{/if}

				<!-- User Profile Capsule -->
				<div class="flex items-center gap-3 pl-3 border-l border-slate-200">
					<div class="text-right hidden lg:block">
						<p class="text-xs font-bold text-slate-900 leading-tight">
							{profile?.fullName || user.email?.split('@')[0]}
						</p>
						<p class="text-[11px] text-slate-500 font-medium">
							{profile?.nim || (profile?.role === 'admin' ? 'Pengurus Admin' : 'Mahasiswa')}
						</p>
					</div>

					<form action="/logout" method="POST">
						<Button type="submit" variant="outline" size="sm" class="text-slate-600 hover:text-rose-600 hover:border-rose-200 hover:bg-rose-50">
							<LogOut class="w-4 h-4 mr-1" />
							Keluar
						</Button>
					</form>
				</div>
			{/if}
		</nav>

		<!-- Mobile menu button -->
		<div class="md:hidden flex items-center gap-2">
			<button
				type="button"
				class="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
				onclick={() => mobileMenuOpen = !mobileMenuOpen}
				aria-label="Buka menu"
			>
				{#if mobileMenuOpen}
					<X class="w-6 h-6" />
				{:else}
					<Menu class="w-6 h-6" />
				{/if}
			</button>
		</div>
	</div>

	<!-- Mobile dropdown -->
	{#if mobileMenuOpen}
		<div class="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-5 space-y-2 animate-in slide-in-from-top duration-200">
			{#if !user}
				<a href="/" class="block px-3 py-2 text-sm font-medium text-slate-700 rounded-lg hover:bg-slate-50" onclick={() => mobileMenuOpen = false}>
					Beranda
				</a>
				<div class="pt-2">
					<Button href="/quiz" variant="primary" size="sm" fullWidth onclick={() => mobileMenuOpen = false}>
						Mulai Kerjakan Quiz
					</Button>
				</div>
			{:else}
				<div class="p-3 bg-slate-50 rounded-xl mb-3">
					<p class="text-sm font-bold text-slate-900">{profile?.fullName || user.email}</p>
					<p class="text-xs text-slate-500">{profile?.programStudi || (profile?.role === 'admin' ? 'Admin Pengurus' : 'Mahasiswa')} • NIM: {profile?.nim || '-'}</p>
				</div>

				{#if profile?.role === 'admin'}
					<a href="/admin/dashboard" class="block px-3 py-2 text-sm font-medium text-emerald-700 bg-emerald-50 rounded-lg" onclick={() => mobileMenuOpen = false}>
						Dashboard Admin
					</a>
					<a href="/admin/peserta" class="block px-3 py-2 text-sm font-medium text-slate-700 rounded-lg hover:bg-slate-50" onclick={() => mobileMenuOpen = false}>
						Daftar Peserta
					</a>
					<a href="/admin/soal" class="block px-3 py-2 text-sm font-medium text-slate-700 rounded-lg hover:bg-slate-50" onclick={() => mobileMenuOpen = false}>
						Kelola Soal Quiz
					</a>
				{:else}
					<a href="/dashboard" class="block px-3 py-2 text-sm font-medium text-emerald-700 bg-emerald-50 rounded-lg" onclick={() => mobileMenuOpen = false}>
						Dashboard Mahasiswa
					</a>
				{/if}

				<form action="/logout" method="POST" class="pt-2">
					<Button type="submit" variant="danger" size="sm" fullWidth>
						<LogOut class="w-4 h-4 mr-1.5" />
						Keluar Akun
					</Button>
				</form>
			{/if}
		</div>
	{/if}
</header>
