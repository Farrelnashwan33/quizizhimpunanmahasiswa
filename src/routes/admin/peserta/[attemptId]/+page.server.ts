import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { prisma, isDatabaseConfigured } from '$lib/server/prisma';
import { getAllAttempts } from '$lib/server/participantStore';
import { OFFICIAL_30_QUESTIONS } from '$lib/data/questions';

export const load: PageServerLoad = async ({ params }) => {
	const attemptId = params.attemptId;

	if (isDatabaseConfigured && attemptId.includes('-') && attemptId.length === 36) {
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

			if (attempt) {
				const allQuestions = await prisma.question.findMany({
					where: { quizId: attempt.quizId },
					orderBy: { questionNumber: 'asc' }
				});

				const answerMap = new Map();
				for (const a of attempt.answers) {
					answerMap.set(a.questionId, a);
				}

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
			}
		} catch (err: any) {
			console.warn('Error loading attempt detail from DB, checking memory store:', err);
		}
	}

	// Fallback to participantStore
	const memoryList = getAllAttempts();
	const memAttempt = memoryList.find((a) => a.id === attemptId || a.student.nim === attemptId);

	if (memAttempt) {
		const detailedQuestions = OFFICIAL_30_QUESTIONS.map((q) => {
			const ans = memAttempt.answers?.find(
				(a) => a.questionId === q.id || a.questionNumber === q.questionNumber
			);
			return {
				question: q,
				studentAnswer: ans?.studentAnswer || null,
				isCorrect: ans?.isCorrect ?? false,
				answeredAt: memAttempt.submittedAt
			};
		});

		return {
			attempt: memAttempt,
			student: memAttempt.student,
			quiz: memAttempt.quiz,
			detailedQuestions
		};
	}

	throw error(404, 'Data pengerjaan peserta tidak ditemukan.');
};
