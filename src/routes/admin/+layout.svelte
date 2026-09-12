<script lang="ts">
	import { page } from '$app/state';
	import AdminSidebar from '$lib/components/AdminSidebar.svelte';
	import { Menu } from 'lucide-svelte';

	let { data, children } = $props();

	const isLoginPage = $derived(page.url.pathname === '/admin/login');
	let mobileSidebarOpen = $state(false);
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
			<!-- Page Content -->
			<div class="p-3 sm:p-6 lg:p-8 flex-1 w-full max-w-full overflow-x-hidden">
				{@render children()}
			</div>
		</div>
	</div>
{/if}
