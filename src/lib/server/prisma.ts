import { PrismaClient } from '@prisma/client';
import { env } from '$env/dynamic/private';
import { dev } from '$app/environment';

export function getDatabaseUrl(): string {
	const url =
		env.DATABASE_URL ||
		process.env.DATABASE_URL ||
		process.env.POSTGRES_PRISMA_URL ||
		process.env.POSTGRES_URL ||
		'';
	return url.trim();
}

export const isDatabaseConfigured = Boolean(getDatabaseUrl() !== '');

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export function getPrismaClient(): PrismaClient {
	const url = getDatabaseUrl();

	if (globalForPrisma.prisma) {
		return globalForPrisma.prisma;
	}

	const client = url
		? new PrismaClient({
				datasources: {
					db: {
						url
					}
				},
				log: ['error', 'warn']
			})
		: new PrismaClient({
				log: ['error']
			});

	globalForPrisma.prisma = client;
	return client;
}

export const prisma = new Proxy({} as PrismaClient, {
	get(_target, prop) {
		const client = getPrismaClient();
		return (client as any)[prop];
	}
});
