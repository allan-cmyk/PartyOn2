'use client'

import { useState } from 'react'
import FeaturedKitCard from '@/components/gifts/FeaturedKitCard'
import ExpandableKitGrid from '@/components/ExpandableKitGrid'
import ProductModal from '@/components/ProductModal'
import { Product } from '@/lib/types'

interface CocktailKitsProductSectionProps {
  featuredKits: Product[]
  otherKits: Product[]
  kitSubheadlines: Record<string, string>
}

export default function CocktailKitsProductSection({
  featuredKits,
  otherKits,
  kitSubheadlines,
}: CocktailKitsProductSectionProps) {
  const [modalProduct, setModalProduct] = useState<Product | null>(null)

  const getKitSubheadline = (product: Product): string => {
    const titleLower = product.title.toLowerCase()
    for (const [key, subheadline] of Object.entries(kitSubheadlines)) {
      if (titleLower.includes(key)) return subheadline
    }
    return 'Premium cocktail kit with everything you need.'
  }

  const handleClickProduct = (product: Product) => {
    setModalProduct(product)
  }

  return (
    <>
      <div className="space-y-20 lg:space-y-28">
        {featuredKits.map((kit, index) => (
          <FeaturedKitCard
            key={kit.id}
            product={kit}
            imagePosition={index % 2 === 0 ? 'left' : 'right'}
            description={getKitSubheadline(kit)}
            onClickProduct={handleClickProduct}
          />
        ))}
      </div>

      {/* Secondary Grid - More Kits */}
      {otherKits.length > 0 && (
        <div className="mt-20">
          <h3 className="font-heading text-2xl sm:text-3xl text-gray-900 mb-8 text-center">
            More Cocktail Kits
          </h3>
          <ExpandableKitGrid kits={otherKits} onClickProduct={handleClickProduct} />
        </div>
      )}

      <ProductModal
        product={modalProduct}
        isOpen={modalProduct !== null}
        onClose={() => setModalProduct(null)}
      />
    </>
  )
}
