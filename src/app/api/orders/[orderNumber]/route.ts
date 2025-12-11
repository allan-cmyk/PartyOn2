import { NextRequest, NextResponse } from 'next/server';
import { getOrderByNumber, parseDeliveryInfo, formatPackageSize, getOrderSheetColor } from '@/lib/shopify/admin/orders';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ orderNumber: string }> }
) {
  try {
    const { orderNumber } = await params;
    const orderNum = parseInt(orderNumber, 10);

    if (isNaN(orderNum)) {
      return NextResponse.json(
        { error: 'Invalid order number' },
        { status: 400 }
      );
    }

    const order = await getOrderByNumber(orderNum);

    if (!order) {
      return NextResponse.json(
        { error: `Order #${orderNum} not found` },
        { status: 404 }
      );
    }

    // Parse delivery info from custom attributes and shipping address
    const deliveryInfo = parseDeliveryInfo(order.customAttributes, order.shippingAddress);

    // Extract numeric order number from name (e.g., "#3903" -> 3903)
    const orderNumMatch = order.name.match(/\d+/);
    const orderNumberRaw = orderNumMatch ? parseInt(orderNumMatch[0], 10) : 0;

    // Format the response for the order sheet
    const formattedOrder = {
      orderNumber: order.name,
      orderNumberRaw,
      createdAt: order.createdAt,
      status: {
        fulfillment: order.displayFulfillmentStatus,
        financial: order.displayFinancialStatus,
      },
      customer: {
        name: order.customer
          ? `${order.customer.firstName || ''} ${order.customer.lastName || ''}`.trim()
          : 'N/A',
        phone: order.customer?.phone || 'N/A',
        email: order.customer?.email || 'N/A',
      },
      delivery: {
        type: deliveryInfo.deliveryType,
        date: deliveryInfo.deliveryDate,
        time: deliveryInfo.deliveryTime,
        address: order.shippingAddress
          ? (() => {
              // Check if address2 contains date/time info (shouldn't be in address display)
              const addr2 = order.shippingAddress.address2 || '';
              const isDateTimeInAddr2 = /\d{1,2}\/\d{1,2}\/\d{2,4}\s*[-–]\s*\d{1,2}:\d{2}/i.test(addr2);
              const cleanAddr2 = isDateTimeInAddr2 ? '' : addr2;

              return {
                address1: order.shippingAddress.address1 || '',
                address2: cleanAddr2,
                city: order.shippingAddress.city || '',
                province: order.shippingAddress.province || '',
                zip: order.shippingAddress.zip || '',
                full: [
                  order.shippingAddress.address1,
                  cleanAddr2,
                  order.shippingAddress.city,
                  order.shippingAddress.province,
                  order.shippingAddress.zip,
                ]
                  .filter(Boolean)
                  .join(', '),
              };
            })()
          : null,
      },
      lineItems: order.lineItems.map((item) => {
        // Extract product name (before the bullet) and package size (after the bullet)
        const bulletIndex = item.title.indexOf('•');
        const productName = bulletIndex > -1 ? item.title.substring(0, bulletIndex).trim() : item.title;

        return {
          name: productName,
          packageSize: formatPackageSize(item.variantTitle, item.sku, item.title),
          quantity: item.quantity,
          sku: item.sku,
        };
      }),
      itemCount: order.lineItems.reduce((sum, item) => sum + item.quantity, 0),
      totalPrice: order.totalPriceSet.shopMoney.amount,
      currency: order.totalPriceSet.shopMoney.currencyCode,
      note: order.note,
      customAttributes: order.customAttributes,
      sheetColor: getOrderSheetColor(
        order.shippingAddress?.address1 || null,
        deliveryInfo.deliveryDate,
        deliveryInfo.deliveryTime,
        deliveryInfo.deliveryType
      ),
    };

    return NextResponse.json(formattedOrder);
  } catch (error) {
    console.error('Error fetching order:', error);
    return NextResponse.json(
      { error: 'Failed to fetch order' },
      { status: 500 }
    );
  }
}
