import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getAllQuizAttempts } from '$lib/server/dbService';

export const GET: RequestHandler = async ({ url, locals }) => {
	// Check admin access
	if (locals.profile?.role !== 'admin' && locals.user?.id !== 'admin-0000-0000-0000-000000000001') {
		return json({ success: false, error: 'Unauthorized admin access' }, { status: 403 });
	}

	const search = url.searchParams.get('q') || '';
	const prodi = url.searchParams.get('prodi') || '';
	const status = url.searchParams.get('status') || '';
	const sort = url.searchParams.get('sort') || 'score_desc';

	try {
		const result = await getAllQuizAttempts({
			search,
			prodi,
			status,
			sort,
			pageSize: 10000
		});

		return json({
			success: true,
			total: result.totalCount,
			participants: result.attempts,
			prodiList: result.prodiList
		});
	} catch (err: any) {
		console.error('Error fetching admin participants API:', err);
		return json({ success: false, error: err?.message || 'Database error' }, { status: 500 });
	}
};

