import { createBrowserClient, isBrowser } from '@supabase/ssr';
import { env } from '$env/dynamic/public';

const supabaseUrl = env.PUBLIC_SUPABASE_URL || 'https://placeholder-project.supabase.co';
const supabaseAnonKey = env.PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key';

export const createClient = () =>
	createBrowserClient(supabaseUrl, supabaseAnonKey, {
		isSingleton: true
	});
