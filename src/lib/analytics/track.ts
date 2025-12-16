import { track } from '@vercel/analytics';

/**
 * Analytics Event Names - Centralized constants for consistency
 * These events will appear in Vercel Analytics dashboard
 */
export const ANALYTICS_EVENTS = {
  // Page Engagement - Service Pages
  VIEW_WEDDINGS: 'view_weddings',
  VIEW_BOAT_PARTIES: 'view_boat_parties',
  VIEW_BACH_PARTIES: 'view_bach_parties',
  VIEW_CORPORATE: 'view_corporate',
  VIEW_CORPORATE_HOLIDAY: 'view_corporate_holiday',
  VIEW_ABOUT: 'view_about',
  VIEW_CONTACT: 'view_contact',
  VIEW_DELIVERY_AREAS: 'view_delivery_areas',
  VIEW_PARTNERS: 'view_partners',
  VIEW_CUSTOM_PACKAGE: 'view_custom_package',

  // Product Engagement
  PRODUCT_PAGE_VIEW: 'product_page_view',

  // Conversion Funnel - Cart Actions
  ADD_TO_CART: 'add_to_cart',
  REMOVE_FROM_CART: 'remove_from_cart',
  UPDATE_CART_QUANTITY: 'update_cart_quantity',
  OPEN_CART: 'open_cart',

  // Conversion Funnel - Checkout
  SET_DELIVERY_DETAILS: 'set_delivery_details',
  BEGIN_CHECKOUT: 'begin_checkout',
  PURCHASE: 'purchase',

  // Lead Generation
  FORM_SUBMIT: 'form_submit',
  CONTACT_CLICK: 'contact_click',

  // Group Orders
  CREATE_GROUP_ORDER: 'create_group_order',
  JOIN_GROUP_ORDER: 'join_group_order',
  LOCK_GROUP_ORDER: 'lock_group_order',
} as const;

export type AnalyticsEventName = typeof ANALYTICS_EVENTS[keyof typeof ANALYTICS_EVENTS];

/**
 * Properties that can be passed with events
 * Vercel Analytics supports strings, numbers, booleans, and null
 * Max 255 characters per key/value
 */
export type EventProperties = Record<string, string | number | boolean | null>;

/**
 * Track a custom event in Vercel Analytics
 *
 * @param eventName - The name of the event (use ANALYTICS_EVENTS constants)
 * @param properties - Optional key-value pairs for event data
 *
 * @example
 * trackEvent(ANALYTICS_EVENTS.ADD_TO_CART, {
 *   product_id: 'gid://shopify/Product/123',
 *   product_name: 'Margarita Kit',
 *   price: 49.99,
 *   quantity: 1
 * });
 */
export function trackEvent(
  eventName: AnalyticsEventName | string,
  properties?: EventProperties
): void {
  try {
    if (properties) {
      track(eventName, properties);
    } else {
      track(eventName);
    }
  } catch (error) {
    // Silently fail in production, log in development
    if (process.env.NODE_ENV === 'development') {
      console.warn('[Analytics] Failed to track event:', eventName, error);
    }
  }
}

/**
 * Track a page view for a service page
 * Use this in useEffect hooks on service/landing pages
 *
 * @param eventName - The service page event name
 * @param pagePath - The URL path (e.g., '/weddings')
 * @param pageTitle - Human-readable page title
 */
export function trackPageView(
  eventName: AnalyticsEventName,
  pagePath: string,
  pageTitle: string
): void {
  trackEvent(eventName, {
    page_path: pagePath,
    page_title: pageTitle
  });
}

/**
 * Track a product view event
 *
 * @param productId - Shopify product ID
 * @param productName - Product title
 * @param price - Product price as number
 * @param category - Product type/category
 */
export function trackProductView(
  productId: string,
  productName: string,
  price: number,
  category?: string
): void {
  trackEvent(ANALYTICS_EVENTS.PRODUCT_PAGE_VIEW, {
    product_id: productId,
    product_name: productName.slice(0, 255), // Ensure under 255 char limit
    product_price: price,
    product_category: category || 'unknown'
  });
}

/**
 * Track a cart action (add, remove, update)
 *
 * @param action - The cart action type
 * @param productId - Shopify product ID
 * @param productName - Product title
 * @param price - Product price
 * @param quantity - Quantity added/removed/updated to
 */
export function trackCartAction(
  action: 'add' | 'remove' | 'update',
  productId: string,
  productName: string,
  price: number,
  quantity: number
): void {
  const eventMap = {
    add: ANALYTICS_EVENTS.ADD_TO_CART,
    remove: ANALYTICS_EVENTS.REMOVE_FROM_CART,
    update: ANALYTICS_EVENTS.UPDATE_CART_QUANTITY
  };

  trackEvent(eventMap[action], {
    product_id: productId,
    product_name: productName.slice(0, 255),
    price,
    quantity
  });
}

/**
 * Track checkout initiation
 *
 * @param cartTotal - Total cart value
 * @param itemCount - Number of items in cart
 */
export function trackBeginCheckout(cartTotal: number, itemCount: number): void {
  trackEvent(ANALYTICS_EVENTS.BEGIN_CHECKOUT, {
    cart_total: cartTotal,
    item_count: itemCount,
    currency: 'USD'
  });
}

/**
 * Track successful purchase
 *
 * @param orderId - Shopify order ID/name
 * @param orderTotal - Total order value
 */
export function trackPurchase(orderId: string, orderTotal: number): void {
  trackEvent(ANALYTICS_EVENTS.PURCHASE, {
    order_id: orderId,
    order_total: orderTotal,
    currency: 'USD'
  });
}

/**
 * Track form submission
 *
 * @param formName - Identifier for the form
 * @param formLocation - Where the form is located (page path or component)
 */
export function trackFormSubmit(formName: string, formLocation: string): void {
  trackEvent(ANALYTICS_EVENTS.FORM_SUBMIT, {
    form_name: formName,
    form_location: formLocation
  });
}
