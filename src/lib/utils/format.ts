/** Formatting utilities */

export function formatPrice(amount: string, currencyCode: string = 'USD'): string {
  const numericAmount = parseFloat(amount);
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currencyCode,
  }).format(numericAmount);
}
