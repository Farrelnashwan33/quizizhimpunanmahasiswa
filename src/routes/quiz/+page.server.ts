import type { PageServerLoad } from './$types';
import { prisma } from '$lib/server/prisma';
import { OFFICIAL_30_QUESTIONS } from '$lib/data/questions';

export const load: PageServerLoad = async () => {
	try {
		const quiz = await prisma.quiz.findFirst({
			where: { isActive: true }
		});

		const dbQuestions = await prisma.question.findMany({
			where: quiz ? { quizId: quiz.id } : {},
			orderBy: { questionNumber: 'asc' }
		});

		if (dbQuestions && dbQuestions.length > 0) {
			const questions = dbQuestions.map((q) => ({
				id: q.id,
				questionNumber: q.questionNumber,
				section: q.section,
				questionText: q.questionText,
				optionA: q.optionA,
				optionB: q.optionB,
				optionC: q.optionC,
				optionD: q.optionD
			}));

			return {
				questions,
				totalQuestions: questions.length
			};
		}
	} catch (err) {
		console.warn('Direct quiz loader: using default questions dataset fallback.');
	}

	// Fallback to in-memory official questions dataset if database is not queried yet
	const questions = OFFICIAL_30_QUESTIONS.map((q) => ({
		id: q.id,
		questionNumber: q.questionNumber,
		section: q.section,
		questionText: q.questionText,
		optionA: q.optionA,
		optionB: q.optionB,
		optionC: q.optionC,
		optionD: q.optionD
	}));

	return {
		questions,
		totalQuestions: questions.length
	};
};
