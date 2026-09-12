import type { PageServerLoad } from './$types';
import { prisma, isDatabaseConfigured } from '$lib/server/prisma';
import { getAllAttempts } from '$lib/server/participantStore';

export const load: PageServerLoad = async ({ url }) => {
	const search = url.searchParams.get('q') || '';
	const prodi = url.searchParams.get('prodi') || '';

	const memoryAttempts = getAllAttempts();

	let dbStudents: any[] = [];
	let dbProdis: any[] = [];

	if (isDatabaseConfigured) {
		try {
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

			dbStudents = await prisma.profile.findMany({
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
			dbProdis = prodis.map((p) => p.programStudi).filter(Boolean);
		} catch (err) {
			console.error('Error fetching mahasiswa list from DB:', err);
		}
	}

	// Build composite student list merging DB profiles with in-memory participantStore
	const dbNims = new Set(dbStudents.map((s) => s.nim));
	const memoryStudents: any[] = [];

	for (const att of memoryAttempts) {
		if (att.student && !dbNims.has(att.student.nim)) {
			dbNims.add(att.student.nim);

			let matches = true;
			if (search) {
				const s = search.toLowerCase();
				matches =
					att.student.fullName.toLowerCase().includes(s) ||
					att.student.nim.toLowerCase().includes(s) ||
					att.student.email.toLowerCase().includes(s);
			}
			if (prodi && att.student.programStudi !== prodi) {
				matches = false;
			}

			if (matches) {
				memoryStudents.push({
					id: att.student.id,
					fullName: att.student.fullName,
					nim: att.student.nim,
					email: att.student.email,
					programStudi: att.student.programStudi,
					whatsapp: att.student.whatsapp,
					role: 'mahasiswa',
					createdAt: att.student.createdAt || att.startedAt,
					attempts: [
						{
							id: att.id,
							status: att.status,
							score: att.score,
							startedAt: att.startedAt,
							submittedAt: att.submittedAt
						}
					]
				});
			}
		}
	}

	const combinedStudents = [...dbStudents, ...memoryStudents];
	const allProdis = Array.from(
		new Set([...dbProdis, ...memoryAttempts.map((m) => m.student.programStudi)])
	).filter(Boolean);

	return {
		students: combinedStudents,
		prodiList: allProdis,
		filters: { search, prodi }
	};
};
