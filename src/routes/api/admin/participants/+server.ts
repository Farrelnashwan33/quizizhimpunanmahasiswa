import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { prisma } from '$lib/server/prisma';

export const GET: RequestHandler = async ({ url, locals }) => {
	// Check admin access
	if (locals.profile?.role !== 'admin' && locals.user?.id !== 'admin-0000-0000-0000-000000000001') {
		return json({ success: false, error: 'Unauthorized admin access' }, { status: 403 });
	}

	const search = url.searchParams.get('q') || '';
	const prodi = url.searchParams.get('prodi') || '';
	const status = url.searchParams.get('status') || '';

	try {
		const where: any = { role: 'mahasiswa' };
		if (search) {
			where.OR = [
				{ fullName: { contains: search, mode: 'insensitive' } },
				{ nim: { contains: search, mode: 'insensitive' } }
			];
		}
		if (prodi) {
			where.programStudi = prodi;
		}

		const students = await prisma.profile.findMany({
			where,
			include: {
				attempts: {
					orderBy: { startedAt: 'desc' }
				}
			},
			orderBy: { createdAt: 'desc' }
		});

		let filtered = students;
		if (status) {
			filtered = students.filter((s) => {
				const latest = s.attempts[0];
				return latest?.status === status;
			});
		}

		return json({
			success: true,
			total: filtered.length,
			participants: filtered
		});
	} catch (err: any) {
		console.error('Error fetching admin participants API:', err);
		return json({ success: false, error: err?.message || 'Database error' }, { status: 500 });
	}
};
