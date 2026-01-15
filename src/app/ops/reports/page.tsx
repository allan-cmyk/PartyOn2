'use client';

import Link from 'next/link';

/**
 * Operations Reports Landing Page
 */
export default function ReportsPage() {
  const reports = [
    {
      title: 'Inventory Reports',
      description: 'Stock levels, movement history, and valuation',
      href: '/ops/reports/inventory',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      ),
      color: 'blue',
    },
    {
      title: 'Sales Reports',
      description: 'Revenue, orders, and product performance',
      href: '/ops/reports/sales',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      color: 'green',
    },
    {
      title: 'Customer Reports',
      description: 'Customer analytics, loyalty, and retention',
      href: '/ops/reports/customers',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      color: 'purple',
    },
  ];

  const getColorClasses = (color: string) => {
    const colors: Record<string, string> = {
      blue: 'bg-blue-50 border-blue-200 hover:border-blue-400 text-blue-600',
      green: 'bg-green-50 border-green-200 hover:border-green-400 text-green-600',
      purple: 'bg-purple-50 border-purple-200 hover:border-purple-400 text-purple-600',
    };
    return colors[color] || colors.blue;
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
        <p className="text-gray-600 mt-1">
          View and export operational reports
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {reports.map((report) => (
          <Link
            key={report.href}
            href={report.href}
            className={`block p-6 rounded-lg border-2 transition-colors ${getColorClasses(report.color)}`}
          >
            <div className="mb-4">{report.icon}</div>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">
              {report.title}
            </h2>
            <p className="text-sm text-gray-600">{report.description}</p>
          </Link>
        ))}
      </div>

      {/* Quick Stats */}
      <div className="mt-8 bg-white rounded-lg border-2 border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h2>
        <p className="text-gray-500 text-sm">
          Coming soon: Summary metrics and export options
        </p>
      </div>
    </div>
  );
}
