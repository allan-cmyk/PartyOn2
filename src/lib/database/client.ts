import { PrismaClient } from '@prisma/client'

// Prisma client singleton
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

// Helper to check if databases are configured
export const isDatabaseConfigured = () => {
  return !!(
    process.env.POSTGRES_URL && 
    process.env.POSTGRES_URL !== 'your-postgres-url'
  )
}

export const isKVConfigured = () => {
  return !!(
    process.env.KV_URL &&
    process.env.KV_URL !== 'your-kv-url'
  )
}

// KV (Redis) client
interface KVClient {
  get: (key: string) => Promise<unknown>;
  set: (key: string, value: unknown, options?: Record<string, unknown>) => Promise<unknown>;
}

let kvClient: KVClient | null = null

if (isKVConfigured()) {
  try {
    // Dynamic import for Vercel KV
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { kv: vercelKv } = require('@vercel/kv')
    kvClient = vercelKv
  } catch (error) {
    console.warn('KV client not available:', error)
  }
}

export const kv = kvClient || {
  get: async () => null,
  set: async () => null,
}