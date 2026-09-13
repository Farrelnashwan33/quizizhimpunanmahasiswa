import { fail, type Actions } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { prisma, isDatabaseConfigured } from '$lib/server/prisma';
import { supabaseAdmin, isSupabaseConfigured } from '$lib/server/supabase';
import { OFFICIAL_30_QUESTIONS } from '$lib/data/questions';

export const load: PageServerLoad = async () => {
	try {
		const quiz = await prisma.quiz.findFirst({
			where: { isActive: true }
		});

		const questions = await prisma.question.findMany({
			where: quiz ? { quizId: quiz.id } : {},
			orderBy: { questionNumber: 'asc' },
			select: {
				id: true,
				questionNumber: true,
				section: true,
				questionText: true,
				correctAnswer: true,
				explanation: true
			}
		});

		if (questions && questions.length > 0) {
			return {
				quiz,
				questions
			};
		}
	} catch (err) {
		console.error('Error loading answer keys from db:', err);
	}

	return {
		quiz: { title: 'Quiz Kaderisasi Tingkat I HIMA FST UT Bandung' },
		questions: OFFICIAL_30_QUESTIONS.map((q) => ({
			id: q.id,
			questionNumber: q.questionNumber,
			section: q.section,
			questionText: q.questionText,
			correctAnswer: q.correctAnswer,
			explanation: q.explanation || ''
		}))
	};
};

export const actions: Actions = {
	updateKey: async ({ request }) => {
		const formData = await request.formData();
		const id = formData.get('id') as string;
		const correctAnswer = (formData.get('correctAnswer') as string)?.trim();
		const explanation = (formData.get('explanation') as string)?.trim() || null;

		if (!id || !correctAnswer) {
			return fail(400, { error: 'Pedoman kunci jawaban essai tidak boleh kosong.' });
		}

		// Update in-memory fallback
		const target = OFFICIAL_30_QUESTIONS.find((q) => q.id === id || String(q.questionNumber) === id);
		if (target) {
			target.correctAnswer = correctAnswer;
			if (explanation !== null) target.explanation = explanation;
		}

		// Update in Prisma
		if (isDatabaseConfigured && id.includes('-')) {
			try {
				await prisma.question.update({
					where: { id },
					data: {
						correctAnswer,
						explanation
					}
				});
			} catch (err: any) {
				console.warn('Prisma update key notice:', err);
			}
		}

		// Update in Supabase
		if (isSupabaseConfigured && id.includes('-')) {
			try {
				await supabaseAdmin
					.from('questions')
					.update({
						correct_answer: correctAnswer,
						explanation
					})
					.eq('id', id);
			} catch (supaErr) {
				console.warn('Supabase update key notice:', supaErr);
			}
		}

		return { success: true, message: 'Pedoman kunci jawaban essai dan pembahasan berhasil disimpan.' };
	}
};
