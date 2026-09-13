import type { PageServerLoad } from './$types';
import { getAllMahasiswa } from '$lib/server/dbService';

export const load: PageServerLoad = async ({ url }) => {
	const search = url.searchParams.get('q') || '';
	const prodi = url.searchParams.get('prodi') || '';

	const result = await getAllMahasiswa({ search, prodi });
	return result;
};

