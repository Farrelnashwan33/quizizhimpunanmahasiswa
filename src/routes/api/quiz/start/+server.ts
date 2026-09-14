import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { startQuizAttempt } from '$lib/server/dbService';
import { OFFICIAL_30_QUESTIONS } from '$lib/data/questions';

export const POST: RequestHandler = async ({ request }) => {
	try {
		const body = await request.json();
		const { studentName, nim, programStudi, whatsapp, forceNew, retry } = body;

		if (!studentName?.trim() || !nim?.trim() || !programStudi?.trim()) {
			return json(
				{ success: false, error: 'Nama Lengkap, NIM, dan Program Studi wajib diisi.' },
				{ status: 400 }
			);
		}

		const result = await startQuizAttempt({
			studentName,
			nim,
			programStudi,
			whatsapp,
			forceNew: !!(forceNew || retry)
		});

		// Return sanitized questions (no correctAnswer or explanation exposed)
		const sanitizedQuestions = OFFICIAL_30_QUESTIONS.map((q) => ({
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
			attemptId: result.attemptId,
			studentId: result.studentId,
			studentName: result.studentName,
			nim: result.nim,
			programStudi: result.programStudi,
			startedAt: result.startedAt,
			savedAnswers: result.savedAnswers || {},
			questions: sanitizedQuestions,
			totalQuestions: sanitizedQuestions.length
		});
	} catch (err: any) {
		console.error('Error in /api/quiz/start:', err);
		return json(
			{ success: false, error: err?.message || 'Gagal memulai kuis.' },
			{ status: 500 }
		);
	}
};
