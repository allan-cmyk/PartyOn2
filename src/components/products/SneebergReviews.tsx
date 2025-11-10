import React from 'react';
import Script from 'next/script';
import LuxuryCard from '../LuxuryCard';

/**
 * Customer reviews section for Schneeberg snuff product page
 * Includes aggregate rating schema for rich snippets
 */
export default function SneebergReviews() {
  const reviews = [
    {
      rating: 5,
      text: "Great peppermint snuff! So glad I found Party On Delivery - they're the only place in Austin I can get Schneeberg delivered. Fast service and authentic product!",
      author: "John M.",
      location: "Downtown Austin, TX",
      date: "2025-01-15"
    },
    {
      rating: 5,
      text: "Perfect for someone who wants the snuff experience without tobacco. The peppermint is really refreshing and clears my sinuses. Delivery was quick too - ordered in the morning, arrived same day.",
      author: "Sarah K.",
      location: "South Austin, TX",
      date: "2025-01-10"
    },
    {
      rating: 4,
      text: "Good product, authentic Pöschl. Delivery was easy to schedule and the driver was professional. Will definitely order again when I run out.",
      author: "Mike R.",
      location: "Round Rock, TX",
      date: "2025-01-05"
    },
    {
      rating: 5,
      text: "Love this stuff! I was looking everywhere in Austin for Schneeberg and couldn't find it. Party On Delivery had it and delivered same day. The peppermint kick is exactly what I was looking for.",
      author: "David L.",
      location: "East Austin, TX",
      date: "2024-12-28"
    }
  ];

  const averageRating = reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;

  // Generate Review Schema for rich snippets
  const reviewSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": "Pöschl Schneeberg Weiss Herbal Snuff",
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": averageRating.toFixed(1),
      "reviewCount": reviews.length,
      "bestRating": "5",
      "worstRating": "1"
    },
    "review": reviews.map(review => ({
      "@type": "Review",
      "reviewRating": {
        "@type": "Rating",
        "ratingValue": review.rating,
        "bestRating": "5"
      },
      "author": {
        "@type": "Person",
        "name": review.author
      },
      "datePublished": review.date,
      "reviewBody": review.text
    }))
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <svg
            key={star}
            className={`w-5 h-5 ${star <= rating ? 'text-gold-600' : 'text-gray-300'}`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
    );
  };

  return (
    <>
      {/* Review Schema Markup */}
      <Script
        id="schneeberg-review-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(reviewSchema) }}
      />

      <section className="py-16 px-4 md:px-8 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-serif text-3xl md:text-4xl text-gray-900 mb-4 tracking-[0.15em]">
              CUSTOMER REVIEWS
            </h2>
            <div className="flex items-center justify-center gap-3 mb-2">
              {renderStars(Math.round(averageRating))}
              <span className="text-2xl font-bold text-gray-900">{averageRating.toFixed(1)}</span>
            </div>
            <p className="text-gray-600">
              Based on {reviews.length} reviews from Austin customers
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {reviews.map((review, index) => (
              <LuxuryCard key={index} index={index}>
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    {renderStars(review.rating)}
                    <span className="text-sm text-gray-500">
                      {new Date(review.date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </span>
                  </div>
                  <p className="text-gray-700 mb-4 leading-relaxed italic">
                    &ldquo;{review.text}&rdquo;
                  </p>
                  <div className="flex items-center text-sm text-gray-600">
                    <svg className="w-4 h-4 mr-2 text-gold-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span className="font-medium">{review.author}</span>
                    <span className="mx-2">•</span>
                    <svg className="w-4 h-4 mr-1 text-gold-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span>{review.location}</span>
                  </div>
                </div>
              </LuxuryCard>
            ))}
          </div>

          {/* Disclaimer */}
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-500 italic">
              Reviews are from verified Party On Delivery customers in the Austin area
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
