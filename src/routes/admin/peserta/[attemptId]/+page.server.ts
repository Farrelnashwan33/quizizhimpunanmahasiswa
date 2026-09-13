import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getQuizAttemptById } from '$lib/server/dbService';

export const load: PageServerLoad = async ({ params }) => {
	const attemptId = params.attemptId;

	const result = await getQuizAttemptById(attemptId);

	if (!result) {
		throw error(404, 'Data pengerjaan peserta tidak ditemukan di database.');
	}

	return result;
};

