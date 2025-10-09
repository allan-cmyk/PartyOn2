import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import blogPosts from '@/data/blog-posts/posts.json';

interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  publishedAt: string;
  author: string;
  tags: string[];
  image?: {
    url: string;
    alt: string;
  };
}

export const metadata: Metadata = {
  title: 'News & Articles | Party On Delivery',
  description: 'Expert tips, guides, and insights for planning perfect events, weddings, corporate gatherings, and celebrations in Austin, Texas.',
  keywords: ['Austin events', 'party planning', 'wedding tips', 'corporate events', 'bachelorette party', 'alcohol delivery'],
};

export default function BlogListingPage() {
  const posts = blogPosts as BlogPost[];

  // Get all unique tags
  const allTags = Array.from(new Set(posts.flatMap(post => post.tags)));

  return (
    <main className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-gray-50 to-white py-16 border-b border-gray-100">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <h1 className="font-serif text-5xl md:text-6xl text-gray-900 mb-6 tracking-tight">
            News & Articles
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Expert tips, guides, and insights for planning perfect events, weddings, corporate gatherings, and celebrations in Austin, Texas.
          </p>
        </div>
      </section>

      {/* Blog Posts Grid */}
      <section className="py-16">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post) => {
              const publishedDate = new Date(post.publishedAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              });

              return (
                <Link
                  key={post.slug}
                  href={`/blogs/news/${post.slug}`}
                  className="group bg-white rounded-lg overflow-hidden border border-gray-200 hover:border-gold-300 hover:shadow-lg transition-all duration-300"
                >
                  {/* Featured Image */}
                  {post.image ? (
                    <div className="relative aspect-[16/9] bg-gray-200 overflow-hidden">
                      <Image
                        src={post.image.url}
                        alt={post.image.alt}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 400px"
                      />
                    </div>
                  ) : (
                    <div className="relative aspect-[16/9] bg-gradient-to-br from-gold-50 to-gold-100 flex items-center justify-center">
                      <svg className="w-16 h-16 text-gold-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                      </svg>
                    </div>
                  )}

                  {/* Content */}
                  <div className="p-6">
                    {/* Meta */}
                    <div className="flex items-center text-xs text-gray-500 mb-3">
                      <time dateTime={post.publishedAt}>{publishedDate}</time>
                      {post.author && (
                        <>
                          <span className="mx-2">•</span>
                          <span>{post.author}</span>
                        </>
                      )}
                    </div>

                    {/* Title */}
                    <h2 className="font-serif text-xl text-gray-900 mb-3 group-hover:text-gold-600 transition-colors leading-tight">
                      {post.title}
                    </h2>

                    {/* Excerpt */}
                    <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                      {post.excerpt}
                    </p>

                    {/* Tags */}
                    {post.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {post.tags.slice(0, 3).map((tag) => (
                          <span
                            key={tag}
                            className="px-2 py-1 bg-gold-50 text-gold-700 rounded text-xs tracking-[0.05em] uppercase"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Popular Topics */}
      <section className="bg-gray-50 py-16 border-t border-gray-200">
        <div className="container mx-auto px-4 max-w-7xl">
          <h2 className="font-serif text-3xl text-gray-900 mb-8 text-center tracking-tight">
            Popular Topics
          </h2>
          <div className="flex flex-wrap justify-center gap-3">
            {allTags.slice(0, 15).map((tag) => (
              <span
                key={tag}
                className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-full text-sm hover:border-gold-300 hover:text-gold-600 transition-colors cursor-pointer"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gold-600 text-white py-16">
        <div className="container mx-auto px-4 text-center max-w-3xl">
          <h2 className="font-serif text-3xl mb-4 tracking-tight">Ready to Plan Your Event?</h2>
          <p className="text-gold-100 mb-8 text-lg">
            Let Party On Delivery handle your alcohol coordination for weddings, corporate events, and celebrations.
          </p>
          <Link
            href="/contact"
            className="inline-block px-8 py-4 bg-white text-gold-600 rounded-lg font-medium tracking-[0.1em] text-sm hover:bg-gray-50 transition-colors"
          >
            GET IN TOUCH
          </Link>
        </div>
      </section>
    </main>
  );
}
