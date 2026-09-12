import { fail, type Actions } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { prisma } from '$lib/server/prisma';

export const load: PageServerLoad = async () => {
	try {
		let quiz = await prisma.quiz.findFirst({
			where: { isActive: true }
		});

		if (!quiz) {
			quiz = await prisma.quiz.findFirst();
		}

		if (quiz) {
			return { quiz };
		}
	} catch (err) {
		console.error('Error loading quiz settings from db:', err);
	}

	return {
		quiz: {
			id: '11111111-1111-1111-1111-111111111111',
			title: 'Quiz Kaderisasi Tingkat I HIMA FST UT Bandung',
			description: 'Uji Pemahaman, Bangun Karakter, dan Siap Berkontribusi.',
			durationMinutes: 60,
			isActive: true,
			showResult: true,
			allowRetry: false
		}
	};
};

export const actions: Actions = {
	default: async ({ request }) => {
		const formData = await request.formData();
		const id = formData.get('id') as string;
		const title = (formData.get('title') as string)?.trim();
		const description = (formData.get('description') as string)?.trim();
		const durationMinutes = parseInt(formData.get('durationMinutes') as string, 10);
		const isActive = formData.get('isActive') === 'on';
		const showResult = formData.get('showResult') === 'on';
		const allowRetry = formData.get('allowRetry') === 'on';

		if (!id || !title || isNaN(durationMinutes)) {
			return fail(400, { error: 'Judul dan durasi waktu wajib diisi.' });
		}

		try {
			await prisma.quiz.update({
				where: { id },
				data: {
					title,
					description,
					durationMinutes,
					isActive,
					showResult,
					allowRetry
				}
			});

			return { success: true, message: 'Pengaturan quiz berhasil disimpan.' };
		} catch (err: any) {
			console.error('Error updating quiz settings:', err);
			return fail(500, { error: err?.message || 'Gagal menyimpan pengaturan.' });
		}
	}
};
