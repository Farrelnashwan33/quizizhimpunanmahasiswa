import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { OFFICIAL_30_QUESTIONS } from '$lib/data/questions';
import { prisma } from '$lib/server/prisma';

export const POST: RequestHandler = async ({ request }) => {
	try {
		const body = await request.json();
		const { studentName, nim, programStudi, whatsapp, answers } = body;

		if (!studentName || !nim) {
			return json(
				{ success: false, error: 'Nama Lengkap dan NIM wajib diisi.' },
				{ status: 400 }
			);
		}

		// 1. Get questions (from database if available, or fallback to OFFICIAL_30_QUESTIONS)
		let questionsList: any[] = OFFICIAL_30_QUESTIONS;
		try {
			const quiz = await prisma.quiz.findFirst({ where: { isActive: true } });
			const dbQuestions = await prisma.question.findMany({
				where: quiz ? { quizId: quiz.id } : {},
				orderBy: { questionNumber: 'asc' }
			});
			if (dbQuestions && dbQuestions.length > 0) {
				questionsList = dbQuestions;
			}
		} catch (dbErr) {
			// use fallback
		}

		const totalQuestions = questionsList.length;
		let correctCount = 0;

		const answersBreakdown = questionsList.map((q) => {
			const studentAns = answers?.[q.id] || answers?.[q.questionNumber] || null;
			const isCorrect = studentAns === q.correctAnswer;
			if (isCorrect) {
				correctCount++;
			}
			return {
				questionId: q.id,
				questionNumber: q.questionNumber,
				section: q.section,
				questionText: q.questionText,
				optionA: q.optionA,
				optionB: q.optionB,
				optionC: q.optionC,
				optionD: q.optionD,
				studentAnswer: studentAns,
				correctAnswer: q.correctAnswer,
				isCorrect,
				explanation: q.explanation
			};
		});

		const wrongCount = totalQuestions - correctCount;
		const rawScore = (correctCount / totalQuestions) * 100;
		const score = Math.round(rawScore * 100) / 100;
		const attemptId = 'att-' + Math.random().toString(36).substring(2, 11) + '-' + Date.now().toString(36);
		const now = new Date();
		const newAttemptRecord = {
			id: attemptId,
			quizId: '11111111-1111-1111-1111-111111111111',
			studentId: 'std-' + nim,
			status: 'completed' as const,
			score,
			correctCount,
			wrongCount,
			totalQuestions,
			startedAt: now,
			submittedAt: now,
			student: {
				id: 'std-' + nim,
				fullName: studentName,
				nim,
				email: `${nim}@student.ut.ac.id`,
				programStudi: programStudi || 'Sains dan Teknologi',
				whatsapp: whatsapp || null,
				role: 'mahasiswa' as const,
				createdAt: now
			},
			quiz: {
				id: '11111111-1111-1111-1111-111111111111',
				title: 'Quiz Kaderisasi Tingkat I HIMA FST UT Bandung'
			},
			answers: answersBreakdown
		};

		// 1. Record to in-memory store for instant admin visibility
		import('$lib/server/participantStore').then(({ recordAttempt }) => {
			recordAttempt(newAttemptRecord);
		}).catch(() => {});

		// 2. Attempt to save to Prisma database if connected
		try {
			const quiz = await prisma.quiz.findFirst();
			if (quiz) {
				let profile = await prisma.profile.findFirst({
					where: { nim }
				});

				if (!profile) {
					const pseudoId = '00000000-0000-4000-8000-' + Math.random().toString(16).substring(2, 14).padEnd(12, '0');
					profile = await prisma.profile.create({
						data: {
							id: pseudoId,
							fullName: studentName,
							nim,
							email: `${nim}@student.ut.ac.id`,
							programStudi: programStudi || 'Sains dan Teknologi',
							whatsapp: whatsapp || null,
							role: 'mahasiswa'
						}
					});
				}

				await prisma.quizAttempt.create({
					data: {
						quizId: quiz.id,
						studentId: profile.id,
						status: 'completed',
						score,
						correctCount,
						wrongCount,
						totalQuestions,
						submittedAt: now
					}
				});
			}
		} catch (dbErr) {
			console.warn('Database save notice (working in standalone direct mode):', dbErr);
		}

		return json({
			success: true,
			attemptId,
			studentName,
			nim,
			programStudi: programStudi || 'Sains dan Teknologi',
			score,
			correctCount,
			wrongCount,
			totalQuestions,
			submittedAt: new Date().toISOString(),
			answersBreakdown
		});
	} catch (err: any) {
		console.error('Error submitting direct quiz:', err);
		return json(
			{ success: false, error: err?.message || 'Gagal memproses pengiriman kuis.' },
			{ status: 500 }
		);
	}
};
