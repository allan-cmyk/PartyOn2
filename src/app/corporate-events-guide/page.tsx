import { Metadata } from 'next'
import { MDXRemote } from 'next-mdx-remote/rsc'
import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import Link from 'next/link'
import OldFashionedNavigation from '@/components/OldFashionedNavigation'
import Footer from '@/components/Footer'
import CorporateEventCalculator from '@/components/CorporateEventCalculator'

// MDX components that can be used in the content
const components = {
  CorporateEventCalculator,
  h1: (props: React.HTMLAttributes<HTMLHeadingElement>) => <h1 className="font-serif text-4xl md:text-5xl font-light text-gray-900 mb-6 tracking-[0.1em]" {...props} />,
  h2: (props: React.HTMLAttributes<HTMLHeadingElement>) => <h2 className="font-serif text-3xl md:text-4xl font-light text-gray-900 mt-12 mb-4 tracking-[0.08em]" {...props} />,
  h3: (props: React.HTMLAttributes<HTMLHeadingElement>) => <h3 className="font-serif text-2xl md:text-3xl font-light text-gray-900 mt-8 mb-3 tracking-[0.06em]" {...props} />,
  p: (props: React.HTMLAttributes<HTMLParagraphElement>) => <p className="text-gray-700 leading-relaxed mb-4" {...props} />,
  ul: (props: React.HTMLAttributes<HTMLUListElement>) => <ul className="list-disc list-inside space-y-2 mb-4 text-gray-700" {...props} />,
  ol: (props: React.HTMLAttributes<HTMLOListElement>) => <ol className="list-decimal list-inside space-y-2 mb-4 text-gray-700" {...props} />,
  li: (props: React.HTMLAttributes<HTMLLIElement>) => <li className="ml-4" {...props} />,
  a: (props: React.AnchorHTMLAttributes<HTMLAnchorElement>) => <a className="text-gold-600 hover:underline" {...props} />,
  strong: (props: React.HTMLAttributes<HTMLElement>) => <strong className="font-semibold text-gray-900" {...props} />,
  blockquote: (props: React.BlockquoteHTMLAttributes<HTMLQuoteElement>) => <blockquote className="border-l-4 border-gold-600 pl-4 italic text-gray-600 my-6" {...props} />,
}

export const metadata: Metadata = {
  title: 'The Complete Guide to Corporate & Company Events in Austin, Texas',
  description: 'The ultimate resource for planning corporate events in Austin. Learn about venue selection, catering, team building, budgets, and professional bar service for company gatherings of any size.',
  keywords: ['Austin corporate event planning', 'corporate events Austin', 'company party planning', 'business event venues Austin', 'corporate catering Austin', 'team building activities Austin'],
  openGraph: {
    title: 'The Complete Guide to Corporate & Company Events in Austin, Texas',
    description: 'The ultimate resource for planning corporate events in Austin.',
    images: ['/images/hero/lake-travis-yacht-sunset.webp'],
  },
}

async function getCorporateGuideContent() {
  const filePath = path.join(process.cwd(), 'content', 'blog', 'posts', 'corporate-events-austin-guide.mdx')
  const fileContent = fs.readFileSync(filePath, 'utf8')
  const { data, content } = matter(fileContent)

  return {
    frontmatter: data,
    content
  }
}

export default async function CorporateEventsGuidePage() {
  const { frontmatter, content } = await getCorporateGuideContent()

  return (
    <div className="bg-white">
      <OldFashionedNavigation />

      {/* Hero Section */}
      <section className="relative h-[60vh] min-h-[400px] flex items-center justify-center overflow-hidden">
        <img
          src={frontmatter.image || '/images/hero/lake-travis-yacht-sunset.webp'}
          alt={frontmatter.title}
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-gray-900/70 via-gray-900/50 to-gray-900/70" />

        <div className="relative z-10 text-center text-white max-w-5xl mx-auto px-8">
          <h1 className="font-serif font-light text-4xl md:text-6xl mb-4 tracking-[0.15em]">
            {frontmatter.title}
          </h1>
          <div className="w-24 h-px bg-gold-400 mx-auto mb-4" />
          <p className="text-xl text-gray-200 max-w-3xl mx-auto">
            {frontmatter.excerpt}
          </p>
          <div className="mt-6 text-sm text-gray-300">
            {frontmatter.author} • {new Date(frontmatter.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </div>
        </div>
      </section>

      {/* Content */}
      <article className="max-w-4xl mx-auto px-8 py-16">
        <div className="prose prose-lg max-w-none">
          <MDXRemote source={content} components={components} />
        </div>

        {/* CTA Section */}
        <div className="mt-16 p-8 bg-gray-50 border-2 border-gray-200">
          <h3 className="font-serif text-3xl text-gray-900 mb-4 text-center tracking-[0.08em]">
            Ready to Plan Your Corporate Event?
          </h3>
          <p className="text-gray-700 text-center mb-6">
            Let Party On Delivery handle your event alcohol delivery and coordination. Professional service for corporate events of any size.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/order-now"
              className="bg-gold-600 text-white px-8 py-4 text-center tracking-[0.15em] hover:bg-gold-700 transition-colors font-medium"
            >
              GET A QUOTE
            </Link>
            <Link
              href="/contact"
              className="border-2 border-gray-900 text-gray-900 px-8 py-4 text-center tracking-[0.15em] hover:bg-gray-900 hover:text-white transition-colors font-medium"
            >
              CONTACT US
            </Link>
          </div>
        </div>
      </article>

      <Footer />
    </div>
  )
}
