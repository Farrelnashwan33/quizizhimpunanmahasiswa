import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getQuizAttemptById } from '$lib/server/dbService';

export const GET: RequestHandler = async ({ params, locals }) => {
	if (locals.profile?.role !== 'admin' && locals.user?.id !== 'admin-0000-0000-0000-000000000001') {
		return json({ success: false, error: 'Unauthorized admin access' }, { status: 403 });
	}

	const participantId = params.participantId;

	try {
		const result = await getQuizAttemptById(participantId);

		if (!result) {
			return json({ success: false, error: 'Data pengerjaan tidak ditemukan' }, { status: 404 });
		}

		const attempt = result.attempt;
		const student = result.student;

		return json({
			success: true,
			attempt: {
				id: attempt.id,
				studentName: student?.fullName,
				nim: student?.nim,
				programStudi: student?.programStudi,
				status: attempt.status,
				startedAt: attempt.startedAt,
				submittedAt: attempt.submittedAt,
				score: attempt.score,
				correctCount: attempt.correctCount,
				wrongCount: attempt.wrongCount,
				totalQuestions: attempt.totalQuestions
			},
			answers: result.detailedQuestions
		});
	} catch (err: any) {
		console.error('Error fetching admin answers API:', err);
		return json({ success: false, error: err?.message || 'Database error' }, { status: 500 });
	}
};

