import type { PageServerLoad } from './$types';
import { prisma } from '$lib/server/prisma';

export const load: PageServerLoad = async ({ url }) => {
	const search = url.searchParams.get('q') || '';
	const prodi = url.searchParams.get('prodi') || '';

	const where: any = { role: 'mahasiswa' };

	if (search) {
		where.OR = [
			{ fullName: { contains: search, mode: 'insensitive' } },
			{ nim: { contains: search, mode: 'insensitive' } },
			{ email: { contains: search, mode: 'insensitive' } }
		];
	}

	if (prodi) {
		where.programStudi = prodi;
	}

	try {
		const students = await prisma.profile.findMany({
			where,
			include: {
				attempts: {
					orderBy: { startedAt: 'desc' }
				}
			},
			orderBy: { createdAt: 'desc' }
		});

		const prodis = await prisma.profile.findMany({
			where: { role: 'mahasiswa' },
			select: { programStudi: true },
			distinct: ['programStudi']
		});

		return {
			students,
			prodiList: prodis.map((p) => p.programStudi).filter(Boolean),
			filters: { search, prodi }
		};
	} catch (err) {
		console.error('Error fetching mahasiswa list:', err);
		return {
			students: [],
			prodiList: [],
			filters: { search, prodi }
		};
	}
};
