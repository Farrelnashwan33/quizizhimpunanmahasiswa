import type { PageServerLoad } from './$types';
import { getAllQuizAttempts } from '$lib/server/dbService';

export const load: PageServerLoad = async ({ url }) => {
	const search = url.searchParams.get('q') || '';
	const prodi = url.searchParams.get('prodi') || '';
	const status = url.searchParams.get('status') || '';
	const sort = url.searchParams.get('sort') || 'score_desc';
	const page = parseInt(url.searchParams.get('page') || '1', 10);
	const pageSize = 15;

	const result = await getAllQuizAttempts({
		search,
		prodi,
		status,
		sort,
		page,
		pageSize
	});

	return result;
};

