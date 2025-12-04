import React from 'react'
import Link from 'next/link'
import OldFashionedNavigation from '@/components/OldFashionedNavigation'
import migratedPosts from '@/data/blog-posts/posts.json'
import { getAllMDXPosts, mdxPostToLegacyFormat } from '@/lib/blog-mdx'
import BlogPageClient from './BlogPageClient'
import BlogSearchFilter from './BlogSearchFilter'

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

export default function BlogPage() {
  // Get MDX posts from filesystem
  const mdxPosts = getAllMDXPosts()

  // Convert MDX posts to legacy format
  const mdxPostsLegacy = mdxPosts.map(mdxPostToLegacyFormat)

  // Combine Shopify migrated posts with MDX posts
  const allPosts = [
    ...mdxPostsLegacy,
    ...(migratedPosts as BlogPost[])
  ]

  // Sort by date (newest first) - show all posts for SEO and discoverability
  const sortedPosts = allPosts
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())

  return (
    <div className="bg-white min-h-screen">
      <OldFashionedNavigation forceScrolled={true} />

      {/* Hero Section */}
      <section className="pt-32 pb-16 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-4xl mx-auto px-8 text-center">
          <div>
            <h1 className="font-serif text-5xl md:text-6xl text-gray-900 mb-6 tracking-[0.15em]">
              THE BLOG
            </h1>
            <div className="w-24 h-px bg-gold-500 mx-auto mb-8" />
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Expert tips, cocktail recipes, and event inspiration for your next Austin celebration
            </p>
          </div>
        </div>
      </section>

      {/* Search, Filter, and Blog Posts Grid - Client Component */}
      <BlogSearchFilter posts={sortedPosts} />

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

      {/* Newsletter Section - Client Component */}
      <BlogPageClient />

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
              <button className="px-8 py-3 bg-gold-500 text-gray-900 hover:bg-gold-600 transition-colors tracking-[0.15em]">
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
