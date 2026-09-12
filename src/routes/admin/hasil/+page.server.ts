import type { PageServerLoad } from './$types';
import { prisma } from '$lib/server/prisma';

import { getAllAttempts } from '$lib/server/participantStore';

export const load: PageServerLoad = async () => {
	const memoryAttempts = getAllAttempts();

	try {
		const attempts = await prisma.quizAttempt.findMany({
			where: { status: 'completed' },
			include: {
				student: true,
				answers: {
					include: { question: true }
				}
			}
		});

		const dbNims = new Set(attempts.map((a) => a.student.nim));
		const extraMemory = memoryAttempts.filter((m) => !dbNims.has(m.student.nim));
		const combined = [...attempts, ...extraMemory];

		// Calculate accuracy rate per section
		const sectionStats: Record<string, { total: number; correct: number }> = {
			'Nilai dan Karakter Dasar': { total: 0, correct: 0 },
			'Gerakan Mahasiswa': { total: 0, correct: 0 },
			'Tridharma Perguruan Tinggi': { total: 0, correct: 0 },
			'Peran dan Fungsi Mahasiswa': { total: 0, correct: 0 },
			'Organisasi Kemahasiswaan dan HIMA FST': { total: 0, correct: 0 },
			'Studi Kasus': { total: 0, correct: 0 }
		};

		let totalPassed = 0;
		let totalFailed = 0;

		for (const att of combined) {
			if ((att.score ?? 0) >= 65) totalPassed++;
			else totalFailed++;

			if (att.answers) {
				for (const ans of att.answers) {
					const sec = ans.question?.section || ans.section;
					if (sec && sectionStats[sec]) {
						sectionStats[sec].total++;
						if (ans.isCorrect) sectionStats[sec].correct++;
					}
				}
			}
		}

		return {
			totalCompleted: combined.length,
			totalPassed,
			totalFailed,
			sectionStats
		};
	} catch (err) {
		const sectionStats: Record<string, { total: number; correct: number }> = {
			'Nilai dan Karakter Dasar': { total: 0, correct: 0 },
			'Gerakan Mahasiswa': { total: 0, correct: 0 },
			'Tridharma Perguruan Tinggi': { total: 0, correct: 0 },
			'Peran dan Fungsi Mahasiswa': { total: 0, correct: 0 },
			'Organisasi Kemahasiswaan dan HIMA FST': { total: 0, correct: 0 },
			'Studi Kasus': { total: 0, correct: 0 }
		};

		let totalPassed = 0;
		let totalFailed = 0;

		for (const att of memoryAttempts) {
			if ((att.score ?? 0) >= 65) totalPassed++;
			else totalFailed++;

			if (att.answers) {
				for (const ans of att.answers) {
					const sec = ans.section || ans.question?.section;
					if (sec && sectionStats[sec]) {
						sectionStats[sec].total++;
						if (ans.isCorrect) sectionStats[sec].correct++;
					}
				}
			}
		}

		return {
			totalCompleted: memoryAttempts.length,
			totalPassed,
			totalFailed,
			sectionStats
		};
	}
};
