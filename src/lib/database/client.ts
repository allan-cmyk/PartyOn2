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
let kvClient: any = null

if (isKVConfigured()) {
  try {
    const { kv: vercelKv } = require('@vercel/kv')
    kvClient = vercelKv
  } catch (error) {
    console.warn('KV client not available:', error)
  }
}

export const kv = kvClient || {
  get: async (_key: string) => null,
  set: async (_key: string, _value: unknown, _options?: Record<string, unknown>) => null,
}