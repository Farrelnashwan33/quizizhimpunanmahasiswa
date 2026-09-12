import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { prisma } from '$lib/server/prisma';

export const load: PageServerLoad = async ({ params }) => {
	const attemptId = params.attemptId;

	try {
		const attempt = await prisma.quizAttempt.findUnique({
			where: { id: attemptId },
			include: {
				student: true,
				quiz: true,
				answers: {
					include: {
						question: true
					}
				}
			}
		});

		if (!attempt) {
			throw error(404, 'Data pengerjaan peserta tidak ditemukan');
		}

	// Also fetch all questions to show any unanswered ones properly
	const allQuestions = await prisma.question.findMany({
		where: { quizId: attempt.quizId },
		orderBy: { questionNumber: 'asc' }
	});

	// Map answers by questionId
	const answerMap = new Map();
	for (const a of attempt.answers) {
		answerMap.set(a.questionId, a);
	}

	// Build composite question-answer list 1 to 30
	const detailedQuestions = allQuestions.map((q) => {
		const ans = answerMap.get(q.id);
		return {
			question: q,
			studentAnswer: ans?.selectedAnswer || null,
			isCorrect: ans?.isCorrect ?? false,
			answeredAt: ans?.answeredAt || null
		};
	});

		return {
			attempt,
			student: attempt.student,
			quiz: attempt.quiz,
			detailedQuestions
		};
	} catch (err: any) {
		console.error('Error loading attempt detail:', err);
		throw error(404, 'Data pengerjaan peserta tidak ditemukan atau database belum terhubung');
	}
};
