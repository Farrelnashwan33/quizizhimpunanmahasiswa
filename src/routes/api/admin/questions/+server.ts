import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { prisma } from '$lib/server/prisma';

export const GET: RequestHandler = async ({ locals }) => {
	if (locals.profile?.role !== 'admin' && locals.user?.id !== 'admin-0000-0000-0000-000000000001') {
		return json({ success: false, error: 'Unauthorized admin access' }, { status: 403 });
	}

	try {
		const quiz = await prisma.quiz.findFirst({ where: { isActive: true } });
		const questions = await prisma.question.findMany({
			where: quiz ? { quizId: quiz.id } : {},
			orderBy: { questionNumber: 'asc' }
		});

		return json({
			success: true,
			questions
		});
	} catch (err: any) {
		return json({ success: false, error: err?.message || 'Database error' }, { status: 500 });
	}
};

export const POST: RequestHandler = async ({ request, locals }) => {
	if (locals.profile?.role !== 'admin' && locals.user?.id !== 'admin-0000-0000-0000-000000000001') {
		return json({ success: false, error: 'Unauthorized admin access' }, { status: 403 });
	}

	try {
		const body = await request.json();
		const { quizId, questionNumber, section, questionText, optionA, optionB, optionC, optionD, correctAnswer, explanation } = body;

		if (!questionText || !optionA || !optionB || !optionC || !optionD || !correctAnswer) {
			return json({ success: false, error: 'Kolom pertanyaan dan opsi A-D serta kunci jawaban wajib diisi' }, { status: 400 });
		}

		let activeQuizId = quizId;
		if (!activeQuizId) {
			const q = await prisma.quiz.findFirst({ where: { isActive: true } });
			activeQuizId = q?.id || '11111111-1111-1111-1111-111111111111';
		}

		const num = questionNumber ? parseInt(questionNumber, 10) : ((await prisma.question.count({ where: { quizId: activeQuizId } })) + 1);

		const created = await prisma.question.create({
			data: {
				quizId: activeQuizId,
				questionNumber: num,
				section: section?.trim() || 'Umum',
				questionText: questionText.trim(),
				optionA: optionA.trim(),
				optionB: optionB.trim(),
				optionC: optionC.trim(),
				optionD: optionD.trim(),
				correctAnswer: correctAnswer.trim().toUpperCase(),
				explanation: explanation?.trim() || null
			}
		});

		return json({
			success: true,
			question: created
		});
	} catch (err: any) {
		console.error('Error creating question API:', err);
		return json({ success: false, error: err?.message || 'Gagal membuat soal' }, { status: 500 });
	}
};
