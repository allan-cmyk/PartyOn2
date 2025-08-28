#!/usr/bin/env node

/**
 * Database Setup Script for PartyOn Delivery
 * Run this after setting up Vercel Postgres
 */

console.log(`
╔══════════════════════════════════════════════════════════════╗
║           PartyOn Delivery - Database Setup Guide           ║
╚══════════════════════════════════════════════════════════════╝

📋 SETUP STEPS:

1. ✅ Go to Vercel Dashboard → Your Project → Storage Tab
   
2. ✅ Create Postgres Database:
   • Click "Create Database" → Select "Postgres"
   • Name: partyon-postgres
   • Click "Create"

3. ✅ (Optional) Create KV Database for real-time features:
   • Click "Create Database" → Select "KV"
   • Name: partyon-kv
   • Click "Create"

4. ✅ Pull environment variables:
   $ vercel env pull .env.development.local

5. ✅ Install dependencies:
   $ npm install

6. ✅ Generate Prisma client:
   $ npm run db:generate

7. ✅ Push schema to database:
   $ npm run db:push

8. ✅ (Optional) Open Prisma Studio to view data:
   $ npm run db:studio

═══════════════════════════════════════════════════════════════

🎉 Once complete, your database is ready!

The app will automatically:
• Use Vercel Postgres when configured
• Fall back to in-memory storage in development
• Use KV for real-time features when available

═══════════════════════════════════════════════════════════════

📊 What gets stored:

Vercel Postgres:
• Group orders and participants
• Partner inquiries/applications
• Order analytics

Vercel KV (Redis):
• Active group order sessions
• Real-time cart syncing
• Share code lookups

Shopify (unchanged):
• Products
• Customer accounts
• Orders & checkout
`);