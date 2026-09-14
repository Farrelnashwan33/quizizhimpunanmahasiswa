import { fail, type Actions } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { prisma, isDatabaseConfigured } from '$lib/server/prisma';
import { supabaseAdmin, isSupabaseConfigured } from '$lib/server/supabase';
import { OFFICIAL_30_QUESTIONS } from '$lib/data/questions';

export const load: PageServerLoad = async ({ url }) => {
	const section = url.searchParams.get('section') || '';

	try {
		const quiz = await prisma.quiz.findFirst({
			where: { isActive: true }
		});

		const where: any = {};
		if (quiz) where.quizId = quiz.id;
		if (section) where.section = section;

		const questions = await prisma.question.findMany({
			where,
			orderBy: { questionNumber: 'asc' }
		});

		const sections = await prisma.question.findMany({
			select: { section: true },
			distinct: ['section']
		});

		if (questions && questions.length > 0) {
			return {
				quiz: quiz || { id: '11111111-1111-1111-1111-111111111111', title: 'Quiz Kaderisasi Tingkat I HIMA FST UT Bandung' },
				questions,
				sections: sections.map((s) => s.section).filter(Boolean),
				currentSection: section
			};
		}
	} catch (err) {
		console.error('Error loading questions in admin:', err);
	}

	const filtered = section
		? OFFICIAL_30_QUESTIONS.filter((q) => q.section === section)
		: OFFICIAL_30_QUESTIONS;

	const allSections = Array.from(new Set(OFFICIAL_30_QUESTIONS.map((q) => q.section)));

	return {
		quiz: { id: '11111111-1111-1111-1111-111111111111', title: 'Quiz Kaderisasi Tingkat I HIMA FST UT Bandung' },
		questions: filtered,
		sections: allSections,
		currentSection: section
	};
};

export const actions: Actions = {
	create: async ({ request }) => {
		const formData = await request.formData();
		const quizId = formData.get('quizId') as string;
		const questionNumber = parseInt(formData.get('questionNumber') as string, 10);
		const section = (formData.get('section') as string)?.trim();
		const questionText = (formData.get('questionText') as string)?.trim();
		const optionA = (formData.get('optionA') as string)?.trim() || '-';
		const optionB = (formData.get('optionB') as string)?.trim() || '-';
		const optionC = (formData.get('optionC') as string)?.trim() || '-';
		const optionD = (formData.get('optionD') as string)?.trim() || '-';
		const correctAnswer = (formData.get('correctAnswer') as string)?.trim() || 'Jawaban essay tertera pada panduan kunci.';
		const explanation = (formData.get('explanation') as string)?.trim() || null;

		if (!quizId || isNaN(questionNumber) || !section || !questionText || !correctAnswer) {
			return fail(400, { error: 'Kategori, nomor soal, teks pertanyaan essay, dan referensi jawaban wajib diisi.' });
		}

		try {
			if (isDatabaseConfigured) {
				await prisma.question.create({
					data: {
						quizId,
						questionNumber,
						section,
						questionText,
						optionA,
						optionB,
						optionC,
						optionD,
						correctAnswer,
						explanation
					}
				});
			}

			return { success: true, message: 'Soal essay berhasil ditambahkan.' };
		} catch (err: any) {
			console.error('Error creating question:', err);
			return fail(500, { error: err?.message || 'Gagal menambahkan soal.' });
		}
	},

	update: async ({ request }) => {
		const formData = await request.formData();
		const id = formData.get('id') as string;
		const section = (formData.get('section') as string)?.trim();
		const questionText = (formData.get('questionText') as string)?.trim();
		const optionA = (formData.get('optionA') as string)?.trim() || '-';
		const optionB = (formData.get('optionB') as string)?.trim() || '-';
		const optionC = (formData.get('optionC') as string)?.trim() || '-';
		const optionD = (formData.get('optionD') as string)?.trim() || '-';
		const correctAnswer = (formData.get('correctAnswer') as string)?.trim() || '';
		const explanation = (formData.get('explanation') as string)?.trim() || null;
		const rawNum = formData.get('questionNumber');
		const target = OFFICIAL_30_QUESTIONS.find((q) => q.id === id || String(q.questionNumber) === id);
		const questionNumber = rawNum ? parseInt(rawNum as string, 10) : (target?.questionNumber || 1);

		if (!id || !section || !questionText || !correctAnswer) {
			return fail(400, { error: 'ID, kategori, pertanyaan essay, dan kunci jawaban referensi wajib diisi.' });
		}

		// Update in-memory
		if (target) {
			target.section = section;
			target.questionText = questionText;
			target.optionA = optionA;
			target.optionB = optionB;
			target.optionC = optionC;
			target.optionD = optionD;
			target.correctAnswer = correctAnswer as any;
			target.explanation = explanation || undefined;
		}

		try {
			if (isDatabaseConfigured && id.includes('-')) {
				await prisma.question.update({
					where: { id },
					data: {
						questionNumber,
						section,
						questionText,
						optionA,
						optionB,
						optionC,
						optionD,
						correctAnswer,
						explanation
					}
				});
			}

			if (isSupabaseConfigured && id.includes('-')) {
				await supabaseAdmin
					.from('questions')
					.update({
						question_number: questionNumber,
						section,
						question_text: questionText,
						option_a: optionA,
						option_b: optionB,
						option_c: optionC,
						option_d: optionD,
						correct_answer: correctAnswer,
						explanation
					})
					.eq('id', id);
			}

			return { success: true, message: 'Soal pilihan ganda berhasil diperbarui.' };
		} catch (err: any) {
			console.error('Error updating question:', err);
			return fail(500, { error: err?.message || 'Gagal memperbarui soal.' });
		}
	},

	delete: async ({ request }) => {
		const formData = await request.formData();
		const id = formData.get('id') as string;

		if (!id) return fail(400, { error: 'ID Soal tidak valid.' });

		try {
			if (isDatabaseConfigured && id.includes('-')) {
				await prisma.question.delete({
					where: { id }
				});
			}

			return { success: true, message: 'Soal berhasil dihapus.' };
		} catch (err: any) {
			console.error('Error deleting question:', err);
			return fail(500, { error: err?.message || 'Gagal menghapus soal.' });
		}
	}
};
