import type { PageServerLoad } from './$types';
import { getHasilStatistics } from '$lib/server/dbService';

export const load: PageServerLoad = async () => {
	const stats = await getHasilStatistics();
	return stats;
};

