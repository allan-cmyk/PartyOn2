'use client';

import PartnerCard from './PartnerCard';
import ScrollRevealCSS from '@/components/ui/ScrollRevealCSS';
import type { Partner, PartnerCategory } from '@/lib/partners/types';
import { PARTNER_CATEGORIES, getCategoryById } from '@/lib/partners/types';

interface PartnerGridProps {
  partners: Partner[];
  activeCategory: PartnerCategory | 'all';
}

export default function PartnerGrid({ partners, activeCategory }: PartnerGridProps) {
  // If viewing all categories, group by category
  if (activeCategory === 'all') {
    return (
      <div className="space-y-16">
        {PARTNER_CATEGORIES.map((category) => {
          const categoryPartners = partners.filter(
            (p) => p.category === category.id
          );

          if (categoryPartners.length === 0) return null;

          return (
            <section key={category.id} id={category.id} className="scroll-mt-32">
              <ScrollRevealCSS duration={600} y={20}>
                <div className="mb-8">
                  <h2 className="font-serif text-3xl text-gray-900 tracking-[0.1em] mb-2">
                    {category.name}
                  </h2>
                  <div className="w-16 h-0.5 bg-gold-600 mb-3" />
                  <p className="text-gray-600">{category.description}</p>
                </div>
              </ScrollRevealCSS>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {categoryPartners
                  .sort((a, b) => (a.order || 999) - (b.order || 999))
                  .map((partner, index) => (
                    <ScrollRevealCSS
                      key={partner.id}
                      duration={600}
                      delay={index * 100}
                      y={20}
                    >
                      <PartnerCard partner={partner} />
                    </ScrollRevealCSS>
                  ))}
              </div>
            </section>
          );
        })}
      </div>
    );
  }

  // Filtered view - single category
  const categoryInfo = getCategoryById(activeCategory);
  const filteredPartners = partners.filter((p) => p.category === activeCategory);

  return (
    <section>
      <ScrollRevealCSS duration={600} y={20}>
        <div className="mb-8">
          <h2 className="font-serif text-3xl text-gray-900 tracking-[0.1em] mb-2">
            {categoryInfo?.name || activeCategory}
          </h2>
          <div className="w-16 h-0.5 bg-gold-600 mb-3" />
          <p className="text-gray-600">
            {categoryInfo?.description || ''}
          </p>
        </div>
      </ScrollRevealCSS>

      {filteredPartners.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredPartners
            .sort((a, b) => (a.order || 999) - (b.order || 999))
            .map((partner, index) => (
              <ScrollRevealCSS
                key={partner.id}
                duration={600}
                delay={index * 100}
                y={20}
              >
                <PartnerCard partner={partner} />
              </ScrollRevealCSS>
            ))}
        </div>
      ) : (
        <div className="text-center py-12 text-gray-500">
          <p>No partners in this category yet. Check back soon!</p>
        </div>
      )}
    </section>
  );
}
