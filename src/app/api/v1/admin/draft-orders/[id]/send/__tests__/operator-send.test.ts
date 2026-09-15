/**
 * Sending a draft from ops is how an operator approves it (ADR-0010 exception
 * a): a customer-created draft becomes an operator invoice, so paying it no
 * longer needs 24 hours' notice. Only a real, ops-authenticated send does that.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest, NextResponse } from 'next/server';

const authMock = vi.hoisted(() => ({ requireOpsAuth: vi.fn() }));
vi.mock('@/lib/auth/ops-session', () => authMock);

const draftMock = vi.hoisted(() => ({
  getDraftOrderById: vi.fn(),
  updateDraftOrderStatus: vi.fn(),
}));
vi.mock('@/lib/draft-orders', () => draftMock);

const emailMock = vi.hoisted(() => ({ sendEmail: vi.fn() }));
vi.mock('@/lib/email/resend-client', () => emailMock);
vi.mock('@/lib/email/templates/invoice', () => ({
  generateInvoiceEmail: vi.fn(() => '<p>invoice</p>'),
  generateInvoiceSubject: vi.fn(() => 'Your invoice'),
}));
vi.mock('@/lib/email/template-content', () => ({
  getInvoiceTextOverrides: vi.fn(async () => ({})),
}));

import { POST } from '../route';

const PARAMS = { params: Promise.resolve({ id: 'draft-1' }) };

function request(): NextRequest {
  return new NextRequest('http://localhost/api/v1/admin/draft-orders/draft-1/send', { method: 'POST' });
}

function draft(overrides: Record<string, unknown> = {}) {
  return {
    id: 'draft-1',
    token: 'tok-1',
    status: 'PENDING',
    createdBy: 'landing:bachelorette',
    customerName: 'Sam Rivera',
    customerEmail: 'sam@example.com',
    deliveryDate: new Date('2026-09-17T12:00:00.000Z'),
    deliveryTime: '12:00 PM - 1:00 PM',
    deliveryAddress: '100 Congress Ave',
    deliveryCity: 'Austin',
    deliveryState: 'TX',
    deliveryZip: '78701',
    items: [],
    subtotal: 59.98,
    taxAmount: 4.95,
    deliveryFee: 30,
    discountAmount: 0,
    discountCode: null,
    total: 94.93,
    ...overrides,
  };
}

beforeEach(() => {
  vi.clearAllMocks();
  authMock.requireOpsAuth.mockResolvedValue({ userId: 'ops-1', role: 'admin' });
  emailMock.sendEmail.mockResolvedValue('resend-id');
  draftMock.updateDraftOrderStatus.mockResolvedValue({});
});

describe('POST /api/v1/admin/draft-orders/[id]/send — operator approval', () => {
  it("turns a customer's Quick-Buy draft into an operator invoice", async () => {
    draftMock.getDraftOrderById.mockResolvedValue(draft());

    const res = await POST(request(), PARAMS);

    expect(res.status).toBe(200);
    expect(draftMock.updateDraftOrderStatus).toHaveBeenCalledWith('draft-1', 'SENT', {
      sentAt: expect.any(Date),
      createdBy: 'ops-sent:landing:bachelorette',
    });
  });

  it("leaves an operator invoice's createdBy as it was", async () => {
    draftMock.getDraftOrderById.mockResolvedValue(draft({ createdBy: null }));

    await POST(request(), PARAMS);

    expect(draftMock.updateDraftOrderStatus).toHaveBeenCalledWith('draft-1', 'SENT', {
      sentAt: expect.any(Date),
      createdBy: null,
    });
  });

  it('approves nothing when the email fails to send', async () => {
    draftMock.getDraftOrderById.mockResolvedValue(draft());
    emailMock.sendEmail.mockResolvedValue(null);

    const res = await POST(request(), PARAMS);

    expect(res.status).toBe(500);
    expect(draftMock.updateDraftOrderStatus).not.toHaveBeenCalled();
  });

  it('approves nothing without an ops session', async () => {
    authMock.requireOpsAuth.mockResolvedValue(
      NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 }),
    );

    const res = await POST(request(), PARAMS);

    expect(res.status).toBe(401);
    expect(draftMock.getDraftOrderById).not.toHaveBeenCalled();
    expect(draftMock.updateDraftOrderStatus).not.toHaveBeenCalled();
  });
});
