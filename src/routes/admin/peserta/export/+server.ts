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
		let attempts: any[] = [];
		try {
			attempts = await prisma.quizAttempt.findMany({
				include: {
					student: true,
					quiz: true
				},
				orderBy: { score: 'desc' }
			});
		} catch (dbErr) {
			attempts = [];
		}

		const dbNims = new Set(attempts.map((a) => a.student?.nim));
		const extraMemory = memoryAttempts.filter((m) => !dbNims.has(m.student?.nim));
		const combined = [...attempts, ...extraMemory];

		// Format CSV rows
		const headers = [
			'No',
			'Nama Lengkap',
			'NIM',
			'Email',
			'Program Studi',
			'WhatsApp',
			'Waktu Mulai',
			'Waktu Selesai',
			'Status Pengerjaan',
			'Jawaban Benar',
			'Jawaban Salah',
			'Total Soal',
			'Nilai Akhir (0-100)',
			'Status Kelulusan'
		];

		const rows = attempts.map((att, index) => {
			const isPassed = (att.score ?? 0) >= 65;
			return [
				index + 1,
				`"${(att.student?.fullName || '').replace(/"/g, '""')}"`,
				`"${att.student?.nim || ''}"`,
				`"${att.student?.email || ''}"`,
				`"${(att.student?.programStudi || '').replace(/"/g, '""')}"`,
				`"${att.student?.whatsapp || '-'}"`,
				att.startedAt ? `"${new Date(att.startedAt).toISOString()}"` : '""',
				att.submittedAt ? `"${new Date(att.submittedAt).toISOString()}"` : '""',
				att.status === 'completed' ? 'Selesai' : 'Sedang Berjalan',
				att.correctCount,
				att.wrongCount,
				att.totalQuestions,
				att.score ?? 0,
				isPassed ? 'LULUS' : 'BELUM LULUS'
			].join(',');
		});

		const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\r\n');

		return new Response(csvContent, {
			headers: {
				'Content-Type': 'text/csv; charset=utf-8',
				'Content-Disposition': `attachment; filename="Peserta_Quiz_Kaderisasi_HIMA_FST_${new Date().toISOString().split('T')[0]}.csv"`
			}
		});
	} catch (err: any) {
		console.error('Error generating CSV export:', err);
		throw error(500, 'Gagal membuat file export CSV');
	}
};
