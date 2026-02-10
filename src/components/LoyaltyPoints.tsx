'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface LoyaltyPointsProps {
  points: number;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
  lifetimeSpent: number;
  nextTierProgress?: number;
}

const TIER_BENEFITS = {
  bronze: {
    name: 'Bronze Member',
    color: 'text-amber-700',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
    benefits: ['Earn 1 point per $1 spent', 'Birthday bonus points'],
    nextTier: 'Silver',
    nextTierSpend: 500
  },
  silver: {
    name: 'Silver Member', 
    color: 'text-gray-600',
    bgColor: 'bg-gray-50',
    borderColor: 'border-gray-200',
    benefits: ['Earn 1.5 points per $1 spent', '5% discount on all orders', 'Early access to new products', 'Birthday bonus points'],
    nextTier: 'Gold',
    nextTierSpend: 2000
  },
  gold: {
    name: 'Gold Member',
    color: 'text-brand-yellow',
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200',
    benefits: ['Earn 2 points per $1 spent', '10% discount on all orders', 'Free delivery on orders over $100', 'Priority customer service', 'Birthday surprise'],
    nextTier: 'Platinum',
    nextTierSpend: 5000
  },
  platinum: {
    name: 'Platinum Elite',
    color: 'text-purple-700',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
    benefits: ['Earn 3 points per $1 spent', '15% discount on all orders', 'Free delivery on all orders', 'Exclusive access to limited editions', 'VIP event invitations', 'Personal account manager'],
    nextTier: null,
    nextTierSpend: null
  }
};

export default function LoyaltyPoints({ points, tier, lifetimeSpent }: LoyaltyPointsProps) {
  const tierInfo = TIER_BENEFITS[tier];
  const pointsToRedeem = Math.floor(points / 100) * 100; // Redeemable in increments of 100
  const redeemValue = pointsToRedeem / 10; // 100 points = $10

  return (
    <div className="space-y-6">
      {/* Current Status */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`p-6 border rounded-lg ${tierInfo.bgColor} ${tierInfo.borderColor}`}
      >
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className={`font-cormorant text-2xl ${tierInfo.color}`}>{tierInfo.name}</h3>
            <p className="text-sm text-gray-600 mt-1">Member since {new Date().getFullYear()}</p>
          </div>
          <div className="text-right">
            <p className="text-3xl font-light">{points.toLocaleString()}</p>
            <p className="text-xs text-gray-600 tracking-[0.1em]">POINTS BALANCE</p>
          </div>
        </div>

        {/* Progress to Next Tier */}
        {tierInfo.nextTier && (
          <div className="mt-6">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-600">Progress to {tierInfo.nextTier}</span>
              <span className="font-medium">
                ${lifetimeSpent.toFixed(0)} / ${tierInfo.nextTierSpend}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <motion.div 
                className="bg-brand-yellow h-2 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${Math.min((lifetimeSpent / tierInfo.nextTierSpend) * 100, 100)}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Spend ${(tierInfo.nextTierSpend - lifetimeSpent).toFixed(0)} more to reach {tierInfo.nextTier}
            </p>
          </div>
        )}
      </motion.div>

      {/* Tier Benefits */}
      <div className="bg-white p-6 border border-gray-200 rounded-lg">
        <h4 className="font-cormorant text-xl mb-4">Your Benefits</h4>
        <ul className="space-y-2">
          {tierInfo.benefits.map((benefit, index) => (
            <li key={index} className="flex items-start">
              <svg className="w-5 h-5 text-brand-yellow mt-0.5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="text-gray-700">{benefit}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Points Redemption */}
      {pointsToRedeem >= 100 && (
        <div className="bg-green-50 border border-green-200 p-6 rounded-lg">
          <h4 className="font-cormorant text-xl mb-2">Ready to Redeem!</h4>
          <p className="text-gray-700 mb-4">
            You have <span className="font-semibold">{pointsToRedeem} points</span> available to redeem 
            for <span className="font-semibold">${redeemValue}</span> off your next order.
          </p>
          <p className="text-sm text-gray-600">
            Points will be automatically applied at checkout
          </p>
        </div>
      )}

      {/* How It Works */}
      <div className="bg-gray-50 p-6 rounded-lg">
        <h4 className="font-cormorant text-xl mb-4">How It Works</h4>
        <div className="grid md:grid-cols-3 gap-4 text-sm">
          <div>
            <div className="text-2xl mb-2">🛍️</div>
            <p className="font-medium mb-1">Earn Points</p>
            <p className="text-gray-600">Earn points with every purchase based on your tier</p>
          </div>
          <div>
            <div className="text-2xl mb-2">⭐</div>
            <p className="font-medium mb-1">Level Up</p>
            <p className="text-gray-600">Unlock new tiers and benefits as you shop</p>
          </div>
          <div>
            <div className="text-2xl mb-2">🎁</div>
            <p className="font-medium mb-1">Redeem Rewards</p>
            <p className="text-gray-600">Use points for discounts on future orders</p>
          </div>
        </div>
      </div>
    </div>
  );
}