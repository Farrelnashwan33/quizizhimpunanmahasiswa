import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { prisma } from '$lib/server/prisma';
import { OFFICIAL_30_QUESTIONS } from '$lib/data/questions';

export const GET: RequestHandler = async () => {
	try {
		const quiz = await prisma.quiz.findFirst({
			where: { isActive: true }
		});

		const dbQuestions = await prisma.question.findMany({
			where: quiz ? { quizId: quiz.id } : {},
			orderBy: { questionNumber: 'asc' }
		});

		if (dbQuestions && dbQuestions.length > 0) {
			const sanitized = dbQuestions.map((q) => ({
				id: q.id,
				questionNumber: q.questionNumber,
				section: q.section,
				questionText: q.questionText,
				optionA: q.optionA,
				optionB: q.optionB,
				optionC: q.optionC,
				optionD: q.optionD
			}));

			return json({
				success: true,
				questions: sanitized,
				totalQuestions: sanitized.length
			});
		}
	} catch (err) {
		console.warn('Error fetching questions from DB:', err);
	}

	const fallbackSanitized = OFFICIAL_30_QUESTIONS.map((q) => ({
		id: q.id,
		questionNumber: q.questionNumber,
		section: q.section,
		questionText: q.questionText,
		optionA: q.optionA,
		optionB: q.optionB,
		optionC: q.optionC,
		optionD: q.optionD
	}));

	return json({
		success: true,
		questions: fallbackSanitized,
		totalQuestions: fallbackSanitized.length
	});
};
