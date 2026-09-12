import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { prisma } from '$lib/server/prisma';
import { getAllAttempts } from '$lib/server/participantStore';

export const GET: RequestHandler = async ({ locals }) => {
	if (!locals.user || locals.profile?.role !== 'admin') {
		throw error(403, 'Unauthorized');
	}

	const memoryAttempts = getAllAttempts();

	try {
		let dbAttempts: any[] = [];
		try {
			dbAttempts = await prisma.quizAttempt.findMany({
				include: {
					student: true,
					quiz: true
				},
				orderBy: { score: 'desc' }
			});
		} catch (dbErr) {
			dbAttempts = [];
		}

		// Merge database and memory store attempts
		const dbNims = new Set(dbAttempts.map((a) => a.student?.nim));
		const extraMemory = memoryAttempts.filter((m) => !dbNims.has(m.student?.nim));
		const combined = [...dbAttempts, ...extraMemory].sort((a, b) => (b.score ?? 0) - (a.score ?? 0));

		// Format CSV Header Columns
		const headers = [
			'No',
			'Nama Lengkap',
			'NIM',
			'Program Studi',
			'Nomor WhatsApp',
			'Email',
			'Nilai Akhir (0-100)',
			'Status Kelulusan',
			'Jawaban Benar',
			'Jawaban Salah',
			'Total Soal',
			'Status Pengerjaan',
			'Pelanggaran Buka Tab',
			'Waktu Mulai',
			'Waktu Selesai'
		];

		const rows = combined.map((att, index) => {
			const score = att.score ?? 0;
			const isPassed = score >= 65;
			const student = att.student || {};
			const tabViolations = att.tabSwitchCount ?? 0;

			return [
				index + 1,
				`"${(student.fullName || '').replace(/"/g, '""')}"`,
				`"\t${student.nim || ''}"`, // \t prevents Excel from formatting NIM as scientific notation
				`"${(student.programStudi || '').replace(/"/g, '""')}"`,
				`"\t${student.whatsapp || '-'}"`,
				`"${student.email || '-'}"`,
				score,
				isPassed ? 'LULUS (>=65)' : 'TIDAK LULUS (<65)',
				att.correctCount ?? 0,
				att.wrongCount ?? 0,
				att.totalQuestions ?? 30,
				att.status === 'completed' ? 'Selesai' : 'Sedang Berjalan',
				tabViolations > 0 ? `${tabViolations}x Buka Tab` : 'Tertib (0x)',
				att.startedAt ? `"${new Date(att.startedAt).toLocaleString('id-ID')}"` : '""',
				att.submittedAt ? `"${new Date(att.submittedAt).toLocaleString('id-ID')}"` : '""'
			].join(',');
		});

		// \uFEFF is UTF-8 BOM so Microsoft Excel opens special characters and Indonesian accents properly
		const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\r\n');
		const todayDate = new Date().toISOString().split('T')[0];

		return new Response(csvContent, {
			headers: {
				'Content-Type': 'text/csv; charset=utf-8',
				'Content-Disposition': `attachment; filename="Rekap_Nilai_Quiz_Kaderisasi_HIMA_FST_${todayDate}.csv"`,
				'Cache-Control': 'no-cache, no-store, must-revalidate'
			}
		});
	} catch (err: any) {
		console.error('Error generating CSV export:', err);
		throw error(500, 'Gagal membuat file export CSV');
	}
};
