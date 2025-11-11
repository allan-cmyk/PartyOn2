'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, addDays, isBefore, isAfter, startOfMonth, endOfMonth, eachDayOfInterval, getDay } from 'date-fns';

interface SimpleDeliverySchedulerProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (date: Date, time: string, instructions: string, address: string, zipCode: string, phone: string) => void;
}

export default function SimpleDeliveryScheduler({ isOpen, onClose, onConfirm }: SimpleDeliverySchedulerProps) {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState('');
  const [instructions, setInstructions] = useState('');
  const [address, setAddress] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [phone, setPhone] = useState('');
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Get minimum date (3 hours for same-day delivery)
  const now = new Date();
  const minDate = new Date(now.getTime() + (3 * 60 * 60 * 1000)); // 3 hours from now
  const maxDate = addDays(new Date(), 60);

  // Available time slots
  const timeSlots = [
    '10:00 AM - 11:00 AM', '10:30 AM - 11:30 AM',
    '11:00 AM - 12:00 PM', '11:30 AM - 12:30 PM',
    '12:00 PM - 1:00 PM', '12:30 PM - 1:30 PM',
    '1:00 PM - 2:00 PM', '1:30 PM - 2:30 PM',
    '2:00 PM - 3:00 PM', '2:30 PM - 3:30 PM',
    '3:00 PM - 4:00 PM', '3:30 PM - 4:30 PM',
    '4:00 PM - 5:00 PM', '4:30 PM - 5:30 PM',
    '5:00 PM - 6:00 PM', '5:30 PM - 6:30 PM',
    '6:00 PM - 7:00 PM', '6:30 PM - 7:30 PM',
    '7:00 PM - 8:00 PM', '7:30 PM - 8:30 PM',
    '8:00 PM - 9:00 PM'
  ];

  // Get all days in current month
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });
  
  // Get the first day of the week for the month (for calendar alignment)
  const startingDayOfWeek = getDay(monthStart);
  
  // Add empty cells for alignment
  const calendarDays = [
    ...Array(startingDayOfWeek).fill(null),
    ...monthDays
  ];

  const isDateAvailable = (date: Date | null) => {
    if (!date) return false;
    const dayOfWeek = date.getDay();
    // No Sundays (day 0)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const checkDate = new Date(date);
    checkDate.setHours(0, 0, 0, 0);

    return dayOfWeek !== 0 && checkDate.getTime() >= today.getTime() && !isAfter(date, maxDate);
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

    if (!selectedDate) {
      newErrors.date = 'Please select a delivery date';
    }
    if (!selectedTime) {
      newErrors.time = 'Please select a delivery time';
    }
    if (!address.trim()) {
      newErrors.address = 'Please enter a delivery address';
    }
    if (!zipCode.trim() || !/^\d{5}$/.test(zipCode)) {
      newErrors.zipCode = 'Please enter a valid 5-digit ZIP code';
    }
    if (!phone.trim() || !/^\d{10}$|^\d{3}-\d{3}-\d{4}$|^\(\d{3}\)\s?\d{3}-\d{4}$/.test(phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleConfirm = () => {
    if (validateForm() && selectedDate) {
      onConfirm(selectedDate, selectedTime, instructions, address, zipCode, phone);
    }
  };

  const previousMonth = () => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(newMonth.getMonth() - 1);
    if (!isBefore(newMonth, minDate)) {
      setCurrentMonth(newMonth);
    }
  };

  const nextMonth = () => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(newMonth.getMonth() + 1);
    if (!isAfter(newMonth, maxDate)) {
      setCurrentMonth(newMonth);
    }
  };

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
            <div className="bg-white max-w-3xl w-full max-h-[90vh] overflow-y-auto rounded-lg shadow-xl">
              {/* Header */}
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="font-serif text-2xl text-gray-900 tracking-[0.1em]">
                    Select Delivery Date and Time
                  </h2>
                  <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                {/* Calendar */}
                <div className="mb-6">
                  {/* Month Navigation */}
                  <div className="flex items-center justify-between mb-4">
                    <button
                      onClick={previousMonth}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                      disabled={isBefore(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1), minDate)}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    <h3 className="font-serif text-xl text-gray-900 tracking-[0.1em]">
                      {format(currentMonth, 'MMMM yyyy')}
                    </h3>
                    <button
                      onClick={nextMonth}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                      disabled={isAfter(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1), maxDate)}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>

                  {/* Day Headers */}
                  <div className="grid grid-cols-7 gap-1 mb-2">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                      <div key={day} className="text-center text-xs font-medium text-gray-600 py-2">
                        {day}
                      </div>
                    ))}
                  </div>

                  {/* Calendar Grid */}
                  <div className="grid grid-cols-7 gap-1">
                    {calendarDays.map((date, index) => {
                      const isAvailable = date && isDateAvailable(date);
                      const isSelected = date && selectedDate?.toDateString() === date.toDateString();
                      
                      return (
                        <div key={index} className="aspect-square">
                          {date ? (
                            <button
                              onClick={() => {
                                if (isAvailable) {
                                  setSelectedDate(date);
                                  setSelectedTime(''); // Clear selected time when date changes
                                }
                              }}
                              disabled={!isAvailable}
                              className={`w-full h-full flex items-center justify-center rounded-lg transition-colors ${
                                isSelected
                                  ? 'bg-gold-600 text-gray-900'
                                  : isAvailable
                                  ? 'hover:bg-gold-50 hover:border-gold-400 border border-gray-200'
                                  : 'text-gray-300 cursor-not-allowed'
                              }`}
                            >
                              <span className="text-sm">{format(date, 'd')}</span>
                            </button>
                          ) : (
                            <div className="w-full h-full" />
                          )}
                        </div>
                      );
                    })}
                  </div>
                  {errors.date && (
                    <p className="text-red-600 text-sm mt-2">{errors.date}</p>
                  )}
                </div>

                {/* Time Selection */}
                {selectedDate && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-6"
                  >
                    <h3 className="font-serif text-lg text-gray-900 mb-3 tracking-[0.1em]">
                      Select Delivery Time Frame:
                    </h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Available Monday-Saturday, 10:00 AM - 9:00 PM
                      <br />
                      {selectedDate.toDateString() === new Date().toDateString()
                        ? 'Same-day delivery available with 3-hour advance notice'
                        : 'All time slots available for future dates'
                      }
                    </p>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-64 overflow-y-auto">
                      {getAvailableTimeSlots(selectedDate).length > 0 ? (
                        getAvailableTimeSlots(selectedDate).map((slot) => (
                          <button
                            key={slot}
                            onClick={() => setSelectedTime(slot)}
                            className={`p-3 text-center border rounded-lg transition-colors ${
                              selectedTime === slot
                                ? 'border-gold-600 bg-gold-50 text-gold-900'
                                : 'border-gray-300 hover:border-gold-400'
                            }`}
                          >
                            <span className="text-sm">{slot}</span>
                          </button>
                        ))
                      ) : (
                        <div className="col-span-full text-center py-8 text-gray-500">
                          No time slots available for today. Please select a future date.
                        </div>
                      )}
                    </div>
                    {errors.time && (
                      <p className="text-red-600 text-sm mt-2">{errors.time}</p>
                    )}
                  </motion.div>
                )}

                {/* Delivery Address */}
                {selectedDate && selectedTime && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-6 space-y-4"
                  >
                    <div>
                      <label className="block text-sm font-light text-gray-700 mb-2 tracking-[0.1em]">
                        DELIVERY ADDRESS *
                      </label>
                      <input
                        type="text"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-gold-600 focus:outline-none transition-colors"
                        placeholder="123 Main St, Apt 4B"
                      />
                      {errors.address && (
                        <p className="text-red-600 text-sm mt-1">{errors.address}</p>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-light text-gray-700 mb-2 tracking-[0.1em]">
                          ZIP CODE *
                        </label>
                        <input
                          type="text"
                          value={zipCode}
                          onChange={(e) => setZipCode(e.target.value.replace(/\D/g, '').slice(0, 5))}
                          maxLength={5}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-gold-600 focus:outline-none transition-colors"
                          placeholder="78701"
                        />
                        {errors.zipCode && (
                          <p className="text-red-600 text-sm mt-1">{errors.zipCode}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-light text-gray-700 mb-2 tracking-[0.1em]">
                          PHONE *
                        </label>
                        <input
                          type="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-gold-600 focus:outline-none transition-colors"
                          placeholder="512-555-0123"
                        />
                        {errors.phone && (
                          <p className="text-red-600 text-sm mt-1">{errors.phone}</p>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Special Instructions */}
                {selectedDate && selectedTime && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-6"
                  >
                    <label className="block text-sm font-light text-gray-700 mb-2 tracking-[0.1em]">
                      DELIVERY INSTRUCTIONS (OPTIONAL)
                    </label>
                    <textarea
                      value={instructions}
                      onChange={(e) => setInstructions(e.target.value)}
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-gold-600 focus:outline-none transition-colors"
                      placeholder="Gate code, building entrance, special instructions..."
                    />
                  </motion.div>
                )}

                {/* Summary */}
                {selectedDate && selectedTime && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gold-50 border border-gold-200 rounded-lg p-4"
                  >
                    <p className="text-sm text-gray-700">
                      <span className="font-medium text-gray-900">Delivery scheduled for:</span><br />
                      <span className="text-base">{format(selectedDate, 'EEEE, MMMM d, yyyy')}</span><br />
                      <span className="text-base">{selectedTime}</span>
                    </p>
                  </motion.div>
                )}
              </div>

              {/* Footer */}
              <div className="p-6 border-t border-gray-200">
                <div className="flex justify-between items-center">
                  <button
                    onClick={onClose}
                    className="px-6 py-3 text-gray-700 hover:text-gray-900 transition-colors tracking-[0.1em] text-sm"
                  >
                    Continue Shopping
                  </button>
                  <button
                    onClick={handleConfirm}
                    disabled={!selectedDate || !selectedTime || !address || !zipCode || !phone}
                    className={`px-8 py-3 rounded-lg tracking-[0.1em] text-sm font-medium transition-colors ${
                      selectedDate && selectedTime && address && zipCode && phone
                        ? 'bg-gold-600 text-gray-900 hover:bg-gold-700'
                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    CHECKOUT
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