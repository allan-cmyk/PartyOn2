import React from 'react';

export default function ClientLogos() {
  // Using placeholder names for prestigious Austin venues/companies
  const clients = [
    'Four Seasons Austin',
    'The Driskill',
    'Austin Country Club',
    'Dell Technologies',
    'Whole Foods Market',
    'Tesla Gigafactory',
    'Oracle',
    'Indeed'
  ];

  return (
    <section className="py-16 bg-white border-y border-gray-100">
      <div className="max-w-7xl mx-auto px-6">
        <p className="text-center text-sm uppercase tracking-wider text-slate-500 mb-8">
          Trusted by Austin's Leading Organizations
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-8 items-center">
          {clients.map((client, index) => (
            <div 
              key={index} 
              className="text-center text-slate-400 font-light text-sm hover:text-slate-600 transition-colors"
            >
              {client}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}