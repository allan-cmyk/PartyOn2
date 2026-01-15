/**
 * Cart Service Tests
 * Tests for the custom cart system
 */

import { describe, it, expect } from 'vitest';
import {
  validateCartMinimum,
  cartToCheckoutData,
  hasDeliveryInfo,
} from '@/lib/inventory/services/cart-service';

// Mock cart item for testing
const mockCartItem = {
  id: 'item-1',
  cartId: 'cart-1',
  productId: 'prod-1',
  variantId: 'var-1',
  quantity: 3,
  price: 15.99,
  title: 'Test Product',
  variantTitle: 'Default',
  imageUrl: null,
  product: {
    id: 'prod-1',
    title: 'Test Product',
    handle: 'test-product',
  },
  variant: {
    id: 'var-1',
    title: 'Default',
    sku: 'TEST-001',
  },
  createdAt: new Date(),
  updatedAt: new Date(),
};

// Helper to create a mock cart
function createMockCart(subtotal: number, overrides = {}) {
  return {
    id: 'cart-1',
    sessionId: 'session-1',
    customerId: null,
    items: [] as typeof mockCartItem[],
    subtotal,
    taxRate: 0.0825,
    taxAmount: subtotal * 0.0825,
    deliveryFee: 25,
    total: subtotal + subtotal * 0.0825 + 25,
    deliveryDate: null,
    deliveryTime: null,
    deliveryAddress: null,
    deliveryPhone: null,
    deliveryInstructions: null,
    discountCode: null,
    discountAmount: 0,
    status: 'ACTIVE' as const,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

describe('Cart Minimum Validation', () => {
  it('should return not valid when cart is empty', () => {
    const cart = createMockCart(0);
    const result = validateCartMinimum(cart);

    expect(result.valid).toBe(false);
    expect(result.minimum).toBe(100);
    expect(result.current).toBe(0);
    expect(result.difference).toBe(100);
  });

  it('should return not valid when below minimum', () => {
    const cart = createMockCart(50);
    const result = validateCartMinimum(cart);

    expect(result.valid).toBe(false);
    expect(result.current).toBe(50);
    expect(result.difference).toBe(50);
  });

  it('should return valid when at minimum', () => {
    const cart = createMockCart(100);
    const result = validateCartMinimum(cart);

    expect(result.valid).toBe(true);
    expect(result.current).toBe(100);
    expect(result.difference).toBe(0);
  });

  it('should return valid when above minimum', () => {
    const cart = createMockCart(150);
    const result = validateCartMinimum(cart);

    expect(result.valid).toBe(true);
    expect(result.current).toBe(150);
    expect(result.difference).toBe(0);
  });

  it('should return not valid at $99.99', () => {
    const cart = createMockCart(99.99);
    const result = validateCartMinimum(cart);

    expect(result.valid).toBe(false);
  });
});

describe('Delivery Info Detection', () => {
  it('should return false when no delivery info', () => {
    const cart = createMockCart(100);
    expect(hasDeliveryInfo(cart)).toBe(false);
  });

  it('should return false when only partial delivery info', () => {
    const cart = createMockCart(100, {
      deliveryDate: new Date('2025-01-20'),
      // Missing time, address, phone
    });
    expect(hasDeliveryInfo(cart)).toBe(false);
  });

  it('should return true when all delivery info is set', () => {
    const cart = createMockCart(100, {
      deliveryDate: new Date('2025-01-20'),
      deliveryTime: '2:00 PM - 4:00 PM',
      deliveryAddress: { address1: '123 Main St', city: 'Austin', state: 'TX', zip: '78701' },
      deliveryPhone: '512-555-1234',
    });
    expect(hasDeliveryInfo(cart)).toBe(true);
  });
});

describe('Cart to Checkout Data Conversion', () => {
  it('should format cart items correctly', () => {
    const cart = createMockCart(47.97, {
      items: [mockCartItem],
      taxAmount: 3.96,
      total: 76.93,
    });

    const result = cartToCheckoutData(cart);

    expect(result.items).toHaveLength(1);
    expect(result.items[0].title).toBe('Test Product');
    expect(result.items[0].quantity).toBe(3);
    expect(result.items[0].price).toBe(15.99);
    expect(result.subtotal).toBe(47.97);
    expect(result.taxAmount).toBe(3.96);
    expect(result.total).toBe(76.93);
  });

  it('should include delivery info when present', () => {
    const deliveryDate = new Date('2025-01-20');
    const deliveryAddress = { address1: '123 Main St', city: 'Austin', state: 'TX', zip: '78701' };

    const cart = createMockCart(100, {
      items: [mockCartItem],
      deliveryDate,
      deliveryTime: '2:00 PM - 4:00 PM',
      deliveryAddress,
      deliveryPhone: '512-555-1234',
      deliveryInstructions: 'Leave at door',
    });

    const result = cartToCheckoutData(cart);

    expect(result.delivery).not.toBeNull();
    expect(result.delivery?.date).toEqual(deliveryDate);
    expect(result.delivery?.time).toBe('2:00 PM - 4:00 PM');
    expect(result.delivery?.address).toEqual(deliveryAddress);
    expect(result.delivery?.phone).toBe('512-555-1234');
    expect(result.delivery?.instructions).toBe('Leave at door');
  });

  it('should return null delivery when no delivery address', () => {
    const cart = createMockCart(100);
    const result = cartToCheckoutData(cart);

    expect(result.delivery).toBeNull();
  });

  it('should handle empty cart', () => {
    const cart = createMockCart(0);
    const result = cartToCheckoutData(cart);

    expect(result.items).toHaveLength(0);
    expect(result.subtotal).toBe(0);
  });
});

describe('Business Rules', () => {
  it('should enforce $100 minimum order', () => {
    expect(validateCartMinimum(createMockCart(99.99)).valid).toBe(false);
    expect(validateCartMinimum(createMockCart(100)).valid).toBe(true);
    expect(validateCartMinimum(createMockCart(100.01)).valid).toBe(true);
  });

  it('should calculate correct difference from minimum', () => {
    expect(validateCartMinimum(createMockCart(0)).difference).toBe(100);
    expect(validateCartMinimum(createMockCart(25)).difference).toBe(75);
    expect(validateCartMinimum(createMockCart(50)).difference).toBe(50);
    expect(validateCartMinimum(createMockCart(99)).difference).toBe(1);
    expect(validateCartMinimum(createMockCart(100)).difference).toBe(0);
    expect(validateCartMinimum(createMockCart(200)).difference).toBe(0);
  });
});
