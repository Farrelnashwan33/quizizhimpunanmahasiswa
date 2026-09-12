import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { prisma } from '$lib/server/prisma';

export const GET: RequestHandler = async ({ locals }) => {
	if (locals.profile?.role !== 'admin' && locals.user?.id !== 'admin-0000-0000-0000-000000000001') {
		return json({ success: false, error: 'Unauthorized admin access' }, { status: 403 });
	}

	try {
		const totalStudents = await prisma.profile.count({
			where: { role: 'mahasiswa' }
		});

		const attempts = await prisma.quizAttempt.findMany({
			include: { student: true },
			orderBy: { startedAt: 'desc' }
		});

		const totalParticipants = attempts.length;
		const completedAttempts = attempts.filter((a) => a.status === 'completed' && a.score !== null);
		const totalCompleted = completedAttempts.length;
		const totalInProgress = attempts.filter((a) => a.status === 'in_progress').length;

		let averageScore = 0;
		let highestScore = 0;
		let lowestScore = 0;

		const distribution = {
			'0-49': 0,
			'50-64': 0,
			'65-79': 0,
			'80-89': 0,
			'90-100': 0
		};

		if (completedAttempts.length > 0) {
			const scores = completedAttempts.map((a) => a.score as number);
			const sum = scores.reduce((acc, val) => acc + val, 0);
			averageScore = Math.round((sum / scores.length) * 10) / 10;
			highestScore = Math.max(...scores);
			lowestScore = Math.min(...scores);

			scores.forEach((sc) => {
				if (sc < 50) distribution['0-49']++;
				else if (sc < 65) distribution['50-64']++;
				else if (sc < 80) distribution['65-79']++;
				else if (sc < 90) distribution['80-89']++;
				else distribution['90-100']++;
			});
		}

		return json({
			success: true,
			stats: {
				totalStudents,
				totalParticipants,
				totalCompleted,
				totalInProgress,
				averageScore,
				highestScore,
				lowestScore,
				totalQuestions: 30
			},
			distribution
		});
	} catch (err: any) {
		console.error('Error fetching admin statistics API:', err);
		return json({ success: false, error: err?.message || 'Database error' }, { status: 500 });
	}
};
