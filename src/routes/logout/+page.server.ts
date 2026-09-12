import { redirect, type Actions } from '@sveltejs/kit';

export const actions: Actions = {
	default: async ({ locals, cookies }) => {
		cookies.delete('admin_session', { path: '/' });
		await locals.supabase.auth.signOut();
		throw redirect(303, '/');
	}
};
