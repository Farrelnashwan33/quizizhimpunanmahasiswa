import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getLiveViolations } from '$lib/server/participantStore';

export const GET: RequestHandler = async ({ locals }) => {
	// Only admin can access live violation feed
	if (!locals.user || locals.profile?.role !== 'admin') {
		return json({ success: false, error: 'Unauthorized' }, { status: 403 });
	}

	const violations = getLiveViolations();
	return json({
		success: true,
		violations,
		count: violations.length
	});
};
