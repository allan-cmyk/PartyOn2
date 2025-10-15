import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import OldFashionedNavigation from '@/components/OldFashionedNavigation'
import ShareButtons from '@/components/blog/ShareButtons'
import { notFound } from 'next/navigation'
import { getMDXPost, getAllMDXPostSlugs } from '@/lib/blog-mdx'
import { serialize } from 'next-mdx-remote/serialize'
import MDXContent from '@/components/blog/MDXContent'

interface BlogPostPageProps {
  params: Promise<{
    slug: string
  }>
}

export async function generateStaticParams() {
  const slugs = getAllMDXPostSlugs()
  return slugs.map((slug) => ({
    slug: slug,
  }))
}

export default async function BlogPostMDXPage({ params }: BlogPostPageProps) {
  const resolvedParams = await params
  const post = getMDXPost(resolvedParams.slug)

  if (!post) {
    notFound()
  }

  // Serialize MDX content for rendering
  const mdxSource = await serialize(post.content)

  return (
    <div className="bg-white min-h-screen">
      <OldFashionedNavigation />

      {/* Hero Section with Image */}
      <section className="relative h-[60vh] min-h-[500px]">
        <Image
          src={post.image}
          alt={post.title}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-8 md:p-16">
          <div className="max-w-4xl mx-auto">
            <div>
              <div className="flex items-center gap-4 text-white/80 text-sm mb-4">
                <span className="bg-white/20 backdrop-blur-sm px-3 py-1 tracking-[0.1em]">
                  {post.category.toUpperCase()}
                </span>
                <span>{new Date(post.date).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}</span>
              </div>
              <h1 className="font-serif text-4xl md:text-6xl text-white mb-4 tracking-[0.1em]">
                {post.title}
              </h1>
              <p className="text-xl text-white/90 max-w-3xl">
                {post.excerpt}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Article Content */}
      <article className="py-16 px-8">
        <div className="max-w-4xl mx-auto">
          <MDXContent source={mdxSource} />

          {/* Author Bio */}
          <div className="mt-16 pt-8 border-t border-gray-200">
            <div className="flex items-start gap-6">
              <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center">
                <svg className="w-10 h-10 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="font-serif text-2xl text-gray-900 mb-2">{post.author}</h3>
                <p className="text-gray-600 mb-4">
                  Senior Event Specialist at PartyOn Delivery with over 10 years of experience in the hospitality industry.
                  Passionate about creating unforgettable experiences through expertly crafted beverage programs.
                </p>
                <div className="flex gap-4">
                  <a href="#" className="text-gold-500 hover:text-gold-600 transition-colors">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M6.29 18.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0020 3.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.073 4.073 0 01.8 7.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 010 16.407a11.616 11.616 0 006.29 1.84" />
                    </svg>
                  </a>
                  <a href="#" className="text-gold-500 hover:text-gold-600 transition-colors">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.338 16.338H13.67V12.16c0-.995-.017-2.277-1.387-2.277-1.39 0-1.601 1.086-1.601 2.207v4.248H8.014v-8.59h2.559v1.174h.037c.356-.675 1.227-1.387 2.526-1.387 2.703 0 3.203 1.778 3.203 4.092v4.711zM5.005 6.575a1.548 1.548 0 11-.003-3.096 1.548 1.548 0 01.003 3.096zm-1.337 9.763H6.34v-8.59H3.667v8.59zM17.668 1H2.328C1.595 1 1 1.581 1 2.298v15.403C1 18.418 1.595 19 2.328 19h15.34c.734 0 1.332-.582 1.332-1.299V2.298C19 1.581 18.402 1 17.668 1z" clipRule="evenodd" />
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Social Sharing */}
          <div className="mt-12 pt-8 border-t border-gray-200">
            <h3 className="font-serif text-2xl text-gray-900 mb-4 tracking-[0.1em]">Share This Article</h3>
            <ShareButtons title={post.title} slug={post.slug} />
          </div>
        </div>
      </article>

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
            <form className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Your email address"
                className="flex-1 px-4 py-3 bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gold-500"
                required
              />
              <button
                type="submit"
                className="px-8 py-3 bg-gold-500 text-white hover:bg-gold-600 transition-colors tracking-[0.1em]"
              >
                SUBSCRIBE
              </button>
            </form>
            <p className="text-xs text-gray-400 mt-4">
              Join 5,000+ Austin party planners. Unsubscribe anytime.
            </p>
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="py-16 bg-gray-900 text-white text-center">
        <div className="max-w-4xl mx-auto px-8">
          <div>
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
        </div>
      </section>
    </div>
  )
}
