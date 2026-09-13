import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { prisma, isDatabaseConfigured, getDatabaseUrl } from '$lib/server/prisma';
import { supabaseAdmin, isSupabaseConfigured, supabaseUrl } from '$lib/server/supabase';
import { getAllQuizAttempts } from '$lib/server/dbService';

export const GET: RequestHandler = async ({ locals }) => {
	const dbUrl = getDatabaseUrl();
	const sanitizedDbUrl = dbUrl ? dbUrl.replace(/:[^:@]+@/, ':****@') : 'NOT SET';

	const diagnostics: any = {
		prisma: {
			isConfigured: isDatabaseConfigured,
			databaseUrl: sanitizedDbUrl,
			status: 'unknown',
			profileCount: 0,
			attemptCount: 0,
			answerCount: 0,
			error: null
		},
		supabase: {
			isConfigured: isSupabaseConfigured,
			supabaseUrl,
			status: 'unknown',
			profilesFound: 0,
			attemptsFound: 0,
			answersFound: 0,
			error: null
		},
		dbServiceResult: {
			totalAttempts: 0,
			samples: []
		}
	};

	// 1. Test Prisma
	if (isDatabaseConfigured) {
		try {
			const pCount = await prisma.profile.count();
			const aCount = await prisma.quizAttempt.count();
			const ansCount = await prisma.answer.count();

			diagnostics.prisma.status = 'connected';
			diagnostics.prisma.profileCount = pCount;
			diagnostics.prisma.attemptCount = aCount;
			diagnostics.prisma.answerCount = ansCount;
		} catch (err: any) {
			diagnostics.prisma.status = 'error';
			diagnostics.prisma.error = err?.message || String(err);
		}
	} else {
		diagnostics.prisma.status = 'not_configured';
	}

	// 2. Test Supabase REST API
	if (isSupabaseConfigured) {
		try {
			const { data: profs, error: pErr } = await supabaseAdmin.from('profiles').select('*');
			const { data: atts, error: aErr } = await supabaseAdmin.from('quiz_attempts').select('*');
			const { data: anss, error: ansErr } = await supabaseAdmin.from('answers').select('*');

			diagnostics.supabase.status = 'connected';
			diagnostics.supabase.profilesFound = profs?.length || 0;
			diagnostics.supabase.attemptsFound = atts?.length || 0;
			diagnostics.supabase.answersFound = anss?.length || 0;

			if (pErr || aErr || ansErr) {
				diagnostics.supabase.error = {
					profilesError: pErr?.message,
					attemptsError: aErr?.message,
					answersError: ansErr?.message
				};
			}
		} catch (err: any) {
			diagnostics.supabase.status = 'error';
			diagnostics.supabase.error = err?.message || String(err);
		}
	} else {
		diagnostics.supabase.status = 'not_configured (keys missing)';
	}

	// 3. Test dbService
	try {
		const res = await getAllQuizAttempts({ pageSize: 50 });
		diagnostics.dbServiceResult.totalAttempts = res.totalCount;
		diagnostics.dbServiceResult.samples = res.attempts.map((a) => ({
			id: a.id,
			name: a.student?.fullName,
			nim: a.student?.nim,
			score: a.score,
			status: a.status,
			startedAt: a.startedAt,
			submittedAt: a.submittedAt
		}));
	} catch (err: any) {
		diagnostics.dbServiceResult.error = err?.message || String(err);
	}

	return json(diagnostics);
};
