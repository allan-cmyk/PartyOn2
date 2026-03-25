/**
 * One-time setup: generate a webhook API key for Premier Party Cruises
 * and optionally set their callback URL.
 *
 * Usage:
 *   set -a && source .env.local && set +a
 *   node scripts/set-premier-webhook-key.mjs [callbackUrl]
 */

import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

const prisma = new PrismaClient();

async function main() {
  const callbackUrl = process.argv[2] || null;
  const apiKey = crypto.randomBytes(32).toString('hex');

  const affiliate = await prisma.affiliate.update({
    where: { code: 'PREMIER' },
    data: {
      webhookApiKey: apiKey,
      ...(callbackUrl ? { callbackUrl } : {}),
    },
  });

  console.log('Updated affiliate:', affiliate.businessName);
  console.log('API Key:', apiKey);
  if (callbackUrl) {
    console.log('Callback URL:', callbackUrl);
  }
  console.log('\nUse this key in the X-API-Key header when calling POST /api/webhooks/create-dashboard');
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
