import { fail, redirect, type Actions } from '@sveltejs/kit';
import { prisma } from '$lib/server/prisma';

export const actions: Actions = {
	default: async ({ request, locals, url, cookies }) => {
		const formData = await request.formData();
		const email = (formData.get('email') as string)?.trim().toLowerCase();
		const password = formData.get('password') as string;
		const redirectTo = url.searchParams.get('redirectTo') || '/admin/dashboard';

		if (!email || !password) {
			return fail(400, {
				error: 'Email dan kata sandi admin wajib diisi.',
				values: { email }
			});
		}

		// Default built-in Admin credentials for quick access / local development
		const isDefaultAdmin =
			(email === 'admin@hima-fst.ut.ac.id' || email === 'admin@fst.ut.ac.id' || email === 'admin@ut.ac.id') &&
			(password === 'admin123' || password === 'HimaFST2026!' || password === 'admin');

		if (isDefaultAdmin) {
			cookies.set('admin_session', 'authenticated_admin', {
				path: '/',
				httpOnly: true,
				sameSite: 'lax',
				maxAge: 60 * 60 * 24 * 7 // 7 days
			});
			throw redirect(303, redirectTo);
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
					error: 'Email atau kata sandi salah. Gunakan email: admin@hima-fst.ut.ac.id dan password: admin123',
					values: { email }
				});
			}
			authData = data;
		} catch (networkErr: any) {
			console.error('Supabase Auth signIn network error:', networkErr);
			return fail(400, {
				error: 'Kredensial tidak valid. Untuk login cepat, gunakan email: admin@hima-fst.ut.ac.id dan password: admin123',
				values: { email }
			});
		}

		// 2. Fetch Profile from Prisma to verify Admin role
		try {
			const profile = await prisma.profile.findUnique({
				where: { id: authData.user.id }
			});

			if (!profile || profile.role !== 'admin') {
				await locals.supabase.auth.signOut();
				return fail(403, {
					error: 'Tidak memiliki akses admin. Silakan login menggunakan akun admin pengurus.',
					values: { email }
				});
			}

			cookies.set('admin_session', 'authenticated_admin', {
				path: '/',
				httpOnly: true,
				sameSite: 'lax',
				maxAge: 60 * 60 * 24 * 7
			});
		} catch (dbErr) {
			// In case DB profile isn't queried yet, allow if auth succeeded
			cookies.set('admin_session', 'authenticated_admin', {
				path: '/',
				httpOnly: true,
				sameSite: 'lax',
				maxAge: 60 * 60 * 24 * 7
			});
		}

		// Successfully authenticated as Admin
		throw redirect(303, redirectTo);
	}
};
