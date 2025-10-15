'use client'

import { MDXRemote, MDXRemoteSerializeResult } from 'next-mdx-remote'
import Image from 'next/image'

interface MDXContentProps {
  source: MDXRemoteSerializeResult
}

// Custom components for MDX rendering
const components = {
  // Custom image component
  img: (props: React.ImgHTMLAttributes<HTMLImageElement>) => {
    if (!props.src) return null

    return (
      <div className="my-8">
        <img
          src={props.src}
          alt={props.alt || ''}
          className="w-full h-auto rounded-lg"
          loading="lazy"
        />
      </div>
    )
  },

  // Custom heading components with styling
  h1: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h1 className="font-serif text-4xl md:text-5xl text-gray-900 mb-6 mt-12 tracking-[0.1em]" {...props} />
  ),
  h2: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h2 className="font-serif text-3xl md:text-4xl text-gray-900 mb-4 mt-10 tracking-[0.1em]" {...props} />
  ),
  h3: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h3 className="font-serif text-2xl md:text-3xl text-gray-900 mb-3 mt-8 tracking-[0.1em]" {...props} />
  ),

  // Paragraph styling
  p: (props: React.HTMLAttributes<HTMLParagraphElement>) => (
    <p className="text-gray-700 text-lg leading-relaxed mb-6" {...props} />
  ),

  // List styling
  ul: (props: React.HTMLAttributes<HTMLUListElement>) => (
    <ul className="list-disc list-inside text-gray-700 text-lg space-y-2 mb-6 ml-4" {...props} />
  ),
  ol: (props: React.OlHTMLAttributes<HTMLOListElement>) => (
    <ol className="list-decimal list-inside text-gray-700 text-lg space-y-2 mb-6 ml-4" {...props} />
  ),
  li: (props: React.LiHTMLAttributes<HTMLLIElement>) => (
    <li className="text-gray-700" {...props} />
  ),

  // Link styling
  a: (props: React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
    <a className="text-gold-600 hover:text-gold-700 underline" {...props} />
  ),

  // Blockquote styling
  blockquote: (props: React.BlockquoteHTMLAttributes<HTMLQuoteElement>) => (
    <blockquote className="border-l-4 border-gold-500 pl-6 py-2 my-6 italic text-gray-700" {...props} />
  ),

  // Code styling
  code: (props: React.HTMLAttributes<HTMLElement>) => (
    <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono text-gray-800" {...props} />
  ),
  pre: (props: React.HTMLAttributes<HTMLPreElement>) => (
    <pre className="bg-gray-100 p-4 rounded-lg overflow-x-auto mb-6" {...props} />
  ),
}

export default function MDXContent({ source }: MDXContentProps) {
  return (
    <div className="prose prose-lg max-w-none">
      <MDXRemote {...source} components={components} />
    </div>
  )
}
