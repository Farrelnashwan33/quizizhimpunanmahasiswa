import { PrismaClient } from '@prisma/client';
import { env } from '$env/dynamic/private';
import { dev } from '$app/environment';

const databaseUrl = env.DATABASE_URL || process.env.DATABASE_URL || '';

export const isDatabaseConfigured = Boolean(databaseUrl && databaseUrl.trim() !== '');

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

function getPrismaClient(): PrismaClient {
	if (globalForPrisma.prisma) {
		return globalForPrisma.prisma;
	}

	const client = isDatabaseConfigured
		? new PrismaClient({
				datasources: {
					db: {
						url: databaseUrl.trim()
					}
				},
				log: dev ? ['error', 'warn'] : ['error']
			})
		: new PrismaClient({
				log: ['error']
			});

	if (dev) {
		globalForPrisma.prisma = client;
	}

	return client;
}

export const prisma = getPrismaClient();
