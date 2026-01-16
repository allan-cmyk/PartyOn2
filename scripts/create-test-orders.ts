/**
 * Test Order Data Generation Script
 * Creates test orders (regular and group) for ops dashboard testing
 *
 * Run: npx tsx scripts/create-test-orders.ts
 */

import { PrismaClient, OrderStatus, FinancialStatus, FulfillmentStatus, DeliveryType, ProductStatus, GroupOrderStatus, ParticipantStatus } from '@prisma/client';

const prisma = new PrismaClient();

// Helper to generate random string
function randomCode(length: number = 6): string {
  return Math.random().toString(36).substring(2, 2 + length).toUpperCase();
}

// Helper to get date N days from now
function daysFromNow(days: number): Date {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date;
}

async function createTestCustomers() {
  console.log('Creating test customers...');

  const customers = [
    {
      email: 'test-host@partyondelivery.com',
      firstName: 'Test',
      lastName: 'Host',
      phone: '512-555-0001',
      ageVerified: true,
      ageVerifiedAt: new Date(),
    },
    {
      email: 'test-participant1@partyondelivery.com',
      firstName: 'Alice',
      lastName: 'Participant',
      phone: '512-555-0002',
      ageVerified: true,
      ageVerifiedAt: new Date(),
    },
    {
      email: 'test-participant2@partyondelivery.com',
      firstName: 'Bob',
      lastName: 'Participant',
      phone: '512-555-0003',
      ageVerified: true,
      ageVerifiedAt: new Date(),
    },
    {
      email: 'test-regular@partyondelivery.com',
      firstName: 'Regular',
      lastName: 'Customer',
      phone: '512-555-0004',
      ageVerified: true,
      ageVerifiedAt: new Date(),
    },
  ];

  const createdCustomers = [];

  for (const customerData of customers) {
    const existing = await prisma.customer.findUnique({
      where: { email: customerData.email },
    });

    if (existing) {
      console.log(`  Customer ${customerData.email} already exists`);
      createdCustomers.push(existing);
    } else {
      const customer = await prisma.customer.create({ data: customerData });
      console.log(`  Created customer: ${customer.email}`);
      createdCustomers.push(customer);
    }
  }

  return createdCustomers;
}

async function createTestProducts() {
  console.log('Creating test products...');

  const products = [
    {
      handle: 'test-cabernet-sauvignon',
      title: 'Test Cabernet Sauvignon',
      description: 'A bold red wine for testing',
      productType: 'Wine',
      vendor: 'Test Winery',
      basePrice: 24.99,
      abv: 14.5,
      status: ProductStatus.ACTIVE,
      tags: ['red', 'wine', 'cabernet'],
    },
    {
      handle: 'test-chardonnay',
      title: 'Test Chardonnay',
      description: 'A crisp white wine for testing',
      productType: 'Wine',
      vendor: 'Test Winery',
      basePrice: 19.99,
      abv: 13.5,
      status: ProductStatus.ACTIVE,
      tags: ['white', 'wine', 'chardonnay'],
    },
    {
      handle: 'test-premium-whiskey',
      title: 'Test Premium Whiskey',
      description: 'A smooth whiskey for testing',
      productType: 'Whiskey',
      vendor: 'Test Distillery',
      basePrice: 49.99,
      abv: 40.0,
      status: ProductStatus.ACTIVE,
      tags: ['whiskey', 'premium'],
    },
  ];

  const createdProducts = [];

  for (const productData of products) {
    const existing = await prisma.product.findUnique({
      where: { handle: productData.handle },
    });

    if (existing) {
      console.log(`  Product ${productData.handle} already exists`);
      const withVariant = await prisma.product.findUnique({
        where: { handle: productData.handle },
        include: { variants: true },
      });
      createdProducts.push(withVariant!);
    } else {
      const product = await prisma.product.create({
        data: {
          ...productData,
          variants: {
            create: {
              title: 'Default',
              price: productData.basePrice,
              sku: `TEST-${productData.handle.toUpperCase().slice(5, 10)}-001`,
              inventoryQuantity: 100,
              availableForSale: true,
            },
          },
        },
        include: { variants: true },
      });
      console.log(`  Created product: ${product.title}`);
      createdProducts.push(product);
    }
  }

  return createdProducts;
}

