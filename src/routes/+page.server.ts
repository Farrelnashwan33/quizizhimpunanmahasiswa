import type { PageServerLoad } from './$types';
import { prisma } from '$lib/server/prisma';

export const load: PageServerLoad = async ({ locals }) => {
	let activeQuiz = null;
	try {
		activeQuiz = await prisma.quiz.findFirst({
			where: { isActive: true },
			select: {
				id: true,
				title: true,
				description: true,
				durationMinutes: true,
				_count: {
					select: { questions: true }
				}
			}
		});
	} catch (err) {
		console.error('Error loading active quiz for landing page:', err);
	}

	return {
		activeQuiz
	};
};
