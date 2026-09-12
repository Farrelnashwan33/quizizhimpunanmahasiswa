import { fail, redirect, type Actions } from '@sveltejs/kit';
import { prisma } from '$lib/server/prisma';

export const actions: Actions = {
	default: async ({ request, locals, url }) => {
		const formData = await request.formData();
		const email = (formData.get('email') as string)?.trim().toLowerCase();
		const password = formData.get('password') as string;
		const redirectTo = url.searchParams.get('redirectTo') || '/dashboard';

		if (!email || !password) {
			return fail(400, {
				error: 'Email dan password wajib diisi.',
				values: { email }
			});
		}

		// 1. Supabase Auth Sign In
		let authData: any = null;
		try {
			const { data, error } = await locals.supabase.auth.signInWithPassword({
				email,
				password
			});

			if (error || !data.user) {
				return fail(400, {
					error: 'Email atau password yang Anda masukkan salah. Silakan periksa kembali.',
					values: { email }
				});
			}
			authData = data;
		} catch (networkErr: any) {
			console.error('Supabase Auth signIn network error:', networkErr);
			return fail(500, {
				error: 'Gagal terhubung ke Supabase (fetch failed). Pastikan konfigurasi URL dan Key Supabase di file .env sudah benar.',
				values: { email }
			});
		}

		// 2. Fetch Profile from Prisma to check role
		let role = 'mahasiswa';
		try {
			const profile = await prisma.profile.findUnique({
				where: { id: authData.user.id }
			});
			if (profile) {
				role = profile.role;
			}
		} catch (err) {
			console.error('Error fetching profile on login:', err);
		}

		// If admin logs in from student login, redirect them directly to admin dashboard
		if (role === 'admin') {
			throw redirect(303, '/admin/dashboard');
		}

		throw redirect(303, redirectTo);
	}
};
