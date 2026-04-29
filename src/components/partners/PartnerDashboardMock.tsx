'use client';

import React from 'react';

const RECENT_ORDERS = [
  { property: 'Pelican Pointe (Lake Travis)', guests: 'Davies bachelor party', total: '$2,418', status: 'Delivered', when: '2h ago' },
  { property: 'Cliffside on Comanche Trail', guests: 'Henderson wedding welcome', total: '$3,142', status: 'Delivered', when: '5h ago' },
  { property: 'The Hudson Bend Estate', guests: 'Reyes corporate retreat', total: '$1,867', status: 'In transit', when: 'Today 4:15p' },
  { property: 'Lakeway Modern (5BR)', guests: 'Patel bachelorette', total: '$2,290', status: 'Scheduled', when: 'Tomorrow 2:00p' },
  { property: 'Volente Beach House', guests: 'Williams anniversary', total: '$946', status: 'Delivered', when: 'Yesterday' },
];

const SPARK = [12, 18, 24, 21, 32, 28, 41, 38, 47, 52, 49, 64, 71, 68];

export default function PartnerDashboardMock() {
  const w = 280;
  const h = 60;
  const max = Math.max(...SPARK);
  const min = Math.min(...SPARK);
  const xStep = w / (SPARK.length - 1);
  const path = SPARK.map((v, i) => {
    const x = i * xStep;
    const y = h - ((v - min) / (max - min)) * (h - 6) - 3;
    return `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
  }).join(' ');
  const areaPath = `${path} L ${w} ${h} L 0 ${h} Z`;

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-premium overflow-hidden text-sm w-full max-w-full">
      {/* Header bar */}
      <div className="flex items-center justify-between gap-2 px-3 sm:px-4 py-2.5 sm:py-3 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center gap-2 min-w-0">
          <div className="flex gap-1 sm:gap-1.5 flex-shrink-0">
            <span className="w-2 sm:w-2.5 h-2 sm:h-2.5 rounded-full bg-red-400" />
            <span className="w-2 sm:w-2.5 h-2 sm:h-2.5 rounded-full bg-yellow-400" />
            <span className="w-2 sm:w-2.5 h-2 sm:h-2.5 rounded-full bg-green-400" />
          </div>
          <span className="text-[11px] sm:text-xs text-gray-500 ml-1 sm:ml-2 truncate">partners.partyondelivery.com</span>
        </div>
        <div className="flex items-center gap-1.5 text-[11px] sm:text-xs text-gray-600 flex-shrink-0">
          <span className="w-1.5 sm:w-2 h-1.5 sm:h-2 rounded-full bg-green-500 animate-pulse" />
          <span>Live</span>
          <span className="hidden sm:inline">· April 2026</span>
        </div>
      </div>

      <div className="p-4 sm:p-5 md:p-6">
        {/* Property + rating row */}
        <div className="flex items-start justify-between gap-3 mb-5 flex-wrap">
          <div className="min-w-0 flex-1">
            <div className="text-[10px] sm:text-xs uppercase tracking-wider text-gray-500 mb-1">Property portfolio</div>
            <div className="font-heading font-bold text-lg sm:text-xl text-gray-900 leading-tight">FiveStar Vacation Rentals</div>
            <div className="text-[11px] sm:text-xs text-gray-500 mt-0.5">23 active properties · Lake Travis &amp; Westlake</div>
          </div>
          <div className="flex items-center gap-1 text-amber-500 flex-shrink-0">
            {[0, 1, 2, 3, 4].map((i) => (
              <svg key={i} className="w-3.5 sm:w-4 h-3.5 sm:h-4 fill-current" viewBox="0 0 20 20"><path d="M10 1l2.6 5.5 6 .9-4.3 4.4 1 6.2L10 15l-5.4 3 1-6.2L1.3 7.4l6-.9z" /></svg>
            ))}
            <span className="text-xs text-gray-700 ml-1 font-semibold">4.9</span>
          </div>
        </div>

        {/* KPI grid — stacks on mobile, 3-col on sm+ */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3 mb-6">
          <div className="bg-gradient-to-br from-brand-blue to-brand-blue-dark text-white rounded-lg p-3 sm:p-4 flex sm:block items-center justify-between gap-3">
            <div className="min-w-0">
              <div className="text-[10px] uppercase tracking-wider text-white/70 mb-0.5 sm:mb-1">Revenue MTD</div>
              <div className="font-heading font-extrabold text-2xl sm:text-2xl lg:text-3xl leading-none">$26,148</div>
            </div>
            <div className="text-[10px] sm:text-[11px] text-brand-yellow sm:mt-1 flex items-center gap-1 whitespace-nowrap flex-shrink-0">
              <svg className="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" /></svg>
              +34% MoM
            </div>
          </div>
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 sm:p-4 flex sm:block items-center justify-between gap-3">
            <div className="min-w-0">
              <div className="text-[10px] uppercase tracking-wider text-gray-500 mb-0.5 sm:mb-1">Orders MTD</div>
              <div className="font-heading font-extrabold text-2xl sm:text-2xl lg:text-3xl text-gray-900 leading-none">12</div>
            </div>
            <div className="text-[10px] sm:text-[11px] text-green-600 sm:mt-1 leading-tight text-right sm:text-left flex-shrink-0">8 done · 3 booked · 1 en route</div>
          </div>
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 sm:p-4 flex sm:block items-center justify-between gap-3">
            <div className="min-w-0">
              <div className="text-[10px] uppercase tracking-wider text-gray-500 mb-0.5 sm:mb-1">Avg ticket</div>
              <div className="font-heading font-extrabold text-2xl sm:text-2xl lg:text-3xl text-gray-900 leading-none">$2,179</div>
            </div>
            <div className="text-[10px] sm:text-[11px] text-gray-500 sm:mt-1 leading-tight text-right sm:text-left flex-shrink-0">Group bookings drive 78%</div>
          </div>
        </div>

        {/* Sparkline */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 sm:p-4 mb-6">
          <div className="flex items-baseline justify-between mb-2 gap-2 flex-wrap">
            <span className="text-[11px] sm:text-xs text-gray-600 font-semibold">Order volume — last 14 days</span>
            <span className="text-[11px] sm:text-xs text-brand-blue font-semibold whitespace-nowrap">↗ trending up</span>
          </div>
          <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" className="w-full h-12 sm:h-14">
            <defs>
              <linearGradient id="spark" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#0B74B8" stopOpacity="0.35" />
                <stop offset="100%" stopColor="#0B74B8" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path d={areaPath} fill="url(#spark)" />
            <path d={path} fill="none" stroke="#0B74B8" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>

        {/* Recent orders */}
        <div>
          <div className="flex items-center justify-between mb-3 gap-2">
            <span className="text-[11px] sm:text-xs text-gray-600 font-semibold uppercase tracking-wider">Recent orders</span>
            <span className="text-[11px] sm:text-xs text-brand-blue font-semibold cursor-default whitespace-nowrap">View all →</span>
          </div>
          <div className="space-y-2">
            {RECENT_ORDERS.map((o) => (
              <div key={o.property} className="flex items-center justify-between gap-2 sm:gap-3 py-2 border-b border-gray-100 last:border-0">
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-gray-900 truncate text-[12px] sm:text-[13px]">{o.property}</div>
                  <div className="text-[10px] sm:text-[11px] text-gray-500 truncate">{o.guests} · {o.when}</div>
                </div>
                <div className="font-heading font-bold text-gray-900 text-xs sm:text-sm whitespace-nowrap flex-shrink-0">{o.total}</div>
                <span
                  className={`text-[9px] sm:text-[10px] uppercase tracking-wider font-bold px-1.5 sm:px-2 py-1 rounded-full whitespace-nowrap flex-shrink-0 ${
                    o.status === 'Delivered'
                      ? 'bg-green-100 text-green-700'
                      : o.status === 'In transit'
                        ? 'bg-blue-100 text-brand-blue'
                        : 'bg-yellow-100 text-yellow-800'
                  }`}
                >
                  {o.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
