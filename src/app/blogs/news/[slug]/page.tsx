import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import blogPosts from '@/data/blog-posts/posts.json';

interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  publishedAt: string;
  author: string;
  tags: string[];
  image?: {
    url: string;
    alt: string;
  };
  seo: {
    title: string;
    description: string;
    keywords: string[];
  };
  schema: {
    questionsAnswered: string[];
    topics: string[];
  };
}

interface Props {
  params: Promise<{ slug: string }>;
}

async function getPost(slug: string): Promise<BlogPost | null> {
  const posts = blogPosts as BlogPost[];
  return posts.find(post => post.slug === slug) || null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);

  if (!post) {
    return {
      title: 'Post Not Found',
    };
  }

  return {
    title: post.seo.title,
    description: post.seo.description,
    keywords: post.seo.keywords,
    alternates: {
      canonical: `/blogs/news/${slug}`,
    },
    openGraph: {
      title: post.seo.title,
      description: post.seo.description,
      type: 'article',
      publishedTime: post.publishedAt,
      authors: [post.author],
      images: post.image ? [{ url: post.image.url, alt: post.image.alt }] : [],
    },
  };
}

export async function generateStaticParams() {
  const posts = blogPosts as BlogPost[];
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = await getPost(slug);

  if (!post) {
    notFound();
  }

  const publishedDate = new Date(post.publishedAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // Get related posts (same tags, excluding current post)
  const allPosts = blogPosts as BlogPost[];
  const relatedPosts = allPosts
    .filter(p => p.slug !== post.slug && p.tags.some(tag => post.tags.includes(tag)))
    .slice(0, 3);

  return (
    <>
      {/* JSON-LD Schema for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'BlogPosting',
            headline: post.title,
            description: post.excerpt,
            image: post.image?.url,
            datePublished: post.publishedAt,
            author: {
              '@type': 'Person',
              name: post.author,
            },
            publisher: {
              '@type': 'Organization',
              name: 'Party On Delivery',
              logo: {
                '@type': 'ImageObject',
                url: '/images/logo.png',
              },
            },
            mainEntityOfPage: {
              '@type': 'WebPage',
              '@id': `https://party-on-delivery.com/blogs/news/${post.slug}`,
            },
          }),
        }}
      />

      <main className="min-h-screen bg-white">
        {/* Header Navigation */}
        <div className="border-b border-gray-100">
          <div className="container mx-auto px-4 py-4">
            <Link
              href="/blog"
              className="text-sm text-gray-600 hover:text-gold-600 transition-colors inline-flex items-center"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
              </svg>
              Back to Blog
            </Link>
          </div>
        </div>

        {/* Article Header */}
        <article className="container mx-auto px-4 py-12 max-w-4xl">
          {/* Meta Info */}
          <div className="mb-6 flex items-center text-sm text-gray-600">
            <time dateTime={post.publishedAt}>{publishedDate}</time>
            <span className="mx-3">•</span>
            <span>{post.author}</span>
          </div>

          {/* Title */}
          <h1 className="font-serif text-4xl md:text-5xl mb-6 text-gray-900 tracking-tight leading-tight">
            {post.title}
          </h1>

          {/* Tags */}
          {post.tags.length > 0 && (
            <div className="mb-8 flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 bg-gold-50 text-gold-700 rounded-full text-xs tracking-[0.1em] uppercase"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Featured Image */}
          {post.image && (
            <div className="mb-12 relative aspect-[16/9] rounded-lg overflow-hidden bg-gray-100">
              <Image
                src={post.image.url}
                alt={post.image.alt}
                fill
                className="object-cover"
                priority
                sizes="(max-width: 768px) 100vw, 1200px"
              />
            </div>
          )}

          {/* Content */}
          <div
            className="prose prose-lg max-w-none prose-headings:font-serif prose-headings:text-gray-900 prose-p:text-gray-700 prose-a:text-gold-600 prose-a:no-underline hover:prose-a:underline prose-img:rounded-lg"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />

          {/* Questions This Post Answers (AI-Friendly) */}
          {post.schema.questionsAnswered.length > 0 && (
            <div className="mt-12 p-6 bg-gold-50 rounded-lg border border-gold-100">
              <h2 className="font-serif text-xl text-gray-900 mb-4">What This Article Covers</h2>
              <ul className="space-y-2">
                {post.schema.questionsAnswered.map((question, idx) => (
                  <li key={idx} className="text-gray-700 flex items-start">
                    <svg className="w-5 h-5 mr-2 mt-0.5 text-gold-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {question}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Share Section */}
          <div className="mt-12 pt-8 border-t border-gray-200">
            <h3 className="font-serif text-lg text-gray-900 mb-4">Share This Article</h3>
            <div className="flex gap-4">
              <a
                href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}&url=${encodeURIComponent(`https://party-on-delivery.com/blogs/news/${post.slug}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
              >
                Share on Twitter
              </a>
              <a
                href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(`https://party-on-delivery.com/blogs/news/${post.slug}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
              >
                Share on Facebook
              </a>
            </div>
          </div>
        </article>

        {/* Related Posts */}
        {relatedPosts.length > 0 && (
          <section className="bg-gray-50 py-16">
            <div className="container mx-auto px-4 max-w-6xl">
              <h2 className="font-serif text-3xl text-gray-900 mb-8 tracking-tight">Related Articles</h2>
              <div className="grid md:grid-cols-3 gap-8">
                {relatedPosts.map((relatedPost) => (
                  <Link
                    key={relatedPost.slug}
                    href={`/blogs/news/${relatedPost.slug}`}
                    className="group bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                  >
                    {relatedPost.image && (
                      <div className="relative aspect-[16/9] bg-gray-200">
                        <Image
                          src={relatedPost.image.url}
                          alt={relatedPost.image.alt}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                          sizes="(max-width: 768px) 100vw, 400px"
                        />
                      </div>
                    )}
                    <div className="p-6">
                      <h3 className="font-serif text-lg text-gray-900 mb-2 group-hover:text-gold-600 transition-colors">
                        {relatedPost.title}
                      </h3>
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {relatedPost.excerpt}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

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
    </>
  );
}
