/** Delivery utility functions */

export function getEarliestDeliveryDate(): Date {
  const date = new Date();
  date.setHours(date.getHours() + 72);
  return date;
}

export function formatDeliveryDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
}

export function isValidDeliveryArea(zipCode: string): boolean {
  const austinZipCodes = [
    '78701', '78702', '78703', '78704', '78705',
    '78712', '78721', '78722', '78723', '78724',
    '78725', '78726', '78727', '78728', '78729',
    '78730', '78731', '78732', '78733', '78734',
    '78735', '78736', '78737', '78738', '78739',
    '78741', '78742', '78744', '78745', '78746',
    '78747', '78748', '78749', '78750', '78751',
    '78752', '78753', '78754', '78756', '78757',
    '78758', '78759',
  ];
  return austinZipCodes.includes(zipCode);
}

export function getOrderMinimum(zipCode: string): number {
  const premiumZipCodes = ['78746', '78733', '78738', '78732'];
  if (premiumZipCodes.includes(zipCode)) {
    return 150;
  }
  return 100;
}
