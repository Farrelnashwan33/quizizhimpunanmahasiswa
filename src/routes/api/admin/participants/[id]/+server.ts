import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getQuizAttemptById, getAllMahasiswa } from '$lib/server/dbService';

export const GET: RequestHandler = async ({ params, locals }) => {
	if (locals.profile?.role !== 'admin' && locals.user?.id !== 'admin-0000-0000-0000-000000000001') {
		return json({ success: false, error: 'Unauthorized admin access' }, { status: 403 });
	}

	const participantId = params.id;

	try {
		const attemptRes = await getQuizAttemptById(participantId);
		if (attemptRes) {
			return json({
				success: true,
				participant: {
					...attemptRes.student,
					attempt: attemptRes.attempt,
					detailedQuestions: attemptRes.detailedQuestions
				}
			});
		}

		const mhsRes = await getAllMahasiswa({ search: participantId });
		const found = mhsRes.students.find((s) => s.id === participantId || s.nim === participantId);

		if (found) {
			return json({
				success: true,
				participant: found
			});
		}

		return json({ success: false, error: 'Peserta tidak ditemukan' }, { status: 404 });
	} catch (err: any) {
		console.error('Error fetching admin participant by id API:', err);
		return json({ success: false, error: err?.message || 'Database error' }, { status: 500 });
	}
};

