import { createServerClient } from '@supabase/ssr';
import { type Handle, redirect } from '@sveltejs/kit';
import { env as publicEnv } from '$env/dynamic/public';
import { prisma } from '$lib/server/prisma';

export const handle: Handle = async ({ event, resolve }) => {
	const supabaseUrl = publicEnv.PUBLIC_SUPABASE_URL || 'https://placeholder-project.supabase.co';
	const supabaseAnonKey = publicEnv.PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key';

	event.locals.supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
		cookies: {
			getAll: () => event.cookies.getAll(),
			setAll: (cookiesToSet) => {
				cookiesToSet.forEach(({ name, value, options }) => {
					event.cookies.set(name, value, { ...options, path: '/' });
				});
			}
		}
	});

	event.locals.safeGetSession = async () => {
		try {
			const {
				data: { session }
			} = await event.locals.supabase.auth.getSession();
			if (!session) {
				return { session: null, user: null };
			}

			const {
				data: { user },
				error
			} = await event.locals.supabase.auth.getUser();
			if (error) {
				return { session: null, user: null };
			}

			return { session, user };
		} catch {
			return { session: null, user: null };
		}
	};

	const { session, user } = await event.locals.safeGetSession();
	const adminCookie = event.cookies.get('admin_session');

	if (adminCookie === 'authenticated_admin') {
		event.locals.user = {
			id: 'admin-0000-0000-0000-000000000001',
			email: 'admin@hima-fst.ut.ac.id'
		} as any;
		event.locals.profile = {
			id: 'admin-0000-0000-0000-000000000001',
			fullName: 'Administrator HIMA FST',
			nim: 'ADMIN-HIMA',
			email: 'admin@hima-fst.ut.ac.id',
			programStudi: 'Fakultas Sains dan Teknologi',
			role: 'admin',
			whatsapp: '08123456789'
		} as any;
		event.locals.session = session || ({ user: event.locals.user } as any);
	} else {
		event.locals.session = session;
		event.locals.user = user;

		// Load Profile from DB if user is authenticated (with safe fallback)
		if (user) {
			try {
				const profile = await prisma.profile.findUnique({
					where: { id: user.id }
				});
				event.locals.profile = profile;
			} catch (err) {
				event.locals.profile = null;
			}
		} else {
			event.locals.profile = null;
		}
	}

	const path = event.url.pathname;

	// 1. Admin Routes Protection (/admin/...)
	if (path.startsWith('/admin')) {
		// Allow access to admin login page
		if (path === '/admin/login') {
			if (event.locals.user && event.locals.profile?.role === 'admin') {
				throw redirect(303, '/admin/dashboard');
			}
		} else {
			// All other admin routes require authenticated admin
			if (!event.locals.user) {
				throw redirect(303, `/admin/login?redirectTo=${encodeURIComponent(path)}`);
			}
			if (event.locals.profile?.role !== 'admin') {
				throw redirect(303, '/admin/login?error=unauthorized_admin');
			}
		}
	}

	// Mahasiswa can freely access /quiz and /hasil directly without registering/login!

	return resolve(event, {
		filterSerializedResponseHeaders(name) {
			return name === 'content-range' || name === 'x-supabase-api-version';
		}
	});
};
