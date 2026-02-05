'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'

import OldFashionedNavigation from '@/components/OldFashionedNavigation'
import migratedPosts from '@/data/blog-posts/posts.json'

interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  publishedAt: string;
  image?: {
    url: string;
    alt: string;
  };
  tags: string[];
}

// Use migrated Shopify blog posts
const blogPosts = (migratedPosts as BlogPost[]).slice(0, 12) // Show first 12 posts

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
      <OldFashionedNavigation forceScrolled={true} />
      
      {/* Hero Section */}
      <section className="pt-32 pb-16 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-4xl mx-auto px-8 text-center">
          <div className="hero-fade-in">
            <h1 className="font-heading text-5xl md:text-6xl text-gray-900 mb-6 tracking-[0.15em]">
              THE BLOG
            </h1>
            <div className="w-24 h-px bg-yellow-500 mx-auto mb-8" />
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Expert tips, cocktail recipes, and event inspiration for your next Austin celebration
            </p>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-12 bg-gray-900 text-white">
        <div className="max-w-4xl mx-auto px-8">
          <div className="text-center">
            <h2 className="font-heading text-3xl mb-4 tracking-[0.1em]">
              JOIN OUR INNER CIRCLE
            </h2>
            <p className="text-gray-300 mb-8">
              Get exclusive discounts, party planning tips, and be the first to know about new offerings
            </p>
            <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Your email address"
                className="flex-1 px-4 py-3 bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
              <button
                type="submit"
                className="px-8 py-3 bg-yellow-500 text-gray-900 hover:bg-brand-yellow transition-colors tracking-[0.1em] disabled:opacity-50"
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
            {blogPosts.map((post, index) => {
              const category = post.tags[0] || 'Article';
              const imageUrl = post.image?.url || '/images/hero/lake-travis-yacht-sunset.webp';

              return (
                <article
                  key={post.slug}
                  className="bg-white border border-gray-200 hover:border-yellow-500 transition-all duration-300 group hero-fade-in"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <Link href={`/blogs/news/${post.slug}`}>
                    <div className="relative h-64 overflow-hidden">
                      <Image
                        src={imageUrl}
                        alt={post.image?.alt || post.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                      <div className="absolute top-4 left-4">
                        <span className="bg-white px-3 py-1 text-xs tracking-[0.1em] text-gray-700">
                          {category.toUpperCase()}
                        </span>
                      </div>
                    </div>
                    <div className="p-6">
                      <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                        <time>{new Date(post.publishedAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}</time>
                      </div>
                      <h2 className="font-heading text-2xl text-gray-900 mb-3 group-hover:text-yellow-500 transition-colors">
                        {post.title}
                      </h2>
                      <p className="text-gray-600 mb-4 line-clamp-3">
                        {post.excerpt}
                      </p>
                      <span className="inline-block mt-2 px-4 py-2 border border-yellow-500 text-brand-yellow group-hover:bg-brand-yellow group-hover:text-gray-900 font-medium text-sm tracking-[0.1em] transition-all">
                        READ MORE →
                      </span>
                    </div>
                  </Link>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-8">
          <h2 className="font-heading text-3xl text-center mb-12 tracking-[0.1em]">
            EXPLORE BY CATEGORY
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {['Event Planning', 'Cocktail Recipes', 'Local Guides', 'Business Tips'].map((category) => (
              <Link
                key={category}
                href={`/blog/category/${category.toLowerCase().replace(' ', '-')}`}
                className="bg-white border border-gray-200 px-6 py-4 text-center hover:border-yellow-500 hover:bg-yellow-50 transition-all"
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
          <h2 className="font-heading text-3xl mb-4 tracking-[0.1em]">
            READY TO PLAN YOUR EVENT?
          </h2>
          <p className="text-gray-300 mb-8">
            Let our experts help you create the perfect beverage experience
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/order">
              <button className="px-8 py-3 bg-yellow-500 text-gray-900 hover:bg-brand-yellow transition-colors tracking-[0.15em]">
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