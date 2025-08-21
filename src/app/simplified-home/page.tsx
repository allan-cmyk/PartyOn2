import React from 'react';
import Image from 'next/image';

export default function SimplifiedHome() {
  return (
    <main className="min-h-screen">
      {/* Clean Hero Section */}
      <section className="relative h-screen flex items-center justify-center">
        <div className="absolute inset-0 bg-black/40 z-10" />
        <div className="absolute inset-0">
          <Image
            src="/images/hero/austin-skyline-golden-hour.webp"
            alt="Austin Skyline"
            fill
            className="object-cover"
            priority
          />
        </div>
        
        <div className="relative z-20 text-center text-white max-w-4xl mx-auto px-6">
          <h1 className="text-6xl md:text-8xl font-bold mb-6">
            Party On Delivery
          </h1>
          <p className="text-2xl md:text-3xl mb-8 font-light">
            Austin&apos;s Premium Alcohol Delivery & Event Service
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-white text-black px-8 py-4 text-lg font-semibold rounded-lg hover:bg-gray-100 transition">
              Quick Delivery
            </button>
            <button className="border-2 border-white text-white px-8 py-4 text-lg font-semibold rounded-lg hover:bg-white hover:text-black transition">
              Book an Event
            </button>
          </div>
        </div>
      </section>

      {/* Three Main Services */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-5xl font-bold text-center mb-16">What We Do</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Fast Delivery */}
            <div className="group cursor-pointer">
              <div className="relative h-80 mb-6 overflow-hidden rounded-lg">
                <Image
                  src="/images/services/fast-delivery/speed-delivery-action.webp"
                  alt="Fast Delivery"
                  fill
                  className="object-cover group-hover:scale-110 transition duration-500"
                />
              </div>
              <h3 className="text-2xl font-bold mb-3">Fast Delivery</h3>
              <p className="text-gray-600 mb-4">
                Cold drinks at your door in 27 minutes. Beer, wine, spirits, and mixers.
              </p>
              <p className="text-blue-600 font-semibold">Order Now →</p>
            </div>

            {/* Special Events */}
            <div className="group cursor-pointer">
              <div className="relative h-80 mb-6 overflow-hidden rounded-lg">
                <Image
                  src="/images/services/weddings/signature-cocktails-rings.webp"
                  alt="Special Events"
                  fill
                  className="object-cover group-hover:scale-110 transition duration-500"
                />
              </div>
              <h3 className="text-2xl font-bold mb-3">Special Events</h3>
              <p className="text-gray-600 mb-4">
                Weddings, bach parties, and celebrations with bartenders and premium setups.
              </p>
              <p className="text-blue-600 font-semibold">Explore Services →</p>
            </div>

            {/* Boat & Lake */}
            <div className="group cursor-pointer">
              <div className="relative h-80 mb-6 overflow-hidden rounded-lg">
                <Image
                  src="/images/services/boat-parties/sunset-champagne-pontoon.webp"
                  alt="Boat Parties"
                  fill
                  className="object-cover group-hover:scale-110 transition duration-500"
                />
              </div>
              <h3 className="text-2xl font-bold mb-3">Boat & Lake</h3>
              <p className="text-gray-600 mb-4">
                Lake Travis specialists. Dock delivery and yacht party services.
              </p>
              <p className="text-blue-600 font-semibold">Set Sail →</p>
            </div>
          </div>
        </div>
      </section>

      {/* Simple Value Props */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <div>
              <h3 className="text-6xl font-bold mb-2">27</h3>
              <p className="text-lg">Minutes Average Delivery</p>
            </div>
            <div>
              <h3 className="text-6xl font-bold mb-2">24/7</h3>
              <p className="text-lg">Support Available</p>
            </div>
            <div>
              <h3 className="text-6xl font-bold mb-2">500+</h3>
              <p className="text-lg">Products Available</p>
            </div>
            <div>
              <h3 className="text-6xl font-bold mb-2">5★</h3>
              <p className="text-lg">Average Rating</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonial */}
      <section className="py-24 bg-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-5xl font-bold mb-12">What People Say</h2>
          <blockquote className="text-2xl font-light text-gray-700 mb-8">
            &quot;Party On Delivery saved our wedding! They arrived with a full bar setup, 
            professional bartenders, and even custom cocktails. Absolutely incredible service.&quot;
          </blockquote>
          <p className="text-lg font-semibold">Sarah & Mike</p>
          <p className="text-gray-600">Lake Travis Wedding</p>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-32 bg-black text-white text-center">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-5xl font-bold mb-8">Ready to Party?</h2>
          <p className="text-2xl mb-12 font-light">
            Fast delivery or full event service. We&apos;ve got you covered.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <button className="bg-white text-black px-12 py-5 text-xl font-semibold rounded-lg hover:bg-gray-100 transition">
              Start Order
            </button>
            <button className="border-2 border-white text-white px-12 py-5 text-xl font-semibold rounded-lg hover:bg-white hover:text-black transition">
              Plan Event
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}