import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { prisma } from '$lib/server/prisma';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) {
		throw redirect(303, '/login');
	}

	// 1. Fetch Profile
	let profile = locals.profile;
	if (!profile) {
		try {
			profile = await prisma.profile.findUnique({
				where: { id: locals.user.id }
			});
		} catch (err) {
			console.error('Error fetching profile in dashboard:', err);
		}
	}

	// 2. Fetch Active Quiz
	let quiz: any = null;
	let attempts: any[] = [];
	let currentAttempt: any = null;

	try {
		quiz = await prisma.quiz.findFirst({
			where: { isActive: true },
			include: {
				_count: {
					select: { questions: true }
				}
			}
		});

		if (quiz && locals.user) {
			attempts = await prisma.quizAttempt.findMany({
				where: {
					studentId: locals.user.id,
					quizId: quiz.id
				},
				orderBy: { startedAt: 'desc' },
				include: {
					_count: {
						select: { answers: true }
					}
				}
			});

			currentAttempt = attempts[0] || null;
		}
	} catch (dbErr) {
		console.error('Error loading dashboard data:', dbErr);
	}

	return {
		profile,
		quiz,
		attempts,
		currentAttempt
	};
};
