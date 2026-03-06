/**
 * Email Module
 * Centralized email functionality for Party On Delivery
 */

// Client and utilities
export { sendEmail, resend, formatCurrency, formatDate, formatTime } from './resend-client';

// Email service functions
export {
  sendOrderConfirmationEmail,
  sendDeliveryEnRouteEmail,
  sendDeliveryCompletedEmail,
  sendPaymentFailedEmail,
  sendRefundProcessedEmail,
  sendOrderCancellationEmail,
} from './email-service';

// Template types
export type { OrderConfirmationData } from './templates/order-confirmation';
export type { DeliveryUpdateData } from './templates/delivery-update';
export type { InvoiceEmailData } from './templates/invoice';
export type { OrderCancellationData } from './templates/order-cancellation';

// Template generators
export { generateInvoiceEmail, generateInvoiceSubject } from './templates/invoice';
