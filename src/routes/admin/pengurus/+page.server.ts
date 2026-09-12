import type { PageServerLoad } from './$types';
import { prisma } from '$lib/server/prisma';

export const load: PageServerLoad = async ({ locals }) => {
	const currentAdmin = locals.profile || {
		id: 'admin-0000-0000-0000-000000000001',
		fullName: 'Administrator HIMA FST',
		nim: 'ADMIN-HIMA',
		email: 'admin@hima-fst.ut.ac.id',
		role: 'admin',
		programStudi: 'Fakultas Sains dan Teknologi'
	};

	try {
		const admins = await prisma.profile.findMany({
			where: { role: 'admin' },
			orderBy: { createdAt: 'desc' }
		});

		return {
			admins: admins.length > 0 ? admins : [currentAdmin],
			currentAdmin
		};
	} catch (err) {
		console.error('Error loading admins from db:', err);
		return {
			admins: [currentAdmin],
			currentAdmin
		};
	}
};
