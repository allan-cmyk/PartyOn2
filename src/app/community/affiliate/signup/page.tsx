import { Metadata } from 'next';

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
      <div className="bg-gradient-to-r from-gold-600 via-gold-500 to-gold-600 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="font-serif text-4xl sm:text-5xl font-bold text-center tracking-wide mb-4">
            Join Our Affiliate Program
          </h1>
          <p className="text-center text-lg max-w-2xl mx-auto">
            Earn commissions by promoting Austin's premier alcohol delivery service
          </p>
        </div>
      </div>

      {/* Iframe Container */}
      <div className="w-full">
        <iframe
          id="recomsale-affiliate-signup"
          src="https://store.recomsale.com/signup?shop=premier-concierge.myshopify.com"
          title="Affiliate Signup Form"
          className="w-full border-0"
          style={{
            minHeight: '100vh',
            height: '100%',
          }}
          allow="payment; fullscreen"
          loading="eager"
        />
      </div>
    </div>
  );
}
