import type { PageServerLoad } from './$types';
import { getDashboardStatistics } from '$lib/server/dbService';

export const load: PageServerLoad = async () => {
	const data = await getDashboardStatistics();
	return data;
};

