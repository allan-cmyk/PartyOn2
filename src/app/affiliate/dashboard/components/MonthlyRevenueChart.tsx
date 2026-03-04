'use client';

import { ReactElement } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

interface MonthStat {
  month: string;
  label: string;
  revenueCents: number;
  commissionCents: number;
  orderCount: number;
}

interface MonthlyRevenueChartProps {
  data: MonthStat[];
}

export default function MonthlyRevenueChart({ data }: MonthlyRevenueChartProps): ReactElement {
  const hasData = data.some((d) => d.revenueCents > 0 || d.commissionCents > 0);

  if (!hasData) {
    return (
      <div className="bg-white rounded-lg shadow p-5">
        <h3 className="font-semibold text-gray-800 mb-3">Monthly Revenue</h3>
        <div className="h-[200px] flex items-center justify-center text-sm text-gray-400">
          No data yet
        </div>
      </div>
    );
  }

  const chartData = data.map((d) => ({
    label: d.label,
    Revenue: Math.round(d.revenueCents / 100),
    Commission: Math.round(d.commissionCents / 100),
  }));

  return (
    <div className="bg-white rounded-lg shadow p-5">
      <h3 className="font-semibold text-gray-800 mb-3">Monthly Revenue</h3>
      <div className="h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 12, fill: '#6b7280' }}
              tickLine={false}
              axisLine={{ stroke: '#e5e7eb' }}
            />
            <YAxis
              tick={{ fontSize: 12, fill: '#6b7280' }}
              tickLine={false}
              axisLine={{ stroke: '#e5e7eb' }}
              tickFormatter={(value) => `$${value}`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#fff',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              }}
              formatter={(value: number | undefined) => {
                if (value === undefined) return ['N/A', undefined];
                return [`$${value.toLocaleString()}`, undefined];
              }}
            />
            <Legend />
            <Bar dataKey="Revenue" fill="#0B74B8" radius={[4, 4, 0, 0]} />
            <Bar dataKey="Commission" fill="#D4AF37" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
