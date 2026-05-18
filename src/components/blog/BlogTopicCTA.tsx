import Link from 'next/link';
import type { ReactElement } from 'react';
import { getBlogCta } from '@/data/blog-topic-routing';

interface BlogTopicCTAProps {
  slug: string;
}

/**
 * Renders a topic-aware CTA card at the end of a blog post body.
 *
 * Looks up the post's slug in src/data/blog-topic-routing.ts to pick
 * the right heading, body, button text, and destination href.
 * Falls back to the GENERIC CTA pointing at /order for unmapped slugs.
 */
export default function BlogTopicCTA({ slug }: BlogTopicCTAProps): ReactElement {
  const cta = getBlogCta(slug);
  return (
    <section className="my-12 rounded-xl bg-gray-50 p-8 md:p-10">
      <h3 className="font-heading text-2xl tracking-[0.1em] text-gray-900 mb-3">
        {cta.heading}
      </h3>
      <p className="text-base text-gray-700 mb-6 leading-relaxed">
        {cta.body}
      </p>
      <Link href={cta.href} className="btn-primary inline-block">
        {cta.buttonText} →
      </Link>
    </section>
  );
}
