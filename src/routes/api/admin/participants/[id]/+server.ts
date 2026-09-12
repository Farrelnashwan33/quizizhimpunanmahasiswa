import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { prisma } from '$lib/server/prisma';

export const GET: RequestHandler = async ({ params, locals }) => {
	if (locals.profile?.role !== 'admin' && locals.user?.id !== 'admin-0000-0000-0000-000000000001') {
		return json({ success: false, error: 'Unauthorized admin access' }, { status: 403 });
	}

	const participantId = params.id;

	try {
		const student = await prisma.profile.findFirst({
			where: {
				OR: [{ id: participantId }, { nim: participantId }]
			},
			include: {
				attempts: {
					include: {
						answers: {
							include: { question: true }
						}
					},
					orderBy: { startedAt: 'desc' }
				}
			}
		});

		if (!student) {
			return json({ success: false, error: 'Peserta tidak ditemukan' }, { status: 404 });
		}

		return json({
			success: true,
			participant: student
		});
	} catch (err: any) {
		console.error('Error fetching admin participant by id API:', err);
		return json({ success: false, error: err?.message || 'Database error' }, { status: 500 });
	}
};
