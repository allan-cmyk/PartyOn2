'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, addDays } from 'date-fns';

interface DeliverySchedulerProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (date: Date, time: string, instructions: string, phone: string, address: string, zipCode: string, firstName: string, lastName: string, email: string) => void;
  subtotal?: number; // Made optional since we're not using Express Delivery anymore
  defaultAddress?: {
    address?: string;
    city?: string;
    province?: string;
    zip?: string;
    phone?: string;
  };
  customerInfo?: {
    firstName?: string;
    lastName?: string;
    email?: string;
  };
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

export default function DeliveryScheduler({ isOpen, onClose, onConfirm, defaultAddress, customerInfo }: DeliverySchedulerProps) {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState('');
  const [zipCode, setZipCode] = useState(defaultAddress?.zip || '');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState(defaultAddress?.phone || '');
  const [instructions, setInstructions] = useState('');
  const [firstName, setFirstName] = useState(customerInfo?.firstName || '');
  const [lastName, setLastName] = useState(customerInfo?.lastName || '');
  const [email, setEmail] = useState(customerInfo?.email || '');
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Build full address from defaultAddress when component mounts or defaultAddress changes
  React.useEffect(() => {
    if (defaultAddress && defaultAddress.address) {
      // Construct full address from parts
      const parts = [];
      if (defaultAddress.address) parts.push(defaultAddress.address);
      if (defaultAddress.city) parts.push(defaultAddress.city);
      if (defaultAddress.province) parts.push(defaultAddress.province);
      if (defaultAddress.zip && !parts.some(p => p?.includes(defaultAddress.zip!))) {
        parts.push(defaultAddress.zip);
      }
      setAddress(parts.filter(Boolean).join(', '));
      
      // Set zip and phone if available
      if (defaultAddress.zip) setZipCode(defaultAddress.zip);
      if (defaultAddress.phone) setPhone(defaultAddress.phone);
    }
  }, [defaultAddress]);
  // Express delivery removed - using standard delivery only
  // Note: Date filtering is now handled in the getAvailableTimeSlots function

  // Available time slots - 10am to 9pm, every 30 minutes for 1-hour delivery windows
  // Monday through Saturday only (handled in date selection)
  const timeSlots = [
    '10:00 AM - 11:00 AM',
    '10:30 AM - 11:30 AM',
    '11:00 AM - 12:00 PM',
    '11:30 AM - 12:30 PM',
    '12:00 PM - 1:00 PM',
    '12:30 PM - 1:30 PM',
    '1:00 PM - 2:00 PM',
    '1:30 PM - 2:30 PM',
    '2:00 PM - 3:00 PM',
    '2:30 PM - 3:30 PM',
    '3:00 PM - 4:00 PM',
    '3:30 PM - 4:30 PM',
    '4:00 PM - 5:00 PM',
    '4:30 PM - 5:30 PM',
    '5:00 PM - 6:00 PM',
    '5:30 PM - 6:30 PM',
    '6:00 PM - 7:00 PM',
    '6:30 PM - 7:30 PM',
    '7:00 PM - 8:00 PM',
    '7:30 PM - 8:30 PM',
    '8:00 PM - 9:00 PM'
  ];

  // Generate available dates (Monday-Saturday only, no Sundays)
  const availableDates = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Start of today

  for (let i = 0; i < 30; i++) {
    const date = addDays(today, i);
    const dayOfWeek = date.getDay(); // 0 = Sunday, 1 = Monday, etc.

    // Exclude Sundays (day 0)
    if (dayOfWeek !== 0) {
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

  // Get available time slots for a specific date
  const getAvailableTimeSlots = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selectedDay = new Date(date);
    selectedDay.setHours(0, 0, 0, 0);

    // If not today, return all time slots
    if (selectedDay.getTime() !== today.getTime()) {
      return timeSlots;
    }

    // For today, filter out slots that are within 3 hours
    const now = new Date();
    const threeHoursFromNow = new Date(now.getTime() + (3 * 60 * 60 * 1000));

    return timeSlots.filter(slot => {
      // Parse the start time from the slot (e.g., "10:00 AM - 11:00 AM" -> "10:00 AM")
      const startTime = slot.split(' - ')[0];

      // Create a date object for this time slot today
      const slotDate = new Date();
      const [time, period] = startTime.split(' ');
      const [hours, minutes] = time.split(':').map(Number);

      let hour24 = hours;
      if (period === 'PM' && hours !== 12) hour24 += 12;
      if (period === 'AM' && hours === 12) hour24 = 0;

      slotDate.setHours(hour24, minutes, 0, 0);

      // Return true if this slot is at least 3 hours from now
      return slotDate.getTime() >= threeHoursFromNow.getTime();
    });
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    const fieldRefs: Record<string, string> = {};

    if (!firstName.trim()) {
      newErrors.firstName = 'Please enter your first name';
      fieldRefs.firstName = 'customer-section';
    }
    if (!lastName.trim()) {
      newErrors.lastName = 'Please enter your last name';
      fieldRefs.lastName = 'customer-section';
    }
    if (!email.trim()) {
      newErrors.email = 'Please enter your email';
      fieldRefs.email = 'customer-section';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Please enter a valid email';
      fieldRefs.email = 'customer-section';
    }

    if (!selectedDate) {
      newErrors.date = 'Please select a delivery date';
      fieldRefs.date = 'date-section';
    }

    if (!selectedTime) {
      newErrors.time = 'Please select a delivery time';
      fieldRefs.time = 'time-section';
    }

    if (!address.trim()) {
      newErrors.address = 'Please enter your delivery address';
      fieldRefs.address = 'address-section';
    }

    if (!zipCode.trim()) {
      newErrors.zipCode = 'Please enter your ZIP code';
      fieldRefs.zipCode = 'address-section';
    }

    if (!phone.trim()) {
      newErrors.phone = 'Please enter your phone number';
      fieldRefs.phone = 'address-section';
    } else if (!/^[\d\s()+-]+$/.test(phone) || phone.replace(/\D/g, '').length < 10) {
      newErrors.phone = 'Please enter a valid phone number';
      fieldRefs.phone = 'address-section';
    } 
    // TESTING MODE: Accept all zip codes and no minimum order
    /* else {
      const zone = getDeliveryZone(zipCode);
      if (!zone) {
        newErrors.zipCode = 'Sorry, we do not deliver to this area';
      } else if (subtotal < zone.minimum) {
        newErrors.minimum = `Minimum order for ${zone.name} is $${zone.minimum}`;
      }
    } */

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleConfirm = () => {
    if (validateForm() && selectedDate) {
      onConfirm(selectedDate, selectedTime, instructions, phone, address, zipCode, firstName, lastName, email);
    } else {
      // Scroll to first error field
      const firstErrorField = Object.keys(errors)[0];
      if (firstErrorField === 'date') {
        document.getElementById('date-section')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } else if (firstErrorField === 'time') {
        document.getElementById('time-section')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } else if (firstErrorField === 'address' || firstErrorField === 'zipCode' || firstErrorField === 'phone') {
        document.getElementById('address-section')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } else if (firstErrorField === 'firstName' || firstErrorField === 'lastName' || firstErrorField === 'email') {
        document.getElementById('customer-section')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
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
            className="fixed inset-0 bg-black/50 z-[80]"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 z-[90] flex items-center justify-center p-4"
          >
            <div className="bg-white max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              {/* Header */}
              <div className="p-6 border-b border-gray-200">
                <h2 className="font-serif text-3xl text-gray-900 tracking-[0.1em]">
                  Schedule Delivery
                </h2>
              </div>

              {/* Content */}
              <div className="p-6 space-y-6">
                {/* Customer Info Section */}
                <div id="customer-section">
                  <h3 className="font-serif text-xl text-gray-900 mb-4 tracking-[0.1em]">
                    Customer Information
                  </h3>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-light text-gray-700 mb-2 tracking-[0.1em]">
                          FIRST NAME
                        </label>
                        <input
                          type="text"
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 focus:border-gold-600 focus:outline-none transition-colors"
                          placeholder="John"
                        />
                        {errors.firstName && (
                          <p className="text-red-600 text-sm mt-1">{errors.firstName}</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-light text-gray-700 mb-2 tracking-[0.1em]">
                          LAST NAME
                        </label>
                        <input
                          type="text"
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 focus:border-gold-600 focus:outline-none transition-colors"
                          placeholder="Doe"
                        />
                        {errors.lastName && (
                          <p className="text-red-600 text-sm mt-1">{errors.lastName}</p>
                        )}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-light text-gray-700 mb-2 tracking-[0.1em]">
                        EMAIL
                      </label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 focus:border-gold-600 focus:outline-none transition-colors"
                        placeholder="john@example.com"
                      />
                      {errors.email && (
                        <p className="text-red-600 text-sm mt-1">{errors.email}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Address Section */}
                <div id="address-section">
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
                    <div>
                      <label className="block text-sm font-light text-gray-700 mb-2 tracking-[0.1em]">
                        PHONE NUMBER
                      </label>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 focus:border-gold-600 focus:outline-none transition-colors"
                        placeholder="(512) 555-0123"
                      />
                      {errors.phone && (
                        <p className="text-red-600 text-sm mt-1">{errors.phone}</p>
                      )}
                    </div>
                  </div>
                </div>


                {/* Date Selection */}
                <div id="date-section">
                  <h3 className="font-serif text-xl text-gray-900 mb-4 tracking-[0.1em]">
                    Delivery Date
                  </h3>
                  <div className="grid grid-cols-7 gap-2">
                    {availableDates.slice(0, 14).map((date) => (
                      <button
                        key={date.toISOString()}
                        onClick={() => {
                          setSelectedDate(date);
                          setSelectedTime(''); // Clear selected time when date changes
                        }}
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
                <div id="time-section">
                  <h3 className="font-serif text-xl text-gray-900 mb-4 tracking-[0.1em]">
                    Delivery Time
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Available Monday-Saturday, 10:00 AM - 9:00 PM
                    {selectedDate && (
                      <>
                        <br />
                        {selectedDate.toDateString() === new Date().toDateString()
                          ? 'Same-day delivery available with 3-hour advance notice'
                          : 'All time slots available for future dates'
                        }
                      </>
                    )}
                  </p>
                  {selectedDate ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-80 overflow-y-auto">
                      {getAvailableTimeSlots(selectedDate).length > 0 ? (
                        getAvailableTimeSlots(selectedDate).map((slot) => (
                          <button
                            key={slot}
                            onClick={() => setSelectedTime(slot)}
                            className={`p-2 text-center border transition-colors ${
                              selectedTime === slot
                                ? 'border-gold-600 bg-gold-50'
                                : 'border-gray-300 hover:border-gold-400'
                            }`}
                          >
                            <span className="text-xs">{slot}</span>
                          </button>
                        ))
                      ) : (
                        <div className="col-span-full text-center py-8 text-gray-500">
                          No time slots available for today. Please select a future date.
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      Please select a delivery date first
                    </div>
                  )}
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
              <div className="p-6 border-t border-gray-200">
                {/* Error Summary */}
                {Object.keys(errors).length > 0 && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded">
                    <p className="text-sm font-medium text-red-800 mb-1">Please fix the following:</p>
                    <ul className="text-xs text-red-700 space-y-1">
                      {Object.entries(errors).map(([field, message]) => (
                        <li key={field}>• {message}</li>
                      ))}
                    </ul>
                  </div>
                )}
                <div className="flex justify-end space-x-4">
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
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}