'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import OldFashionedNavigation from '@/components/OldFashionedNavigation'

// Mock blog posts - in production, fetch from CMS or database
const blogPosts = [
  {
    slug: 'ultimate-guide-austin-boat-parties',
    title: 'The Ultimate Guide to Austin Boat Parties',
    excerpt: 'Everything you need to know about hosting the perfect boat party on Lake Travis, from planning to execution.',
    image: '/images/hero/lake-travis-yacht-sunset.webp',
    category: 'Event Planning',
    date: '2024-03-15',
    readTime: '8 min read'
  },
  {
    slug: 'signature-wedding-cocktails-texas-heat',
    title: 'Signature Wedding Cocktails for Texas Heat',
    excerpt: 'Beat the Texas sun with these refreshing cocktail recipes perfect for outdoor weddings.',
    image: '/images/services/weddings/signature-cocktails-closeup.webp',
    category: 'Cocktail Recipes',
    date: '2024-03-10',
    readTime: '5 min read'
  },
  {
    slug: 'bachelor-party-ideas-austin-2024',
    title: 'Top 10 Bachelor Party Ideas in Austin for 2024',
    excerpt: 'From brewery tours to lake adventures, discover the best ways to celebrate in the Live Music Capital.',
    image: '/images/gallery/sunset-champagne-pontoon.webp',
    category: 'Event Ideas',
    date: '2024-03-05',
    readTime: '10 min read'
  },
  {
    slug: 'corporate-event-bar-service-tips',
    title: 'Professional Bar Service for Corporate Events',
    excerpt: 'Impress clients and colleagues with these expert tips for corporate event beverage service.',
    image: '/images/backgrounds/rooftop-terrace-elegant-1.webp',
    category: 'Business',
    date: '2024-02-28',
    readTime: '6 min read'
  },
  {
    slug: 'the-night-we-saved-wedding-laguna-gloria',
    title: 'The Night We Saved a Wedding at Laguna Gloria',
    excerpt: 'A bartender\'s firsthand account of turning a catering crisis into an unforgettable celebration.',
    image: '/images/backgrounds/lake-travis-wedding-venue.webp',
    category: 'Event Planning',
    date: '2024-03-20',
    readTime: '7 min read'
  },
  {
    slug: 'rainey-street-ranch-weddings-cocktail-culture',
    title: 'From Rainey Street to Ranch Weddings: Austin\'s Cocktail Evolution',
    excerpt: 'How Austin\'s drinking culture has transformed post-pandemic and what it means for your event.',
    image: '/images/hero/austin-skyline-golden-hour.webp',
    category: 'Local Guides',
    date: '2024-03-18',
    readTime: '9 min read'
  },
  {
    slug: 'lake-travis-hidden-party-coves',
    title: 'Lake Travis Locals Share Their Secret Party Spots',
    excerpt: 'Beyond Devil\'s Cove: discover the hidden gems where Austin\'s boat party insiders anchor.',
    image: '/images/hero/lake-life-hero.webp',
    category: 'Local Guides',
    date: '2024-03-12',
    readTime: '8 min read'
  },
  {
    slug: 'maid-of-honor-bachelorette-bar-stress',
    title: 'Why Your Maid of Honor is Secretly Stressed About the Bar',
    excerpt: 'The untold anxieties of planning bachelorette party drinks - and how to solve them.',
    image: '/images/services/bach-parties/bachelorette-champagne-tower.webp',
    category: 'Event Planning',
    date: '2024-03-08',
    readTime: '6 min read'
  }
]

