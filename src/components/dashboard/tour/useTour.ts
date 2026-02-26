'use client';

import { useContext } from 'react';
import { TourContext } from './OnboardingTourProvider';

export default function useTour() {
  return useContext(TourContext);
}
