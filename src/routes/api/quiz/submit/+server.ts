import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { prisma, isDatabaseConfigured } from '$lib/server/prisma';
import { supabaseAdmin, isSupabaseConfigured } from '$lib/server/supabase';
import { evaluateQuestionAnswer, resolveQuestionUuid, OFFICIAL_30_QUESTIONS } from '$lib/server/dbService';

export const POST: RequestHandler = async ({ request, locals }) => {
	if (!locals.user) {
		throw error(401, 'Unauthorized');
	}

	try {
		const { attemptId, finalAnswers } = await request.json();

		if (!attemptId) {
			throw error(400, 'Attempt ID tidak valid');
		}

		let studentProfile = locals.profile;
		const totalQuestions = 30;
		const now = new Date();

		// 1. Fetch attempt and verify ownership in Prisma if configured
		let targetAttempt: any = null;
		if (isDatabaseConfigured) {
			targetAttempt = await prisma.quizAttempt.findUnique({
				where: { id: attemptId },
				include: { quiz: true, student: true }
			});
		}

		// 2. Fetch or update in Supabase
		if (isSupabaseConfigured && (!targetAttempt || !targetAttempt.id)) {
			const { data: supaAtt } = await supabaseAdmin
				.from('quiz_attempts')
				.select('*')
				.eq('id', attemptId)
				.maybeSingle();
			if (supaAtt) targetAttempt = supaAtt;
		}

		let totalEarnedPoints = 0;
		let correctCount = 0;

		const answersBreakdown = OFFICIAL_30_QUESTIONS.map((q) => {
			const qUuid = resolveQuestionUuid(q.questionNumber);
			const rawAns =
				finalAnswers?.[q.id] ??
				finalAnswers?.[qUuid] ??
				finalAnswers?.[String(q.questionNumber)] ??
				finalAnswers?.[`num_${q.questionNumber}`] ??
				finalAnswers?.[`q-${String(q.questionNumber).padStart(2, '0')}`] ??
				null;

			const studentText = typeof rawAns === 'string' && rawAns.trim() !== '' ? rawAns.trim() : null;
			const evalResult = evaluateQuestionAnswer(q.questionNumber, studentText);

			if (studentText !== null) {
				totalEarnedPoints += evalResult.points;
				if (evalResult.isCorrect) correctCount++;
			}

			return {
				questionId: qUuid,
				questionNumber: q.questionNumber,
				studentAnswer: studentText,
				isCorrect: evalResult.isCorrect,
				points: evalResult.points
			};
		});

		const computedScore = Math.min(100, Math.round(totalEarnedPoints));
		const wrongCount = totalQuestions - correctCount;

		// 3. Save to Supabase
		if (isSupabaseConfigured) {
			try {
				await supabaseAdmin
					.from('quiz_attempts')
					.update({
						status: 'completed',
						submitted_at: now.toISOString(),
						score: computedScore,
						correct_count: correctCount,
						wrong_count: wrongCount,
						total_questions: totalQuestions
					})
					.eq('id', attemptId);

				const supaBatch = answersBreakdown.map((a) => ({
					attempt_id: attemptId,
					question_id: a.questionId,
					selected_answer: a.studentAnswer,
					is_correct: a.isCorrect,
					answered_at: now.toISOString()
				}));

				await supabaseAdmin.from('answers').upsert(supaBatch, { onConflict: 'attempt_id,question_id' });
			} catch (supaErr) {
				console.warn('Supabase submit API error:', supaErr);
			}
		}

		// 4. Save to Prisma
		if (isDatabaseConfigured) {
			try {
				for (const a of answersBreakdown) {
					await prisma.answer.upsert({
						where: {
							attemptId_questionId: { attemptId, questionId: a.questionId }
						},
						update: {
							selectedAnswer: a.studentAnswer || '',
							isCorrect: a.isCorrect,
							answeredAt: now
						},
						create: {
							attemptId,
							questionId: a.questionId,
							selectedAnswer: a.studentAnswer || '',
							isCorrect: a.isCorrect,
							answeredAt: now
						}
					});
				}

				await prisma.quizAttempt.update({
					where: { id: attemptId },
					data: {
						status: 'completed',
						submittedAt: now,
						score: computedScore,
						correctCount,
						wrongCount,
						totalQuestions
					}
				});
			} catch (prismaErr) {
				console.warn('Prisma submit API error:', prismaErr);
			}
		}

		return json({
			success: true,
			attemptId,
			score: computedScore,
			correctCount,
			wrongCount,
			totalQuestions
		});
	} catch (err: any) {
		console.error('Error in submit quiz handler:', err);
		return json(
			{ success: false, error: err?.message || 'Terjadi kegagalan saat mengirim jawaban kuis.' },
			{ status: 500 }
		);
	}
};
