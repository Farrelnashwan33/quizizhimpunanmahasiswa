import { error, redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getQuizAttemptById } from '$lib/server/dbService';

export const load: PageServerLoad = async ({ params, locals }) => {
	if (!locals.user) {
		throw redirect(303, `/login?redirectTo=/hasil/${params.attemptId}`);
	}

	const attemptId = params.attemptId;

	// Fetch attempt via resilient dual-engine dbService
	const result = await getQuizAttemptById(attemptId);

	if (!result || !result.attempt) {
		throw error(404, 'Hasil quiz tidak ditemukan.');
	}

	const { attempt, student, quiz, detailedQuestions } = result;

	// Security: Mahasiswa can only view their own attempt, admin can view any
	const isAdmin = locals.profile?.role === 'admin';
	if (attempt.studentId !== locals.user.id && attempt.student?.email !== locals.user.email && !isAdmin) {
		throw error(403, 'Anda tidak memiliki izin untuk melihat hasil peserta lain.');
	}

	// If quiz allows showing answer review, send detailed answers, else hide
	const canReviewAnswers = quiz?.isActive !== false || isAdmin;

	return {
		attempt,
		quiz,
		student,
		canReviewAnswers,
		answers: canReviewAnswers ? detailedQuestions : []
	};
};

