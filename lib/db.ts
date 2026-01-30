
import { PrismaClient } from '@prisma/client'
import { Pool } from '@neondatabase/serverless'
import { PrismaNeon } from '@prisma/adapter-neon'

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

const connectionString = `${process.env.DATABASE_URL}`

// Use neon serverless for high-performance connection pooling
const pool = new Pool({
    connectionString,
    max: 20, // Keep up to 20 connections ready to go
    idleTimeoutMillis: 30000, // Close idle connections after 30s
    connectionTimeoutMillis: 2000, // Fail fast if DB is busy
});
const adapter = new PrismaNeon(pool as any);

export const prisma = globalForPrisma.prisma || new PrismaClient({
    adapter: adapter as any
});

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
