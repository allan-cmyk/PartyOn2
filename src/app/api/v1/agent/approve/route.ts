import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database/client';
import { Prisma } from '@prisma/client';
import { createDraftOrder } from '@/lib/draft-orders/service';
import { adjustInventory, getDefaultLocation } from '@/lib/inventory/services/inventory-service';

export async function POST(request: NextRequest) {
  try {
    const { proposalId } = await request.json();

    if (!proposalId) {
      return NextResponse.json(
        { error: 'proposalId is required' },
        { status: 400 }
      );
    }

    const proposal = await prisma.agentProposal.findUnique({
      where: { id: proposalId },
    });

    if (!proposal) {
      return NextResponse.json(
        { error: 'Proposal not found' },
        { status: 404 }
      );
    }

    if (proposal.status !== 'PENDING') {
      return NextResponse.json(
        { error: `Proposal already ${proposal.status.toLowerCase()}` },
        { status: 400 }
      );
    }

    const data = proposal.data as Record<string, unknown>;
    let resultData: unknown = null;

    if (proposal.type === 'DRAFT_ORDER') {
      // Create actual draft order
      const items = (data.items as Array<Record<string, unknown>>).map(item => ({
        productId: item.productId as string,
        variantId: item.variantId as string,
        title: item.title as string,
        variantTitle: item.variantTitle as string | undefined,
        quantity: item.quantity as number,
        price: item.price as number,
        imageUrl: item.imageUrl as string | undefined,
      }));

      const draftOrder = await createDraftOrder({
        customerEmail: data.customerEmail as string,
        customerName: data.customerName as string,
        customerPhone: data.customerPhone as string | undefined,
        deliveryAddress: data.deliveryAddress as string,
        deliveryCity: (data.deliveryCity as string) || 'Austin',
        deliveryState: (data.deliveryState as string) || 'TX',
        deliveryZip: data.deliveryZip as string,
        deliveryDate: new Date(data.deliveryDate as string),
        deliveryTime: (data.deliveryTime as string) || '12:00 PM - 2:00 PM',
        deliveryNotes: data.deliveryNotes as string | undefined,
        items,
        subtotal: data.subtotal as number,
        taxAmount: data.taxAmount as number,
        deliveryFee: data.deliveryFee as number,
        originalDeliveryFee: data.originalDeliveryFee as number | undefined,
        discountAmount: (data.discountAmount as number) || 0,
        discountCode: data.discountCode as string | undefined,
        adminNotes: data.adminNotes as string | undefined,
        createdBy: 'ops-agent',
      });

      resultData = { draftOrderId: draftOrder.id, token: draftOrder.token };
    } else if (proposal.type === 'INVENTORY_ADJUSTMENT') {
      const adjustments = (data.adjustments as Array<Record<string, unknown>>);
      const location = await getDefaultLocation();

      if (!location) {
        return NextResponse.json(
          { error: 'No default inventory location found' },
          { status: 500 }
        );
      }

      const results = [];
      for (const adj of adjustments) {
        const result = await adjustInventory({
          productId: adj.productId as string,
          variantId: adj.variantId as string | undefined,
          locationId: location.id,
          quantity: adj.quantityChange as number,
          reason: adj.reason as string,
          type: (adj.quantityChange as number) > 0 ? 'RECEIVED' : 'ADJUSTMENT',
        });
        results.push({
          productId: adj.productId,
          previousQuantity: result.previousQuantity,
          newQuantity: result.newQuantity,
        });
      }

      resultData = { adjustments: results };
    }

    // Update proposal status
    await prisma.agentProposal.update({
      where: { id: proposalId },
      data: {
        status: 'APPROVED',
        resultData: resultData as Prisma.InputJsonValue,
      },
    });

    return NextResponse.json({ success: true, resultData });
  } catch (error) {
    console.error('Proposal approve error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Approval failed' },
      { status: 500 }
    );
  }
}
