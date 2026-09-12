<script lang="ts">
	import './layout.css';
	import { page } from '$app/state';
	import Navbar from '$lib/components/Navbar.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import Toast from '$lib/components/ui/Toast.svelte';

	let { data, children } = $props();

	// Check if on quiz screen or special clean screen
	const isQuizScreen = $derived(page.url.pathname === '/quiz' || page.url.pathname.startsWith('/quiz'));
	const isAdminScreen = $derived(page.url.pathname.startsWith('/admin'));
</script>

<div class="min-h-screen flex flex-col bg-slate-50 text-slate-900">
	{#if !isQuizScreen && !isAdminScreen}
		<Navbar user={data.user} profile={data.profile} />
	{/if}

	<main class="flex-1 flex flex-col">
		{@render children()}
	</main>

	{#if !isQuizScreen && !isAdminScreen}
		<Footer />
	{/if}

	<Toast />
</div>
