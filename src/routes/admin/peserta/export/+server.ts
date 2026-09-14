import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getAllQuizAttempts } from '$lib/server/dbService';

export const GET: RequestHandler = async ({ locals }) => {
	if (!locals.user || locals.profile?.role !== 'admin') {
		throw error(403, 'Unauthorized');
	}

	try {
		const result = await getAllQuizAttempts({ pageSize: 10000 });
		const combined = result.attempts;

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
			'Waktu Mulai',
			'Waktu Selesai'
		];

		const rows = combined.map((att, index) => {
			const score = att.score ?? 0;
			const isPassed = score >= 70;
			const student = att.student || {};

			return [
				index + 1,
				`"${(student.fullName || '').replace(/"/g, '""')}"`,
				`"\t${student.nim || ''}"`, // \t prevents Excel from formatting NIM as scientific notation
				`"${(student.programStudi || '').replace(/"/g, '""')}"`,
				`"\t${student.whatsapp || '-'}"`,
				`"${student.email || '-'}"`,
				score,
				isPassed ? 'LULUS (>=70)' : 'TIDAK LULUS (<70)',
				att.correctCount ?? 0,
				att.wrongCount ?? 0,
				att.totalQuestions ?? 30,
				att.status === 'completed' ? 'Selesai' : 'Sedang Berjalan',
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

