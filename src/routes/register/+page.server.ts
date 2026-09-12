import { fail, redirect, type Actions } from '@sveltejs/kit';
import { prisma } from '$lib/server/prisma';

export const actions: Actions = {
	default: async ({ request, locals }) => {
		const formData = await request.formData();
		const fullName = (formData.get('fullName') as string)?.trim();
		const nim = (formData.get('nim') as string)?.trim();
		const email = (formData.get('email') as string)?.trim().toLowerCase();
		const programStudi = (formData.get('programStudi') as string)?.trim();
		const whatsapp = (formData.get('whatsapp') as string)?.trim() || null;
		const password = formData.get('password') as string;
		const confirmPassword = formData.get('confirmPassword') as string;

		// 1. Validations
		if (!fullName || !nim || !email || !programStudi || !password || !confirmPassword) {
			return fail(400, {
				error: 'Semua kolom bertanda bintang (*) wajib diisi.',
				values: { fullName, nim, email, programStudi, whatsapp }
			});
		}

		if (password !== confirmPassword) {
			return fail(400, {
				error: 'Konfirmasi password tidak cocok.',
				values: { fullName, nim, email, programStudi, whatsapp }
			});
		}

		// 2. Check duplicate NIM or Email in database if DB is reachable
		try {
			const existingNim = await prisma.profile.findUnique({
				where: { nim }
			});
			if (existingNim) {
				return fail(400, {
					error: `NIM ${nim} sudah terdaftar. Silakan gunakan NIM Anda sendiri atau login jika sudah memiliki akun.`,
					values: { fullName, nim, email, programStudi, whatsapp }
				});
			}

			const existingEmail = await prisma.profile.findUnique({
				where: { email }
			});
			if (existingEmail) {
				return fail(400, {
					error: `Email ${email} sudah terdaftar. Silakan masuk melalui halaman login.`,
					values: { fullName, nim, email, programStudi, whatsapp }
				});
			}
		} catch (dbErr) {
			console.warn('Database pre-check notice (continuing to auth):', dbErr);
		}

		// 3. Register via Supabase Auth
		let authData: any = null;
		try {
			const res = await locals.supabase.auth.signUp({
				email,
				password,
				options: {
					data: {
						full_name: fullName,
						nim,
						program_studi: programStudi,
						whatsapp,
						role: 'mahasiswa'
					}
				}
			});

			if (res.error) {
				return fail(400, {
					error: res.error.message || 'Gagal mendaftar ke server autentikasi.',
					values: { fullName, nim, email, programStudi, whatsapp }
				});
			}
			authData = res.data;
		} catch (networkErr: any) {
			console.error('Supabase Auth signUp network error:', networkErr);
			return fail(500, {
				error: 'Gagal terhubung ke Supabase (fetch failed). Pastikan PUBLIC_SUPABASE_URL dan PUBLIC_SUPABASE_ANON_KEY di file .env sudah diisi dengan URL dan Key dari project Supabase Anda.',
				values: { fullName, nim, email, programStudi, whatsapp }
			});
		}

		if (!authData?.user) {
			return fail(400, {
				error: 'Pendaftaran gagal atau verifikasi email diperlukan.',
				values: { fullName, nim, email, programStudi, whatsapp }
			});
		}

		// 4. Ensure profile created in Prisma
		try {
			await prisma.profile.upsert({
				where: { id: authData.user.id },
				update: {
					fullName,
					nim,
					email,
					programStudi,
					whatsapp,
					role: 'mahasiswa'
				},
				create: {
					id: authData.user.id,
					fullName,
					nim,
					email,
					programStudi,
					whatsapp,
					role: 'mahasiswa'
				}
			});
		} catch (profileErr) {
			console.error('Error creating profile in Prisma:', profileErr);
		}

		// Redirect to dashboard if logged in, otherwise to login page
		if (authData.session) {
			throw redirect(303, '/dashboard');
		}

		throw redirect(303, '/login?registered=true');
	}
};
