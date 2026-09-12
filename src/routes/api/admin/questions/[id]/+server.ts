import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { prisma } from '$lib/server/prisma';

export const PUT: RequestHandler = async ({ params, request, locals }) => {
	if (locals.profile?.role !== 'admin' && locals.user?.id !== 'admin-0000-0000-0000-000000000001') {
		return json({ success: false, error: 'Unauthorized admin access' }, { status: 403 });
	}

	const id = params.id;

	try {
		const body = await request.json();
		const { questionNumber, section, questionText, optionA, optionB, optionC, optionD, correctAnswer, explanation } = body;

		const updated = await prisma.question.update({
			where: { id },
			data: {
				...(questionNumber !== undefined && { questionNumber: parseInt(questionNumber, 10) }),
				...(section !== undefined && { section: section.trim() }),
				...(questionText !== undefined && { questionText: questionText.trim() }),
				...(optionA !== undefined && { optionA: optionA.trim() }),
				...(optionB !== undefined && { optionB: optionB.trim() }),
				...(optionC !== undefined && { optionC: optionC.trim() }),
				...(optionD !== undefined && { optionD: optionD.trim() }),
				...(correctAnswer !== undefined && { correctAnswer: correctAnswer.trim().toUpperCase() }),
				...(explanation !== undefined && { explanation: explanation?.trim() || null })
			}
		});

		return json({
			success: true,
			question: updated
		});
	} catch (err: any) {
		console.error('Error updating question API:', err);
		return json({ success: false, error: err?.message || 'Gagal memperbarui soal' }, { status: 500 });
	}
};

export const DELETE: RequestHandler = async ({ params, locals }) => {
	if (locals.profile?.role !== 'admin' && locals.user?.id !== 'admin-0000-0000-0000-000000000001') {
		return json({ success: false, error: 'Unauthorized admin access' }, { status: 403 });
	}

	const id = params.id;

	try {
		await prisma.question.delete({
			where: { id }
		});

		return json({
			success: true,
			message: 'Soal berhasil dihapus'
		});
	} catch (err: any) {
		console.error('Error deleting question API:', err);
		return json({ success: false, error: err?.message || 'Gagal menghapus soal' }, { status: 500 });
	}
};
