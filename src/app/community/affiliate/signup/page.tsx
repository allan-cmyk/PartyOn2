import { Metadata } from 'next';
import AffiliateIframe from '@/components/affiliate/AffiliateIframe';

export const metadata: Metadata = {
  title: 'Join Our Affiliate Program | Party On Delivery',
  description: 'Become a Party On Delivery affiliate and earn commissions by promoting our premium alcohol delivery service in Austin.',
  openGraph: {
    title: 'Join Our Affiliate Program | Party On Delivery',
    description: 'Earn commissions by promoting Party On Delivery&apos;s premium alcohol delivery service.',
    type: 'website',
  },
};

export default function AffiliateSignupPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Page Header */}
      <div className="bg-gradient-to-r from-gold-600 via-gold-500 to-gold-600 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="font-serif text-4xl sm:text-5xl font-bold text-center tracking-wide mb-4 text-gray-900">
            Join Our Affiliate Program
          </h1>
          <p className="text-center text-lg sm:text-xl max-w-2xl mx-auto mb-8 text-gray-800">
            Earn commissions by promoting Austin&apos;s premier alcohol delivery service
          </p>

          {/* Benefits Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mt-8">
            <div className="text-center">
              <div className="text-3xl font-bold mb-2 text-gray-900">5%</div>
              <div className="text-sm text-gray-800">Commission on Every Order</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold mb-2 text-gray-900">On-Time</div>
              <div className="text-sm text-gray-800">Cold Drinks & Ice Delivered</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold mb-2 text-gray-900">Zero</div>
              <div className="text-sm text-gray-800">Store Runs or Hauling</div>
            </div>
          </div>
        </div>
      </div>

      {/* Why Join Section */}
      <div className="bg-gray-50 py-12 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-serif text-3xl font-bold text-center mb-8 text-gray-900">
            Why Partner With Us?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-gold-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="font-semibold mb-2">Generous Commissions</h3>
              <p className="text-sm text-gray-600">Earn competitive rates on every sale you generate</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gold-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="font-semibold mb-2">Premium Brand</h3>
              <p className="text-sm text-gray-600">Promote a trusted, luxury alcohol delivery service</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gold-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="font-semibold mb-2">Quick Approval</h3>
              <p className="text-sm text-gray-600">Get approved and start earning within 24 hours</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gold-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="font-semibold mb-2">Marketing Support</h3>
              <p className="text-sm text-gray-600">Access banners, links, and promotional materials</p>
            </div>
          </div>
        </div>
      </div>

      {/* Signup Form Section */}
      <div className="bg-white">
        <AffiliateIframe />
      </div>
    </div>
  );
}
