import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { submitQuizAttempt } from '$lib/server/dbService';

export const POST: RequestHandler = async ({ request }) => {
	try {
		const body = await request.json();
		const { attemptId, studentName, nim, programStudi, whatsapp, answers } = body;

		if (!studentName?.trim() || !nim?.trim()) {
			return json(
				{ success: false, error: 'Nama Lengkap dan NIM wajib diisi.' },
				{ status: 400 }
			);
		}

		const result = await submitQuizAttempt({
			attemptId,
			studentName,
			nim,
			programStudi,
			whatsapp,
			answers: answers || {}
		});

		return json(result);
	} catch (err: any) {
		console.error('Error in submit-direct API:', err);
		return json(
			{ success: false, error: err?.message || 'Gagal memproses pengiriman kuis.' },
			{ status: 500 }
		);
	}
};