async function createRegularOrders(customers: Awaited<ReturnType<typeof createTestCustomers>>, products: Awaited<ReturnType<typeof createTestProducts>>) {
  console.log('Creating regular test orders...');

  const regularCustomer = customers.find(c => c.email === 'test-regular@partyondelivery.com')!;

  const orderConfigs = [
    {
      status: OrderStatus.DELIVERED,
      financialStatus: FinancialStatus.PAID,
      fulfillmentStatus: FulfillmentStatus.DELIVERED,
      deliveryDate: daysFromNow(-3),
      items: [
        { product: products[0], qty: 2 }, // 2x Cabernet
        { product: products[1], qty: 1 }, // 1x Chardonnay
      ],
    },
    {
      status: OrderStatus.CONFIRMED,
      financialStatus: FinancialStatus.PAID,
      fulfillmentStatus: FulfillmentStatus.UNFULFILLED,
      deliveryDate: daysFromNow(1),
      items: [
        { product: products[2], qty: 1 }, // 1x Whiskey
      ],
    },
    {
      status: OrderStatus.PENDING,
      financialStatus: FinancialStatus.PENDING,
      fulfillmentStatus: FulfillmentStatus.UNFULFILLED,
      deliveryDate: daysFromNow(3),
      items: [
        { product: products[0], qty: 3 }, // 3x Cabernet
        { product: products[2], qty: 2 }, // 2x Whiskey
      ],
    },
  ];

  const createdOrders = [];

  for (const config of orderConfigs) {
    const subtotal = config.items.reduce(
      (sum, item) => sum + Number(item.product.basePrice) * item.qty,
      0
    );
    const taxAmount = subtotal * 0.0825; // 8.25% Texas tax
    const deliveryFee = 25;
    const total = subtotal + taxAmount + deliveryFee;

    const order = await prisma.order.create({
      data: {
        customerId: regularCustomer.id,
        status: config.status,
        financialStatus: config.financialStatus,
        fulfillmentStatus: config.fulfillmentStatus,
        subtotal,
        taxAmount,
        deliveryFee,
        total,
        deliveryDate: config.deliveryDate,
        deliveryTime: '2:00 PM - 4:00 PM',
        deliveryPhone: regularCustomer.phone || '512-555-0000',
        deliveryType: DeliveryType.HOUSE,
        deliveryAddress: {
          address1: '123 Test Street',
          city: 'Austin',
          state: 'TX',
          zip: '78701',
        },
        customerEmail: regularCustomer.email,
        customerName: `${regularCustomer.firstName} ${regularCustomer.lastName}`,
        // groupOrderId is NULL for regular orders
        items: {
          create: config.items.map((item) => ({
            productId: item.product.id,
            variantId: item.product.variants[0].id,
            title: item.product.title,
            variantTitle: item.product.variants[0].title,
            sku: item.product.variants[0].sku,
            price: item.product.basePrice,
            quantity: item.qty,
            totalPrice: Number(item.product.basePrice) * item.qty,
          })),
        },
      },
      include: { items: true },
    });

    console.log(`  Created regular order #${order.orderNumber}: ${config.status} - $${total.toFixed(2)}`);
    createdOrders.push(order);
  }

  return createdOrders;
}

