/**
 * Affiliate-specific dashboard presets.
 * Keyed by affiliate code for extensibility.
 */

export interface TabPresetOption {
  id: string;
  label: string;
  defaultAddress?: string;
  deliveryContextType?: 'HOUSE' | 'BOAT' | 'VENUE' | 'HOTEL' | 'OTHER';
  isCustom?: boolean;
}

export interface PartyTypeOption {
  value: 'BACH' | 'BOAT';
  label: string;
  titleFormat: string; // e.g. "{name} Bach Drink Delivery!"
}

export interface AffiliatePresetConfig {
  partyTypes: PartyTypeOption[];
  tabPresets: TabPresetOption[];
  defaultDeliveryTime: string;
}

const PREMIER_ADDRESS = '13993 FM 2769, Leander TX 78641';

const PREMIER_PRESETS: AffiliatePresetConfig = {
  partyTypes: [
    {
      value: 'BACH',
      label: 'Bach',
      titleFormat: '{name} Bach Drink Delivery!',
    },
    {
      value: 'BOAT',
      label: 'Private Cruise',
      titleFormat: '{name} Drink Delivery!',
    },
  ],
  tabPresets: [
    {
      id: 'atx-disco',
      label: 'ATX Disco Cruise Drink Delivery!',
      defaultAddress: PREMIER_ADDRESS,
      deliveryContextType: 'BOAT',
    },
    {
      id: 'party-cruise',
      label: 'Party Cruise Drink Delivery!',
      defaultAddress: PREMIER_ADDRESS,
      deliveryContextType: 'BOAT',
    },
    {
      id: 'stock-the-house',
      label: 'Stock the House - Bnb Delivery',
      deliveryContextType: 'HOUSE',
    },
    {
      id: 'custom',
      label: 'Custom',
      isCustom: true,
    },
  ],
  defaultDeliveryTime: '12:00 PM - 2:00 PM',
};

const PRESET_REGISTRY: Record<string, AffiliatePresetConfig> = {
  PREMIER: PREMIER_PRESETS,
};

export function getAffiliatePresets(affiliateCode: string): AffiliatePresetConfig | null {
  return PRESET_REGISTRY[affiliateCode] || null;
}
