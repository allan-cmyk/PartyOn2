/**
 * @fileoverview Inline delivery date and time picker for checkout
 * @module components/checkout/DeliveryDateTimePicker
 *
 * Simple inline component that handles ONLY date/time selection.
 * Customer info and address are handled by the checkout form.
 */

'use client';

import { useState, type ReactElement } from 'react';
import { format, addDays } from 'date-fns';

interface DeliveryDateTimePickerProps {
  /** Currently selected delivery date */
  selectedDate: Date | null;
  /** Currently selected time slot */
  selectedTime: string;
  /** Special delivery instructions */
  instructions: string;
  /** Callback when date changes */
  onDateChange: (date: Date) => void;
  /** Callback when time changes */
  onTimeChange: (time: string) => void;
  /** Callback when instructions change */
  onInstructionsChange: (instructions: string) => void;
}

/** Available time slots - 10am to 9pm, every 30 minutes */
const TIME_SLOTS = [
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

/**
 * Generate available dates for the next 14 days (Mon-Sat only)
 */
function getAvailableDates(): Date[] {
  const dates: Date[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = 0; i < 30 && dates.length < 14; i++) {
    const date = addDays(today, i);
    const dayOfWeek = date.getDay(); // 0 = Sunday

    // Exclude Sundays
    if (dayOfWeek !== 0) {
      dates.push(date);
    }
  }

  return dates;
}

/**
 * Get available time slots for a specific date
 * For today, filters out slots within 3 hours
 */
function getAvailableTimeSlots(date: Date): string[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const selectedDay = new Date(date);
  selectedDay.setHours(0, 0, 0, 0);

  // If not today, return all time slots
  if (selectedDay.getTime() !== today.getTime()) {
    return TIME_SLOTS;
  }

  // For today, filter out slots within 3 hours
  const now = new Date();
  const threeHoursFromNow = new Date(now.getTime() + 3 * 60 * 60 * 1000);

  return TIME_SLOTS.filter(slot => {
    const startTime = slot.split(' - ')[0];
    const [time, period] = startTime.split(' ');
    const [hours, minutes] = time.split(':').map(Number);

    let hour24 = hours;
    if (period === 'PM' && hours !== 12) hour24 += 12;
    if (period === 'AM' && hours === 12) hour24 = 0;

    const slotDate = new Date();
    slotDate.setHours(hour24, minutes, 0, 0);

    return slotDate.getTime() >= threeHoursFromNow.getTime();
  });
}

/**
 * Inline delivery date and time picker
 *
 * Shows a calendar grid for date selection and time slot buttons.
 * Does NOT collect customer info or address (handled by checkout form).
 */
export default function DeliveryDateTimePicker({
  selectedDate,
  selectedTime,
  instructions,
  onDateChange,
  onTimeChange,
  onInstructionsChange,
}: DeliveryDateTimePickerProps): ReactElement {
  const [showTimeSlots, setShowTimeSlots] = useState(!!selectedDate);
  const availableDates = getAvailableDates();

  const handleDateSelect = (date: Date) => {
    onDateChange(date);
    onTimeChange(''); // Clear time when date changes
    setShowTimeSlots(true);
  };

  const availableSlots = selectedDate ? getAvailableTimeSlots(selectedDate) : [];

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
        <h3 className="font-serif text-xl text-gray-900 tracking-[0.1em]">
          Delivery Schedule
        </h3>
        <p className="text-sm text-gray-600 mt-1">
          Available Monday - Saturday, 10AM - 9PM
        </p>
      </div>

      <div className="p-6 space-y-6">
        {/* Date Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3 tracking-[0.1em]">
            SELECT DATE
          </label>
          <div className="grid grid-cols-7 gap-2">
            {availableDates.map((date) => {
              const isSelected = selectedDate?.toDateString() === date.toDateString();
              return (
                <button
                  key={date.toISOString()}
                  type="button"
                  onClick={() => handleDateSelect(date)}
                  className={`p-3 text-center border transition-all rounded ${
                    isSelected
                      ? 'border-gold-600 bg-gold-50 ring-1 ring-gold-600'
                      : 'border-gray-200 hover:border-gold-400 hover:bg-gray-50'
                  }`}
                >
                  <div className="text-xs text-gray-500 uppercase">
                    {format(date, 'EEE')}
                  </div>
                  <div className={`text-lg font-medium ${isSelected ? 'text-gold-700' : 'text-gray-900'}`}>
                    {format(date, 'd')}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Time Selection */}
        {showTimeSlots && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3 tracking-[0.1em]">
              SELECT TIME
            </label>
            {selectedDate ? (
              availableSlots.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                  {availableSlots.map((slot) => {
                    const isSelected = selectedTime === slot;
                    return (
                      <button
                        key={slot}
                        type="button"
                        onClick={() => onTimeChange(slot)}
                        className={`px-3 py-2 text-sm border transition-all rounded ${
                          isSelected
                            ? 'border-gold-600 bg-gold-50 text-gold-700 ring-1 ring-gold-600'
                            : 'border-gray-200 hover:border-gold-400 text-gray-700'
                        }`}
                      >
                        {slot}
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-6 text-gray-500 bg-gray-50 rounded">
                  No time slots available for today. Please select a future date.
                </div>
              )
            ) : (
              <div className="text-center py-6 text-gray-500 bg-gray-50 rounded">
                Please select a delivery date first
              </div>
            )}
          </div>
        )}

        {/* Special Instructions */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2 tracking-[0.1em]">
            DELIVERY INSTRUCTIONS <span className="font-normal text-gray-500">(optional)</span>
          </label>
          <textarea
            value={instructions}
            onChange={(e) => onInstructionsChange(e.target.value)}
            rows={2}
            className="w-full px-4 py-3 border border-gray-200 rounded focus:border-gold-600 focus:ring-1 focus:ring-gold-600 focus:outline-none transition-colors text-sm"
            placeholder="Gate code, building entrance, special instructions..."
          />
        </div>

        {/* Selected Summary */}
        {selectedDate && selectedTime && (
          <div className="bg-green-50 border border-green-200 rounded p-4">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-green-800 font-medium">Delivery scheduled</span>
            </div>
            <p className="text-sm text-green-700 mt-1">
              {format(selectedDate, 'EEEE, MMMM d, yyyy')} &bull; {selectedTime}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
