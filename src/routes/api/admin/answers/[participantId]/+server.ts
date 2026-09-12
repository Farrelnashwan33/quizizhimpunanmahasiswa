import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { prisma } from '$lib/server/prisma';

export const GET: RequestHandler = async ({ params, locals }) => {
	if (locals.profile?.role !== 'admin' && locals.user?.id !== 'admin-0000-0000-0000-000000000001') {
		return json({ success: false, error: 'Unauthorized admin access' }, { status: 403 });
	}

	const participantId = params.participantId;

	try {
		const attempt = await prisma.quizAttempt.findFirst({
			where: {
				OR: [
					{ id: participantId },
					{ studentId: participantId },
					{ student: { nim: participantId } }
				]
			},
			include: {
				student: true,
				quiz: true,
				answers: {
					include: { question: true }
				}
			},
			orderBy: { startedAt: 'desc' }
		});

		if (!attempt) {
			return json({ success: false, error: 'Data pengerjaan tidak ditemukan' }, { status: 404 });
		}

		// Also get all questions to show full 1-30
		const allQuestions = await prisma.question.findMany({
			where: { quizId: attempt.quizId },
			orderBy: { questionNumber: 'asc' }
		});

		const answerMap = new Map();
		for (const a of attempt.answers) {
			answerMap.set(a.questionId, a);
		}

		const detailedAnswers = allQuestions.map((q) => {
			const ans = answerMap.get(q.id);
			return {
				questionNumber: q.questionNumber,
				section: q.section,
				questionText: q.questionText,
				options: {
					A: q.optionA,
					B: q.optionB,
					C: q.optionC,
					D: q.optionD
				},
				studentAnswer: ans?.selectedAnswer || null,
				correctAnswer: q.correctAnswer,
				isCorrect: ans?.isCorrect ?? false,
				status: ans?.selectedAnswer ? (ans.isCorrect ? 'Benar' : 'Salah') : 'Belum Dijawab',
				explanation: q.explanation
			};
		});

		return json({
			success: true,
			attempt: {
				id: attempt.id,
				studentName: attempt.student.fullName,
				nim: attempt.student.nim,
				programStudi: attempt.student.programStudi,
				status: attempt.status,
				startedAt: attempt.startedAt,
				submittedAt: attempt.submittedAt,
				score: attempt.score,
				correctCount: attempt.correctCount,
				wrongCount: attempt.wrongCount,
				totalQuestions: attempt.totalQuestions
			},
			answers: detailedAnswers
		});
	} catch (err: any) {
		console.error('Error fetching admin answers API:', err);
		return json({ success: false, error: err?.message || 'Database error' }, { status: 500 });
	}
};
