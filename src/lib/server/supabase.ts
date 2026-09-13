import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { env } from '$env/dynamic/private';
import { env as publicEnv } from '$env/dynamic/public';

const rawSupabaseUrl = (
	publicEnv.PUBLIC_SUPABASE_URL ||
	(env as any).SUPABASE_URL ||
	(env as any).PUBLIC_SUPABASE_URL ||
	process.env.PUBLIC_SUPABASE_URL ||
	process.env.SUPABASE_URL ||
	process.env.NEXT_PUBLIC_SUPABASE_URL ||
	process.env.VITE_SUPABASE_URL ||
	'https://lbgmeiezpjjyvctjxqdl.supabase.co'
).trim();

const rawServiceKey = (
	env.SUPABASE_SERVICE_ROLE_KEY ||
	(env as any).SUPABASE_SERVICE_KEY ||
	(env as any).SUPABASE_SECRET_KEY ||
	process.env.SUPABASE_SERVICE_ROLE_KEY ||
	process.env.SUPABASE_SERVICE_KEY ||
	process.env.SUPABASE_SECRET_KEY ||
	''
).trim();

const rawAnonKey = (
	publicEnv.PUBLIC_SUPABASE_ANON_KEY ||
	(env as any).SUPABASE_ANON_KEY ||
	(env as any).PUBLIC_SUPABASE_ANON_KEY ||
	process.env.PUBLIC_SUPABASE_ANON_KEY ||
	process.env.SUPABASE_ANON_KEY ||
	process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
	process.env.VITE_SUPABASE_ANON_KEY ||
	''
).trim();

export const supabaseUrl = rawSupabaseUrl || 'https://lbgmeiezpjjyvctjxqdl.supabase.co';
export const supabaseKey = rawServiceKey || rawAnonKey || 'placeholder-key';

export const isSupabaseConfigured = Boolean(
	supabaseUrl &&
	!supabaseUrl.includes('placeholder') &&
	(rawServiceKey || rawAnonKey)
);

let cachedClient: SupabaseClient | null = null;

export function getSupabaseAdmin(): SupabaseClient {
	if (cachedClient) return cachedClient;

	cachedClient = createClient(supabaseUrl, supabaseKey, {
		auth: {
			autoRefreshToken: false,
			persistSession: false
		}
	});

	return cachedClient;
}

export const supabaseAdmin = new Proxy({} as SupabaseClient, {
	get(_target, prop) {
		const client = getSupabaseAdmin();
		return (client as any)[prop];
	}
});


