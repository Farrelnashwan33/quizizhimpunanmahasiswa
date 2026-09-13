import { PrismaClient } from '@prisma/client';
import { env } from '$env/dynamic/private';
import { dev } from '$app/environment';

export function getDatabaseUrl(): string {
	let url =
		env.DATABASE_URL ||
		process.env.DATABASE_URL ||
		process.env.POSTGRES_PRISMA_URL ||
		process.env.POSTGRES_URL ||
		'postgresql://farrelnashwan@localhost:5432/quiz_fst?schema=public';
	url = url.trim();

	if (url) {
		// If using Supabase transaction pooler on port 6543, ensure pgbouncer=true is appended
		if (url.includes(':6543') && !url.includes('pgbouncer=true')) {
			const separator = url.includes('?') ? '&' : '?';
			url = `${url}${separator}pgbouncer=true&connection_limit=1`;
		}
	}

	return url;
}

export function isDatabaseConnected(): boolean {
	const url = getDatabaseUrl();
	return Boolean(url && !url.includes('placeholder'));
}

export const isDatabaseConfigured = true;

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export function getPrismaClient(): PrismaClient {
	const url = getDatabaseUrl();

	if (globalForPrisma.prisma) {
		return globalForPrisma.prisma;
	}

	const client = new PrismaClient({
		datasources: {
			db: {
				url: url || 'postgresql://farrelnashwan@localhost:5432/quiz_fst?schema=public'
			}
		},
		log: dev ? ['error', 'warn'] : ['error']
	});

	if (process.env.NODE_ENV !== 'production') {
		globalForPrisma.prisma = client;
	}

	return client;
}

export const prisma = new Proxy({} as PrismaClient, {
	get(_target, prop) {
		const client = getPrismaClient();
		return (client as any)[prop];
	}
});


