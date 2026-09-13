import { error, fail, type Actions } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getQuizAttemptById, gradeQuizAttempt } from '$lib/server/dbService';

export const load: PageServerLoad = async ({ params }) => {
	const attemptId = params.attemptId;

	if (!attemptId) {
		throw error(404, 'Attempt ID tidak valid.');
	}

	const result = await getQuizAttemptById(attemptId);

	if (!result) {
		throw error(404, 'Data pengerjaan peserta tidak ditemukan di database.');
	}

	return result;
};

export const actions: Actions = {
	saveGrade: async ({ request, params }) => {
		const formData = await request.formData();
		const attemptId = params.attemptId;
		const scoreStr = formData.get('score') as string;
		const feedback = (formData.get('feedback') as string)?.trim() || null;

		if (!attemptId) {
			return fail(400, { error: 'Attempt ID tidak valid.' });
		}

		if (!scoreStr || isNaN(Number(scoreStr))) {
			return fail(400, { error: 'Nilai total yang dimasukkan tidak valid.' });
		}

		const score = Number(scoreStr);

		try {
			const result = await gradeQuizAttempt({
				attemptId,
				score,
				feedback
			});

			return { success: true, message: 'Nilai dan evaluasi essai berhasil disimpan ke database.', result };
		} catch (err: any) {
			console.error('Error saving grade:', err);
			return fail(500, { error: err?.message || 'Gagal menyimpan penilaian.' });
		}
	}
};
