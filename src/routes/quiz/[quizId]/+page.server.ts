import { error, redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { prisma } from '$lib/server/prisma';

export const load: PageServerLoad = async ({ params, locals }) => {
	if (!locals.user) {
		throw redirect(303, `/login?redirectTo=/quiz/${params.quizId}`);
	}

	const quizId = params.quizId;

	// 1. Fetch Quiz Info
	const quiz = await prisma.quiz.findUnique({
		where: { id: quizId }
	});

	if (!quiz || !quiz.isActive) {
		throw error(404, 'Quiz tidak ditemukan atau sedang tidak aktif.');
	}

	// 2. Check if student already has an attempt
	let attempt = await prisma.quizAttempt.findFirst({
		where: {
			quizId,
			studentId: locals.user.id
		},
		include: {
			answers: true
		}
	});

	// If already completed and retry not allowed, redirect to result page
	if (attempt && attempt.status === 'completed' && !quiz.allowRetry) {
		throw redirect(303, `/hasil/${attempt.id}`);
	}

	// If no attempt exists yet, create a new attempt
	if (!attempt) {
		attempt = await prisma.quizAttempt.create({
			data: {
				quizId,
				studentId: locals.user.id,
				status: 'in_progress',
				totalQuestions: 30
			},
			include: {
				answers: true
			}
		});
	}

	// 3. Fetch Questions WITHOUT correct_answer and explanation (for anti-cheat security)
	const questions = await prisma.question.findMany({
		where: { quizId },
		orderBy: { questionNumber: 'asc' },
		select: {
			id: true,
			quizId: true,
			questionNumber: true,
			section: true,
			questionText: true,
			optionA: true,
			optionB: true,
			optionC: true,
			optionD: true
			// DO NOT select correct_answer or explanation here!
		}
	});

	if (questions.length === 0) {
		throw error(404, 'Soal quiz belum tersedia.');
	}

	// Build map of existing saved answers: questionId -> selectedAnswer
	const savedAnswers: Record<string, string> = {};
	if (attempt?.answers) {
		for (const ans of attempt.answers) {
			if (ans.selectedAnswer) {
				savedAnswers[ans.questionId] = ans.selectedAnswer;
			}
		}
	}

	return {
		quiz,
		attempt,
		questions,
		savedAnswers,
		profile: locals.profile
	};
};
