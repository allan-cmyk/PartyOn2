import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/database/client';
import type { InvoiceTextOverrides } from './templates/invoice';

export async function getInvoiceTextOverrides(): Promise<InvoiceTextOverrides> {
  const record = await prisma.emailTemplateContent.findUnique({
    where: { templateType: 'invoice' },
  });

  if (!record) return {};
  return record.content as InvoiceTextOverrides;
}

export async function saveInvoiceTextOverrides(
  content: InvoiceTextOverrides,
  updatedBy?: string
): Promise<void> {
  const jsonContent = content as unknown as Prisma.InputJsonValue;
  await prisma.emailTemplateContent.upsert({
    where: { templateType: 'invoice' },
    create: {
      templateType: 'invoice',
      content: jsonContent,
      updatedBy,
    },
    update: {
      content: jsonContent,
      updatedBy,
    },
  });
}
