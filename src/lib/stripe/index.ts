/**
 * Stripe Integration Module
 * Exports all Stripe-related functionality
 */

// Client
export { stripe, getStripe, STRIPE_PUBLISHABLE_KEY, STRIPE_WEBHOOK_SECRET } from './client';

// Checkout
export {
  createCheckoutSession,
  getCheckoutSession,
  expireCheckoutSession,
  getOrCreateStripeCustomer,
} from './checkout';
export type { CheckoutMetadata, CheckoutLineItem, CreateCheckoutOptions } from './checkout';

// Webhooks
export {
  constructWebhookEvent,
  processWebhookEvent,
  WEBHOOK_EVENTS,
} from './webhooks';

// Group Order Payments
export {
  createParticipantCheckoutSession,
  handleGroupPaymentCompleted,
  handleGroupPaymentFailed,
  handleGroupPaymentExpired,
  getGroupPaymentSummary,
  refundParticipantPayment,
  cancelAllGroupPayments,
  processHostDecision,
  checkPaymentDeadlines,
  calculateDeliveryContribution,
  calculateParticipantTax,
} from './group-payments';
export type {
  GroupPaymentMetadata,
  ParticipantCartItem,
  CreateParticipantCheckoutOptions,
  GroupPaymentSummary,
} from './group-payments';

// Group Orders V2 Payments
export {
  createGroupV2CheckoutSession,
  createDeliveryInvoiceSession,
  handleGroupV2PaymentCompleted,
  handleGroupV2DeliveryPayment,
} from './group-v2-payments';
