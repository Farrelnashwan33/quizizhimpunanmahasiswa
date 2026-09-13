import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getDashboardStatistics } from '$lib/server/dbService';

export const GET: RequestHandler = async ({ locals }) => {
	if (locals.profile?.role !== 'admin' && locals.user?.id !== 'admin-0000-0000-0000-000000000001') {
		return json({ success: false, error: 'Unauthorized admin access' }, { status: 403 });
	}

	try {
		const data = await getDashboardStatistics();
		return json({
			success: true,
			stats: data.stats,
			distribution: data.distribution
		});
	} catch (err: any) {
		console.error('Error fetching admin statistics API:', err);
		return json({ success: false, error: err?.message || 'Database error' }, { status: 500 });
	}
};

