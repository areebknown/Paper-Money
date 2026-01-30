
import { PrismaClient } from '@prisma/client'
import { Pool } from '@neondatabase/serverless'
import { PrismaNeon } from '@prisma/adapter-neon'

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

const connectionString = `${process.env.DATABASE_URL}`

// Use neon serverless only in production/edge context
// For local development, standard prisma client is often easier
const pool = new Pool({ connectionString });
const adapter = new PrismaNeon(pool as any);

export const prisma = globalForPrisma.prisma || new PrismaClient({
    adapter: adapter as any
});

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
