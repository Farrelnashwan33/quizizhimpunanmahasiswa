<script lang="ts">
	import { enhance } from '$app/forms';
	import Card from '$lib/components/ui/Card.svelte';
	import Input from '$lib/components/ui/Input.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import Badge from '$lib/components/ui/Badge.svelte';
	import { GraduationCap, User, Mail, Hash, Phone, Lock, ArrowRight, ShieldCheck, BookOpen } from 'lucide-svelte';

	let { form } = $props();
	let loading = $state(false);
</script>

<svelte:head>
	<title>Daftar Peserta Kaderisasi I - HIMA FST UT Bandung</title>
</svelte:head>

<div class="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12 bg-linear-to-b from-emerald-50/40 via-slate-50 to-slate-100">
	<div class="max-w-xl w-full">
		<!-- Header -->
		<div class="text-center mb-8">
			<div class="inline-flex items-center justify-center w-14 h-14 rounded-2xl emerald-gradient text-white shadow-lg shadow-emerald-600/20 mb-4">
				<GraduationCap class="w-8 h-8" />
			</div>
			<Badge variant="emerald" size="md" class="mb-3">Registrasi Peserta</Badge>
			<h1 class="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
				Kaderisasi Tingkat I HIMA FST
			</h1>
			<p class="text-sm text-slate-600 mt-2">
				Fakultas Sains dan Teknologi Universitas Terbuka Bandung
			</p>
		</div>

		<!-- Card Form -->
		<Card glass padding="lg" class="shadow-xl">
			{#if form?.error}
				<div class="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm font-medium flex items-start gap-3 animate-in fade-in duration-200">
					<div class="shrink-0 w-5 h-5 rounded-full bg-rose-200 text-rose-700 flex items-center justify-center font-bold text-xs mt-0.5">!</div>
					<div class="flex-1">{form.error}</div>
				</div>
			{/if}

			<form
				method="POST"
				use:enhance={() => {
					loading = true;
					return async ({ update }) => {
						loading = false;
						await update();
					};
				}}
				class="space-y-4"
			>
				<!-- Nama Lengkap -->
				<Input
					label="Nama Lengkap"
					name="fullName"
					id="fullName"
					required
					placeholder="Masukkan nama lengkap sesuai data UT"
					value={form?.values?.fullName || ''}
				>
					{#snippet iconLeft()}
						<User class="w-4 h-4" />
					{/snippet}
				</Input>

				<!-- Grid: NIM & Program Studi -->
				<div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
					<Input
						label="NIM (Nomor Induk Mahasiswa)"
						name="nim"
						id="nim"
						required
						placeholder="Contoh: 045123456"
						value={form?.values?.nim || ''}
					>
						{#snippet iconLeft()}
							<Hash class="w-4 h-4" />
						{/snippet}
					</Input>

					<Input
						label="Program Studi"
						name="programStudi"
						id="programStudi"
						required
						placeholder="Contoh: Sistem Informasi"
						value={form?.values?.programStudi || ''}
					>
						{#snippet iconLeft()}
							<BookOpen class="w-4 h-4" />
						{/snippet}
					</Input>
				</div>

				<!-- Grid: Email & WhatsApp -->
				<div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
					<Input
						label="Alamat Email"
						type="email"
						name="email"
						id="email"
						required
						placeholder="nama@ecampus.ut.ac.id"
						value={form?.values?.email || ''}
					>
						{#snippet iconLeft()}
							<Mail class="w-4 h-4" />
						{/snippet}
					</Input>

					<Input
						label="Nomor WhatsApp"
						type="tel"
						name="whatsapp"
						id="whatsapp"
						placeholder="081234567890 (Opsional)"
						value={form?.values?.whatsapp || ''}
					>
						{#snippet iconLeft()}
							<Phone class="w-4 h-4" />
						{/snippet}
					</Input>
				</div>

				<!-- Grid: Password & Konfirmasi -->
				<div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
					<Input
						label="Kata Sandi (Password)"
						type="password"
						name="password"
						id="password"
						required
						placeholder="Masukkan kata sandi"
					>
						{#snippet iconLeft()}
							<Lock class="w-4 h-4" />
						{/snippet}
					</Input>

					<Input
						label="Konfirmasi Kata Sandi"
						type="password"
						name="confirmPassword"
						id="confirmPassword"
						required
						placeholder="Ulangi kata sandi"
					>
						{#snippet iconLeft()}
							<Lock class="w-4 h-4" />
						{/snippet}
					</Input>
				</div>

				<div class="pt-3">
					<Button type="submit" variant="primary" size="lg" fullWidth {loading}>
						<span>Daftar & Ikuti Quiz</span>
						<ArrowRight class="w-4 h-4 ml-2" />
					</Button>
				</div>
			</form>

			<div class="mt-6 pt-6 border-t border-slate-100 text-center">
				<p class="text-xs text-slate-600">
					Sudah memiliki akun peserta?
					<a href="/login" class="font-bold text-emerald-600 hover:text-emerald-700 hover:underline ml-1">
						Masuk di sini
					</a>
				</p>
			</div>
		</Card>

		<!-- Security assurance banner -->
		<div class="mt-6 flex items-center justify-center gap-2 text-xs text-slate-500">
			<ShieldCheck class="w-4 h-4 text-emerald-600" />
			<span>Data Anda terenkripsi aman dan hanya digunakan untuk kegiatan kaderisasi FST.</span>
		</div>
	</div>
</div>
