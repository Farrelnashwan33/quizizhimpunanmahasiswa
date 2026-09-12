import type { PageServerLoad } from './$types';
import { prisma } from '$lib/server/prisma';
import { getAllAttempts } from '$lib/server/participantStore';

export const load: PageServerLoad = async ({ url }) => {
	const search = url.searchParams.get('q') || '';
	const prodi = url.searchParams.get('prodi') || '';
	const status = url.searchParams.get('status') || '';
	const sort = url.searchParams.get('sort') || 'score_desc';
	const page = parseInt(url.searchParams.get('page') || '1', 10);
	const pageSize = 15;

	// Build filter query
	const where: any = {};

	if (search) {
		where.student = {
			OR: [
				{ fullName: { contains: search, mode: 'insensitive' } },
				{ nim: { contains: search, mode: 'insensitive' } },
				{ email: { contains: search, mode: 'insensitive' } }
			]
		};
	}

	if (prodi) {
		where.student = {
			...(where.student || {}),
			programStudi: prodi
		};
	}

	if (status) {
		where.status = status;
	}

	// Build sort query
	let orderBy: any = { score: 'desc' };
	if (sort === 'score_asc') orderBy = { score: 'asc' };
	if (sort === 'time_desc') orderBy = { submittedAt: 'desc' };
	if (sort === 'time_asc') orderBy = { startedAt: 'asc' };
	if (sort === 'name_asc') orderBy = { student: { fullName: 'asc' } };

	let memoryList = getAllAttempts();
	if (search) {
		const s = search.toLowerCase();
		memoryList = memoryList.filter(
			(a) =>
				a.student.fullName.toLowerCase().includes(s) ||
				a.student.nim.toLowerCase().includes(s) ||
				a.student.email.toLowerCase().includes(s)
		);
	}
	if (prodi) {
		memoryList = memoryList.filter((a) => a.student.programStudi === prodi);
	}

	try {
		const totalCount = await prisma.quizAttempt.count({ where });
		const attempts = await prisma.quizAttempt.findMany({
			where,
			include: {
				student: true,
				quiz: true
			},
			orderBy,
			skip: (page - 1) * pageSize,
			take: pageSize
		});

		// Fetch unique prodi list for filter dropdown
		const prodis = await prisma.profile.findMany({
			where: { role: 'mahasiswa' },
			select: { programStudi: true },
			distinct: ['programStudi']
		});

		// Merge DB and Memory attempts (DB takes priority, append unique memory ones)
		const dbNims = new Set(attempts.map((a) => a.student.nim));
		const extraMemory = memoryList.filter((m) => !dbNims.has(m.student.nim));
		const combined = [...attempts, ...extraMemory];

		return {
			attempts: combined,
			totalCount: totalCount + extraMemory.length,
			page,
			totalPages: Math.max(1, Math.ceil((totalCount + extraMemory.length) / pageSize)),
			prodiList: Array.from(new Set([...prodis.map((p) => p.programStudi), ...memoryList.map((m) => m.student.programStudi)])).filter(Boolean),
			filters: { search, prodi, status, sort }
		};
	} catch (err) {
		const totalCount = memoryList.length;
		return {
			attempts: memoryList.slice((page - 1) * pageSize, page * pageSize),
			totalCount,
			page,
			totalPages: Math.max(1, Math.ceil(totalCount / pageSize)),
			prodiList: Array.from(new Set(memoryList.map((m) => m.student.programStudi))).filter(Boolean),
			filters: { search, prodi, status, sort }
		};
	}
};
