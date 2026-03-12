#!/usr/bin/env node
/**
 * Create a draft order (invoice)
 * Usage: node scripts/ops/create-draft-order.mjs '<json>'
 *
 * JSON format:
 * {
 *   "customerName": "Jane Doe",
 *   "customerEmail": "jane@email.com",
 *   "customerPhone": "512-555-1234",
 *   "deliveryAddress": "123 Main St",
 *   "deliveryCity": "Austin",
 *   "deliveryZip": "78704",
 *   "deliveryDate": "2026-03-20",
 *   "deliveryTime": "12:00 PM - 2:00 PM",
 *   "deliveryNotes": "Gate code 1234",
 *   "items": [
 *     { "productId": "...", "variantId": "...", "title": "White Claw Variety 12pk", "quantity": 2, "price": 19.99 }
 *   ],
 *   "discountAmount": 0,
 *   "adminNotes": "Created via ops agent CLI"
 * }
 */
import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

// Inline delivery fee calculation (mirrors src/lib/delivery/rates.ts)
const ZONES = [
  { name: 'Central Austin', baseRate: 25, freeAt: 250, min: 100, zips: ['78701','78702','78703','78704','78705','78751','78752','78756','78757'] },
  { name: 'Greater Austin', baseRate: 30, freeAt: 300, min: 125, zips: ['78617','78652','78653','78660','78664','78681','78717','78719','78721','78722','78723','78724','78725','78727','78728','78729','78731','78732','78733','78734','78735','78736','78737','78738','78739','78741','78744','78745','78746','78747','78748','78749','78750','78753','78754','78758','78759'] },
  { name: 'Extended Austin', baseRate: 40, freeAt: 400, min: 150, zips: ['78613','78620','78626','78628','78633','78641','78642','78665','78669','78676','78726'] },
];

function calcDeliveryFee(zip, subtotal) {
  const z = ZONES.find(z => z.zips.includes(zip));
  if (!z) return { fee: 30, zone: 'Outside Service Area', originalFee: 30, free: false };
  const free = subtotal >= z.freeAt;
  return { fee: free ? 0 : z.baseRate, zone: z.name, originalFee: z.baseRate, free };
}

const TAX_RATE = 0.0825;

try {
  const input = JSON.parse(process.argv[2]);

  const items = input.items;
  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const discountAmount = input.discountAmount || 0;
  const delivery = calcDeliveryFee(input.deliveryZip, subtotal);
  const taxable = Math.max(0, subtotal - discountAmount);
  const taxAmount = Math.round(taxable * TAX_RATE * 100) / 100;
  const total = subtotal - discountAmount + taxAmount + delivery.fee;

  const deliveryDate = new Date(input.deliveryDate + 'T12:00:00Z');

  const draftOrder = await prisma.draftOrder.create({
    data: {
      customerEmail: input.customerEmail,
      customerName: input.customerName,
      customerPhone: input.customerPhone || null,
      deliveryAddress: input.deliveryAddress,
      deliveryCity: input.deliveryCity || 'Austin',
      deliveryState: input.deliveryState || 'TX',
      deliveryZip: input.deliveryZip,
      deliveryDate,
      deliveryTime: input.deliveryTime || '12:00 PM - 2:00 PM',
      deliveryNotes: input.deliveryNotes || null,
      items: items,
      subtotal: new Prisma.Decimal(subtotal),
      taxAmount: new Prisma.Decimal(taxAmount),
      deliveryFee: new Prisma.Decimal(delivery.fee),
      originalDeliveryFee: new Prisma.Decimal(delivery.originalFee),
      discountAmount: new Prisma.Decimal(discountAmount),
      discountCode: input.discountCode || null,
      total: new Prisma.Decimal(total),
      adminNotes: input.adminNotes || 'Created via ops agent CLI',
      createdBy: 'ops-agent-cli',
      status: 'PENDING',
    },
  });

  console.log(JSON.stringify({
    success: true,
    id: draftOrder.id,
    token: draftOrder.token,
    summary: {
      customer: input.customerName,
      deliveryDate: input.deliveryDate,
      deliveryZone: delivery.zone,
      freeDelivery: delivery.free,
      subtotal: subtotal.toFixed(2),
      tax: taxAmount.toFixed(2),
      deliveryFee: delivery.fee.toFixed(2),
      discount: discountAmount.toFixed(2),
      total: total.toFixed(2),
      itemCount: items.length,
    },
  }, null, 2));
} catch (err) {
  console.error(JSON.stringify({ success: false, error: err.message }));
  process.exit(1);
}

await prisma.$disconnect();