export default function BlogPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      const response = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })

      const data = await response.json()

      if (response.ok) {
        setMessage('Thank you for subscribing!')
        setEmail('')
      } else {
        setMessage(data.error || 'Something went wrong')
      }
    } catch {
      setMessage('Failed to subscribe. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white min-h-screen">
      <OldFashionedNavigation />
      
      {/* Hero Section */}
      <section className="pt-32 pb-16 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-4xl mx-auto px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="font-serif text-5xl md:text-6xl text-gray-900 mb-6 tracking-[0.15em]">
              THE BLOG
            </h1>
            <div className="w-24 h-px bg-gold-500 mx-auto mb-8" />
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Expert tips, cocktail recipes, and event inspiration for your next Austin celebration
            </p>
          </motion.div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-12 bg-gray-900 text-white">
        <div className="max-w-4xl mx-auto px-8">
          <div className="text-center">
            <h2 className="font-serif text-3xl mb-4 tracking-[0.1em]">
              JOIN OUR INNER CIRCLE
            </h2>
            <p className="text-gray-300 mb-8">
              Get exclusive discounts, party planning tips, and be the first to know about new offerings
            </p>
            <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Your email address"
                className="flex-1 px-4 py-3 bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gold-500"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
              <button
                type="submit"
                className="px-8 py-3 bg-gold-500 text-white hover:bg-gold-600 transition-colors tracking-[0.1em] disabled:opacity-50"
                disabled={loading}
              >
                {loading ? 'SUBSCRIBING...' : 'SUBSCRIBE'}
              </button>
            </form>
            {message && (
              <p className={`text-sm mt-4 ${message.includes('Thank you') ? 'text-green-400' : 'text-red-400'}`}>
                {message}
              </p>
            )}
            <p className="text-xs text-gray-400 mt-4">
              Join 5,000+ Austin party planners. Unsubscribe anytime.
            </p>
          </div>
        </div>
      </section>

      {/* Blog Posts Grid */}
      <section className="py-16 px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
            {blogPosts.map((post, index) => (
              <motion.article
                key={post.slug}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-white border border-gray-200 hover:border-gold-500 transition-all duration-300 group"
              >
                <Link href={`/blog/${post.slug}`}>
                  <div className="relative h-64 overflow-hidden">
                    <Image
                      src={post.image}
                      alt={post.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute top-4 left-4">
                      <span className="bg-white px-3 py-1 text-xs tracking-[0.1em] text-gray-700">
                        {post.category.toUpperCase()}
                      </span>
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                      <time>{new Date(post.date).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}</time>
                      <span>•</span>
                      <span>{post.readTime}</span>
                    </div>
                    <h2 className="font-serif text-2xl text-gray-900 mb-3 group-hover:text-gold-500 transition-colors">
                      {post.title}
                    </h2>
                    <p className="text-gray-600 mb-4 line-clamp-3">
                      {post.excerpt}
                    </p>
                    <span className="inline-block mt-2 px-4 py-2 border border-gold-500 text-gold-600 group-hover:bg-gold-600 group-hover:text-white font-medium text-sm tracking-[0.1em] transition-all">
                      READ MORE →
                    </span>
                  </div>
                </Link>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-8">
          <h2 className="font-serif text-3xl text-center mb-12 tracking-[0.1em]">
            EXPLORE BY CATEGORY
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {['Event Planning', 'Cocktail Recipes', 'Local Guides', 'Business Tips'].map((category) => (
              <Link
                key={category}
                href={`/blog/category/${category.toLowerCase().replace(' ', '-')}`}
                className="bg-white border border-gray-200 px-6 py-4 text-center hover:border-gold-500 hover:bg-gold-50 transition-all"
              >
                <span className="text-sm tracking-[0.1em]">{category.toUpperCase()}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="py-16 bg-gray-900 text-white text-center">
        <div className="max-w-4xl mx-auto px-8">
          <h2 className="font-serif text-3xl mb-4 tracking-[0.1em]">
            READY TO PLAN YOUR EVENT?
          </h2>
          <p className="text-gray-300 mb-8">
            Let our experts help you create the perfect beverage experience
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/order">
              <button className="px-8 py-3 bg-gold-500 text-white hover:bg-gold-600 transition-colors tracking-[0.15em]">
                ORDER NOW
              </button>
            </Link>
            <Link href="/contact">
              <button className="px-8 py-3 border border-white text-white hover:bg-white hover:text-gray-900 transition-all tracking-[0.15em]">
                GET IN TOUCH
              </button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}