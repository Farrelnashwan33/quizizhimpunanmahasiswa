import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { recordViolation } from '$lib/server/participantStore';

export const POST: RequestHandler = async ({ request }) => {
	try {
		const body = await request.json();
		const { studentName, nim, programStudi, violationCount, message } = body;

		if (!studentName || !nim) {
			return json({ success: false, error: 'Data tidak lengkap' }, { status: 400 });
		}

		const violationRecord = {
			id: 'viol-' + Math.random().toString(36).substring(2, 9) + '-' + Date.now().toString(36),
			studentName,
			nim,
			programStudi: programStudi || 'Sains dan Teknologi',
			violationCount: Number(violationCount) || 1,
			timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
			message: message || 'Terdeteksi membuka tab baru atau meninggalkan browser ujian.'
		};

		recordViolation(violationRecord);

		return json({ success: true, recorded: violationRecord });
	} catch (err: any) {
		console.error('Error logging violation:', err);
		return json({ success: false, error: err?.message }, { status: 500 });
	}
};
