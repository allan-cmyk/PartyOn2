
import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { Metadata } from 'next'
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
  }
]

const categoryMap: Record<string, string> = {
  'event-planning': 'Event Planning',
  'cocktail-recipes': 'Cocktail Recipes',
  'local-guides': 'Local Guides',
  'business-tips': 'Business Tips',
  'event-ideas': 'Event Ideas',
  'business': 'Business'
}

export async function generateMetadata({ params }: { params: Promise<{ category: string }> }): Promise<Metadata> {
  const resolvedParams = await params
  const categoryName = categoryMap[resolvedParams.category]

  if (!categoryName) {
    return { title: 'Category Not Found' }
  }

  return {
    title: `${categoryName} | Blog | Party On Delivery Austin`,
    description: `Browse articles about ${categoryName.toLowerCase()}, event planning, and party hosting in Austin, Texas.`,
    alternates: {
      canonical: `https://partyondelivery.com/blog/category/${resolvedParams.category}`,
    },
    openGraph: {
      title: `${categoryName} | Blog | Party On Delivery Austin`,
      description: `Browse articles about ${categoryName.toLowerCase()} and party hosting in Austin.`,
      type: 'website',
    },
  }
}

export default async function BlogCategoryPage({ params }: { params: Promise<{ category: string }> }) {
  const resolvedParams = await params
  const categoryName = categoryMap[resolvedParams.category]
  
  if (!categoryName) {
    notFound()
  }

  // Filter posts by category
  const categoryPosts = blogPosts.filter(post => 
    post.category.toLowerCase() === categoryName.toLowerCase() ||
    (categoryName === 'Business Tips' && post.category === 'Business') ||
    (categoryName === 'Event Ideas' && post.category.includes('Event'))
  )

  return (
    <div className="bg-white min-h-screen">
      <OldFashionedNavigation />
      
      {/* Hero Section */}
      <section className="pt-32 pb-16 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-4xl mx-auto px-8 text-center">
          <div>
            <h1 className="font-serif text-5xl md:text-6xl text-gray-900 mb-6 tracking-[0.15em]">
              {categoryName.toUpperCase()}
            </h1>
            <div className="w-24 h-px bg-gold-500 mx-auto mb-8" />
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              {categoryName === 'Event Planning' && 'Expert tips and strategies for planning unforgettable events in Austin'}
              {categoryName === 'Cocktail Recipes' && 'Craft cocktails and drink recipes for every occasion'}
              {categoryName === 'Local Guides' && 'Your guide to the best of Austin\'s entertainment and venues'}
              {categoryName === 'Business Tips' && 'Professional insights for corporate events and business entertaining'}
            </p>
          </div>
        </div>
      </section>

      {/* Category Posts */}
      <section className="py-16 px-8">
        <div className="max-w-7xl mx-auto">
          {categoryPosts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
              {categoryPosts.map((post) => (
                <article
                  key={post.slug}
                  className="bg-white border border-gray-200 hover:border-gold-500 transition-all duration-300 group"
                >
                  <Link href={`/blog/${post.slug}`}>
                    <div className="relative h-64 overflow-hidden">
                      <Image
                        src={post.image}
                        alt={post.title}
                        fill
                        sizes="(max-width: 768px) 100vw, 50vw"
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
                </article>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-600 text-lg mb-8">No posts in this category yet. Check back soon!</p>
              <Link href="/blog">
                <button className="px-8 py-3 bg-gold-600 text-white hover:bg-gold-700 transition-colors tracking-[0.1em]">
                  BACK TO BLOG
                </button>
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Other Categories */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-8">
          <h2 className="font-serif text-3xl text-center mb-12 tracking-[0.1em]">
            EXPLORE OTHER CATEGORIES
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(categoryMap)
              .filter(([, name]) => name !== categoryName)
              .slice(0, 4)
              .map(([slug, name]) => (
                <Link
                  key={slug}
                  href={`/blog/category/${slug}`}
                  className="bg-white border border-gray-200 px-6 py-4 text-center hover:border-gold-500 hover:bg-gold-50 transition-all"
                >
                  <span className="text-sm tracking-[0.1em]">{name.toUpperCase()}</span>
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