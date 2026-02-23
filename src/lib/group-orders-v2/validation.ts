/**
 * Group Orders V2 - Zod Validation Schemas
 */

import { z } from 'zod';
import { isInDeliveryArea } from '@/lib/delivery/rates';

/** Delivery address schema */
const DeliveryAddressSchema = z.object({
  address1: z.string().min(1, 'Street address is required'),
  address2: z.string().optional(),
  city: z.string().min(1, 'City is required'),
  province: z.string().default('TX'),
  zip: z.string().min(5, 'Zip code is required').max(10).refine(
    (zip) => isInDeliveryArea(zip),
    'Zip code is outside our delivery area'
  ),
  country: z.string().default('US'),
});

/** Single tab input */
const CreateTabSchema = z.object({
  name: z.string().min(1, 'Tab name is required').max(100),
  orderType: z.enum(['boat', 'house', 'bus', 'other']).optional(),
  deliveryDate: z.string().refine(
    (val) => {
      const date = new Date(val);
      return !isNaN(date.getTime());
    },
    'Invalid delivery date'
  ).refine(
    (val) => {
      const raw = val.includes('T') ? val : `${val}T12:00:00`;
      const date = new Date(raw);
      const now = new Date();
      now.setHours(0, 0, 0, 0);
      return date >= now;
    },
    'Delivery date cannot be in the past'
  ).refine(
    (val) => {
      const raw = val.includes('T') ? val : `${val}T12:00:00`;
      const date = new Date(raw);
      return date.getDay() !== 0;
    },
    'Sunday deliveries are not available'
  ),
  deliveryTime: z.string().min(1, 'Delivery time is required'),
  deliveryAddress: DeliveryAddressSchema,
  deliveryPhone: z.string().optional(),
  deliveryNotes: z.string().max(500).optional(),
});

/** Create group order */
export const CreateGroupOrderV2Schema = z.object({
  name: z.string().min(1, 'Group name is required').max(200),
  hostName: z.string().min(1, 'Host name is required').max(100),
  hostEmail: z.string().email('Invalid email').optional().or(z.literal('')),
  hostPhone: z.string().optional(),
  hostCustomerId: z.string().optional(),
  tabs: z.array(CreateTabSchema).min(1, 'At least one tab is required').max(10),
});

/** Update tab */
export const UpdateTabSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  orderType: z.enum(['boat', 'house', 'bus', 'other']).optional(),
  status: z.enum(['OPEN', 'LOCKED']).optional(),
  deliveryDate: z.string().refine(
    (val) => {
      const date = new Date(val);
      return !isNaN(date.getTime());
    },
    'Invalid delivery date'
  ).refine(
    (val) => {
      const raw = val.includes('T') ? val : `${val}T12:00:00`;
      const date = new Date(raw);
      const now = new Date();
      now.setHours(0, 0, 0, 0);
      return date >= now;
    },
    'Delivery date cannot be in the past'
  ).refine(
    (val) => {
      const raw = val.includes('T') ? val : `${val}T12:00:00`;
      const date = new Date(raw);
      return date.getDay() !== 0;
    },
    'Sunday deliveries are not available'
  ).optional(),
  deliveryTime: z.string().optional(),
  deliveryAddress: DeliveryAddressSchema.optional(),
  deliveryPhone: z.string().optional(),
  deliveryNotes: z.string().max(500).optional(),
  deliveryContextType: z.enum(['HOUSE', 'BOAT', 'VENUE', 'HOTEL', 'OTHER']).optional(),
});

/** Join group order */
export const JoinGroupOrderSchema = z.object({
  guestName: z.string().min(1, 'Name is required').max(100),
  guestEmail: z.string().email('Valid email is required'),
  ageVerified: z.boolean().refine((val) => val === true, {
    message: 'Age verification is required',
  }),
  customerId: z.string().optional(),
});

/** Add draft item */
export const AddDraftItemSchema = z.object({
  participantId: z.string().min(1),
  productId: z.string().min(1),
  variantId: z.string().min(1),
  title: z.string().min(1),
  variantTitle: z.string().optional(),
  price: z.number().positive('Price must be positive'),
  imageUrl: z.string().url().optional().or(z.literal('')),
  quantity: z.number().int().min(1).max(99),
});

/** Update draft item quantity */
export const UpdateDraftItemSchema = z.object({
  quantity: z.number().int().min(1).max(99),
});

/** Update group order status */
export const UpdateGroupOrderSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  status: z.enum(['ACTIVE', 'CLOSED', 'COMPLETED', 'CANCELLED']).optional(),
  partyType: z.enum(['BACHELOR', 'BACHELORETTE', 'WEDDING', 'CORPORATE', 'HOUSE_PARTY', 'OTHER', 'BOAT', 'BACH']).optional().nullable(),
  hostEmail: z.string().email('Invalid email').optional().or(z.literal('')),
  hostPhone: z.string().max(20).optional().or(z.literal('')),
});

/** Create dashboard order (relaxed - no delivery details required) */
export const CreateDashboardSchema = z.object({
  hostName: z.string().min(1, 'Name is required').max(100),
  hostEmail: z.string().email('Invalid email').optional().or(z.literal('')),
  hostPhone: z.string().optional(),
  hostCustomerId: z.string().optional(),
  name: z.string().max(200).optional(),
  partyType: z.enum(['BACHELOR', 'BACHELORETTE', 'WEDDING', 'CORPORATE', 'HOUSE_PARTY', 'OTHER', 'BOAT', 'BACH']).optional(),
  source: z.enum(['DIRECT', 'PARTNER_PAGE', 'INTERNAL']).optional(),
  affiliateId: z.string().optional(),
  deliveryContextType: z.enum(['HOUSE', 'BOAT', 'VENUE', 'HOTEL', 'OTHER']).optional(),
});

export {
  CreateTabSchema,
  DeliveryAddressSchema,
};