async function createGroupOrder(customers: Awaited<ReturnType<typeof createTestCustomers>>, products: Awaited<ReturnType<typeof createTestProducts>>) {
  console.log('Creating test group order with participants...');

  const hostCustomer = customers.find(c => c.email === 'test-host@partyondelivery.com')!;
  const participant1 = customers.find(c => c.email === 'test-participant1@partyondelivery.com')!;
  const participant2 = customers.find(c => c.email === 'test-participant2@partyondelivery.com')!;

  const shareCode = `TEST${randomCode(4)}`;
  const deliveryDate = daysFromNow(2);

  // Create the GroupOrder first
  const groupOrder = await prisma.groupOrder.create({
    data: {
      name: 'Test Party Group Order',
      hostCustomerId: hostCustomer.id,
      hostName: `${hostCustomer.firstName} ${hostCustomer.lastName}`,
      shareCode,
      status: GroupOrderStatus.COMPLETED,
      deliveryDate,
      deliveryTime: '4:00 PM - 6:00 PM',
      deliveryAddress: {
        address1: '456 Party Lane',
        city: 'Austin',
        state: 'TX',
        zip: '78702',
      },
      minimumOrderAmount: 100,
      expiresAt: daysFromNow(7),
    },
  });

  console.log(`  Created group order: ${shareCode}`);

  // Create participants
  const participantConfigs = [
    {
      customer: hostCustomer,
      isHost: true,
      guestName: null,
      guestEmail: null,
      items: [
        { product: products[0], qty: 2 }, // Host: 2x Cabernet = $49.98
        { product: products[1], qty: 1 }, // Host: 1x Chardonnay = $19.99
      ],
    },
    {
      customer: participant1,
      isHost: false,
      guestName: null,
      guestEmail: null,
      items: [
        { product: products[2], qty: 1 }, // Alice: 1x Whiskey = $49.99
      ],
    },
    {
      customer: null, // Guest participant
      isHost: false,
      guestName: 'Guest Participant',
      guestEmail: 'guest@example.com',
      items: [
        { product: products[1], qty: 2 }, // Guest: 2x Chardonnay = $39.98
      ],
    },
  ];

  const createdSubOrders = [];

  for (const pConfig of participantConfigs) {
    const cartId = `test-cart-${randomCode(8)}`;
    const cartTotal = pConfig.items.reduce(
      (sum, item) => sum + Number(item.product.basePrice) * item.qty,
      0
    );
    const itemCount = pConfig.items.reduce((sum, item) => sum + item.qty, 0);

    // Create participant
    const participant = await prisma.groupParticipant.create({
      data: {
        groupOrderId: groupOrder.id,
        customerId: pConfig.customer?.id || null,
        guestName: pConfig.guestName,
        guestEmail: pConfig.guestEmail,
        cartId,
        ageVerified: true,
        status: ParticipantStatus.CHECKED_OUT,
        cartTotal,
        itemCount,
        checkedOutAt: new Date(),
      },
    });

    // Create sub-order for this participant
    const customerEmail = pConfig.customer?.email || pConfig.guestEmail || 'guest@example.com';
    const customerName = pConfig.customer
      ? `${pConfig.customer.firstName} ${pConfig.customer.lastName}`
      : pConfig.guestName || 'Guest';
    const customerPhone = pConfig.customer?.phone || '512-555-0000';

    const subtotal = cartTotal;
    const taxAmount = subtotal * 0.0825;
    const deliveryFee = 0; // Group orders have free delivery
    const total = subtotal + taxAmount + deliveryFee;

    const subOrder = await prisma.order.create({
      data: {
        customerId: pConfig.customer?.id || participant1.id, // Fallback for guest
        status: OrderStatus.CONFIRMED,
        financialStatus: FinancialStatus.PAID,
        fulfillmentStatus: FulfillmentStatus.UNFULFILLED,
        subtotal,
        taxAmount,
        deliveryFee,
        total,
        deliveryDate: groupOrder.deliveryDate,
        deliveryTime: groupOrder.deliveryTime,
        deliveryPhone: customerPhone,
        deliveryType: DeliveryType.HOUSE,
        deliveryAddress: groupOrder.deliveryAddress as object,
        customerEmail,
        customerName,
        groupOrderId: groupOrder.id, // Link to group order!
        items: {
          create: pConfig.items.map((item) => ({
            productId: item.product.id,
            variantId: item.product.variants[0].id,
            title: item.product.title,
            variantTitle: item.product.variants[0].title,
            sku: item.product.variants[0].sku,
            price: item.product.basePrice,
            quantity: item.qty,
            totalPrice: Number(item.product.basePrice) * item.qty,
          })),
        },
      },
      include: { items: true },
    });

    // Update participant with order ID
    await prisma.groupParticipant.update({
      where: { id: participant.id },
      data: {
        shopifyOrderId: subOrder.id, // We're using local order ID
        shopifyOrderName: `#${subOrder.orderNumber}`,
      },
    });

    const participantLabel = pConfig.customer
      ? `${pConfig.customer.firstName}`
      : pConfig.guestName;
    console.log(`  Created sub-order #${subOrder.orderNumber} for ${participantLabel}: $${total.toFixed(2)}`);
    createdSubOrders.push(subOrder);
  }

  return { groupOrder, subOrders: createdSubOrders };
}

async function printSummary() {
  console.log('\n=== TEST DATA SUMMARY ===\n');

  // Regular orders
  const regularOrders = await prisma.order.findMany({
    where: { groupOrderId: null },
    orderBy: { orderNumber: 'asc' },
    select: { orderNumber: true, status: true, total: true, customerEmail: true },
  });

  console.log('Regular Orders (no group):');
  for (const order of regularOrders) {
    console.log(`  #${order.orderNumber}: ${order.status} - $${Number(order.total).toFixed(2)} - ${order.customerEmail}`);
  }

  // Group orders
  const groupOrders = await prisma.groupOrder.findMany({
    include: {
      participants: true,
      orders: {
        select: { orderNumber: true, total: true, customerName: true },
      },
    },
  });

  console.log('\nGroup Orders:');
  for (const group of groupOrders) {
    console.log(`  Group "${group.name}" (${group.shareCode}):`);
    console.log(`    Status: ${group.status}`);
    console.log(`    Participants: ${group.participants.length}`);
    console.log(`    Sub-orders:`);
    for (const subOrder of group.orders) {
      console.log(`      #${subOrder.orderNumber}: $${Number(subOrder.total).toFixed(2)} - ${subOrder.customerName}`);
    }
    const groupTotal = group.orders.reduce((sum, o) => sum + Number(o.total), 0);
    console.log(`    Group Total: $${groupTotal.toFixed(2)}`);
  }

  // Stats
  const totalOrders = await prisma.order.count();
  const groupSubOrders = await prisma.order.count({ where: { groupOrderId: { not: null } } });

  console.log('\nStats:');
  console.log(`  Total orders: ${totalOrders}`);
  console.log(`  Regular orders: ${totalOrders - groupSubOrders}`);
  console.log(`  Group sub-orders: ${groupSubOrders}`);
  console.log(`  Group orders: ${groupOrders.length}`);
}

async function main() {
  console.log('=== Creating Test Order Data ===\n');

  try {
    const customers = await createTestCustomers();
    const products = await createTestProducts();
    await createRegularOrders(customers, products);
    await createGroupOrder(customers, products);

    await printSummary();

    console.log('\nTest data creation complete!');
    console.log('View orders at: /ops/orders');
  } catch (error) {
    console.error('Error creating test data:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main();
