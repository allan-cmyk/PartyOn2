'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, addDays, isBefore, isAfter } from 'date-fns';

interface DeliverySchedulerProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (date: Date, time: string, instructions: string) => void;
  subtotal: number;
}

const DELIVERY_ZONES = {
  central: {
    name: 'Central Austin',
    minimum: 100,
    fee: 15,
    zips: ['78701', '78702', '78703', '78704', '78705']
  },
  outer: {
    name: 'Greater Austin',
    minimum: 150,
    fee: 25,
    zips: ['78717', '78726', '78731', '78732', '78733', '78734', '78735', '78736', '78737', '78738', '78739', '78741', '78742', '78744', '78745', '78746', '78747', '78748', '78749', '78750', '78751', '78752', '78753', '78754', '78756', '78757', '78758', '78759']
  },
  lake: {
    name: 'Lake Travis Area',
    minimum: 150,
    fee: 35,
    zips: ['78620', '78645', '78669', '78730', '78732', '78734', '78738']
  }
};

export default function DeliveryScheduler({ isOpen, onClose, onConfirm, subtotal }: DeliverySchedulerProps) {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [address, setAddress] = useState('');
  const [instructions, setInstructions] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Get minimum date (72 hours from now)
  const minDate = addDays(new Date(), 3);
  const maxDate = addDays(new Date(), 30);

  // Available time slots
  const timeSlots = [
    '10:00 AM - 12:00 PM',
    '12:00 PM - 2:00 PM',
    '2:00 PM - 4:00 PM',
    '4:00 PM - 6:00 PM',
    '6:00 PM - 8:00 PM',
    '8:00 PM - 10:00 PM',
    '10:00 PM - 11:00 PM'
  ];

  // Generate available dates
  const availableDates = [];
  for (let i = 0; i < 30; i++) {
    const date = addDays(minDate, i);
    if (!isBefore(date, minDate) && !isAfter(date, maxDate)) {
      availableDates.push(date);
    }
  }

  const getDeliveryZone = (zip: string) => {
    for (const [, zone] of Object.entries(DELIVERY_ZONES)) {
      if (zone.zips.includes(zip)) {
        return zone;
      }
    }
    return null;
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!selectedDate) {
      newErrors.date = 'Please select a delivery date';
    }

    if (!selectedTime) {
      newErrors.time = 'Please select a delivery time';
    }

    if (!address.trim()) {
      newErrors.address = 'Please enter your delivery address';
    }

    if (!zipCode.trim()) {
      newErrors.zipCode = 'Please enter your ZIP code';
    } else {
      const zone = getDeliveryZone(zipCode);
      if (!zone) {
        newErrors.zipCode = 'Sorry, we do not deliver to this area';
      } else if (subtotal < zone.minimum) {
        newErrors.minimum = `Minimum order for ${zone.name} is $${zone.minimum}`;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleConfirm = () => {
    if (validateForm() && selectedDate) {
      onConfirm(selectedDate, selectedTime, instructions);
    }
  };

  const zone = zipCode ? getDeliveryZone(zipCode) : null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="bg-white max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              {/* Header */}
              <div className="p-6 border-b border-gray-200">
                <h2 className="font-serif text-3xl text-gray-900 tracking-[0.1em]">
                  Schedule Delivery
                </h2>
                <p className="text-gray-600 mt-2">
                  All deliveries require 72-hour advance notice
                </p>
              </div>

              {/* Content */}
              <div className="p-6 space-y-6">
                {/* Address Section */}
                <div>
                  <h3 className="font-serif text-xl text-gray-900 mb-4 tracking-[0.1em]">
                    Delivery Address
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-light text-gray-700 mb-2 tracking-[0.1em]">
                        STREET ADDRESS
                      </label>
                      <input
                        type="text"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 focus:border-gold-600 focus:outline-none transition-colors"
                        placeholder="123 Main Street"
                      />
                      {errors.address && (
                        <p className="text-red-600 text-sm mt-1">{errors.address}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-light text-gray-700 mb-2 tracking-[0.1em]">
                        ZIP CODE
                      </label>
                      <input
                        type="text"
                        value={zipCode}
                        onChange={(e) => setZipCode(e.target.value)}
                        maxLength={5}
                        className="w-full px-4 py-3 border border-gray-300 focus:border-gold-600 focus:outline-none transition-colors"
                        placeholder="78701"
                      />
                      {errors.zipCode && (
                        <p className="text-red-600 text-sm mt-1">{errors.zipCode}</p>
                      )}
                      {zone && (
                        <p className="text-green-600 text-sm mt-1">
                          ✓ {zone.name} - ${zone.fee} delivery fee
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Date Selection */}
                <div>
                  <h3 className="font-serif text-xl text-gray-900 mb-4 tracking-[0.1em]">
                    Delivery Date
                  </h3>
                  <div className="grid grid-cols-7 gap-2">
                    {availableDates.slice(0, 14).map((date) => (
                      <button
                        key={date.toISOString()}
                        onClick={() => setSelectedDate(date)}
                        className={`p-3 text-center border transition-colors ${
                          selectedDate?.toDateString() === date.toDateString()
                            ? 'border-gold-600 bg-gold-50'
                            : 'border-gray-300 hover:border-gold-400'
                        }`}
                      >
                        <div className="text-xs text-gray-600">
                          {format(date, 'EEE')}
                        </div>
                        <div className="font-medium">
                          {format(date, 'd')}
                        </div>
                      </button>
                    ))}
                  </div>
                  {errors.date && (
                    <p className="text-red-600 text-sm mt-2">{errors.date}</p>
                  )}
                </div>

                {/* Time Selection */}
                <div>
                  <h3 className="font-serif text-xl text-gray-900 mb-4 tracking-[0.1em]">
                    Delivery Time
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {timeSlots.map((slot) => (
                      <button
                        key={slot}
                        onClick={() => setSelectedTime(slot)}
                        className={`p-3 text-center border transition-colors ${
                          selectedTime === slot
                            ? 'border-gold-600 bg-gold-50'
                            : 'border-gray-300 hover:border-gold-400'
                        }`}
                      >
                        <span className="text-sm">{slot}</span>
                      </button>
                    ))}
                  </div>
                  {errors.time && (
                    <p className="text-red-600 text-sm mt-2">{errors.time}</p>
                  )}
                </div>

                {/* Special Instructions */}
                <div>
                  <label className="block text-sm font-light text-gray-700 mb-2 tracking-[0.1em]">
                    DELIVERY INSTRUCTIONS (OPTIONAL)
                  </label>
                  <textarea
                    value={instructions}
                    onChange={(e) => setInstructions(e.target.value)}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 focus:border-gold-600 focus:outline-none transition-colors"
                    placeholder="Gate code, building entrance, special instructions..."
                  />
                </div>

                {/* Minimum Order Error */}
                {errors.minimum && (
                  <div className="bg-red-50 border border-red-200 p-4">
                    <p className="text-red-600">{errors.minimum}</p>
                  </div>
                )}

                {/* Summary */}
                {selectedDate && selectedTime && zone && (
                  <div className="bg-gray-50 p-4">
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Delivery scheduled for:</span><br />
                      {format(selectedDate, 'EEEE, MMMM d, yyyy')}<br />
                      {selectedTime}
                    </p>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="p-6 border-t border-gray-200 flex justify-end space-x-4">
                <button
                  onClick={onClose}
                  className="px-6 py-3 border border-gray-300 text-gray-700 hover:border-gray-400 transition-colors tracking-[0.1em] text-sm"
                >
                  CANCEL
                </button>
                <button
                  onClick={handleConfirm}
                  className="px-6 py-3 bg-gold-600 text-white hover:bg-gold-700 transition-colors tracking-[0.1em] text-sm"
                >
                  CONFIRM DELIVERY
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}