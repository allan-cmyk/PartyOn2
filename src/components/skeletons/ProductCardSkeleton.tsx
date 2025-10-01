export default function ProductCardSkeleton() {
  return (
    <div className="bg-white border border-gray-200 animate-pulse">
      {/* Image Skeleton */}
      <div className="aspect-square bg-gray-200" />

      {/* Content Skeleton */}
      <div className="p-3">
        {/* Title */}
        <div className="h-4 bg-gray-200 rounded mb-2 w-3/4" />
        <div className="h-4 bg-gray-200 rounded mb-2 w-1/2" />

        {/* Vendor */}
        <div className="h-3 bg-gray-200 rounded mb-3 w-1/3" />

        {/* Price */}
        <div className="h-5 bg-gray-200 rounded mb-2 w-1/4" />

        {/* Button */}
        <div className="h-8 bg-gray-200 rounded w-full" />
      </div>
    </div>
  );
}

export function ProductCardSkeletonGrid({ count = 12 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </>
  );
}