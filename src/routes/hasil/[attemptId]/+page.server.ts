import { error, redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { prisma } from '$lib/server/prisma';

export const load: PageServerLoad = async ({ params, locals }) => {
	if (!locals.user) {
		throw redirect(303, `/login?redirectTo=/hasil/${params.attemptId}`);
	}

	const attemptId = params.attemptId;

	// Fetch attempt
	const attempt = await prisma.quizAttempt.findUnique({
		where: { id: attemptId },
		include: {
			quiz: true,
			student: true,
			answers: {
				include: {
					question: true
				}
			}
		}
	});

	if (!attempt) {
		throw error(404, 'Hasil quiz tidak ditemukan.');
	}

	// Security: Mahasiswa can only view their own attempt, admin can view any
	const isAdmin = locals.profile?.role === 'admin';
	if (attempt.studentId !== locals.user.id && !isAdmin) {
		throw error(403, 'Anda tidak memiliki izin untuk melihat hasil peserta lain.');
	}

	// If quiz allows showing answer review, send detailed answers, else hide
	const canReviewAnswers = attempt.quiz.showResult || isAdmin;

	// Sort answers by question number
	const sortedAnswers = attempt.answers.sort(
		(a, b) => (a.question?.questionNumber || 0) - (b.question?.questionNumber || 0)
	);

	return {
		attempt,
		quiz: attempt.quiz,
		student: attempt.student,
		canReviewAnswers,
		answers: canReviewAnswers ? sortedAnswers : []
	};
};
