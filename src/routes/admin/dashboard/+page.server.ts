import type { PageServerLoad } from './$types';
import { prisma } from '$lib/server/prisma';

import { getAllAttempts } from '$lib/server/participantStore';

export const load: PageServerLoad = async () => {
	const memoryAttempts = getAllAttempts();

	try {
		const totalStudents = await prisma.profile.count({
			where: { role: 'mahasiswa' }
		});

		const attempts = await prisma.quizAttempt.findMany({
			include: {
				student: true,
				quiz: true
			},
			orderBy: { startedAt: 'desc' }
		});

		const dbNims = new Set(attempts.map((a) => a.student.nim));
		const extraMemory = memoryAttempts.filter((m) => !dbNims.has(m.student.nim));
		const combined = [...attempts, ...extraMemory];

		const totalParticipants = combined.length;
		const completedAttempts = combined.filter((a) => a.status === 'completed' && a.score !== null);
		const totalCompleted = completedAttempts.length;
		const totalInProgress = combined.filter((a) => a.status === 'in_progress').length;

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

		const totalQuestions = await prisma.question.count();

		return {
			stats: {
				totalStudents: totalStudents + extraMemory.length,
				totalParticipants,
				totalCompleted,
				totalInProgress,
				averageScore,
				highestScore,
				lowestScore,
				totalQuestions: totalQuestions || 30
			},
			distribution,
			recentAttempts: combined.slice(0, 6)
		};
	} catch (err) {
		const totalParticipants = memoryAttempts.length;
		const completedAttempts = memoryAttempts.filter((a) => a.status === 'completed' && a.score !== null);
		const totalCompleted = completedAttempts.length;
		const totalInProgress = memoryAttempts.filter((a) => a.status === 'in_progress').length;

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

		return {
			stats: {
				totalStudents: totalParticipants,
				totalParticipants,
				totalCompleted,
				totalInProgress,
				averageScore,
				highestScore,
				lowestScore,
				totalQuestions: 30
			},
			distribution,
			recentAttempts: memoryAttempts.slice(0, 6)
		};
	}
};
