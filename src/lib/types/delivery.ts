/** Delivery and verification types */

export interface DeliveryWindow {
  date: string;
  timeSlots: Array<{
    start: string;
    end: string;
    available: boolean;
  }>;
}

export interface AgeVerification {
  verified: boolean;
  verifiedAt?: Date;
  idType?: string;
  idNumber?: string;
}
