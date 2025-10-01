export default function MobileProductCardSkeleton() {
  return (
    <div className="bg-white border border-gray-200 animate-pulse">
      {/* Image Skeleton */}
      <div className="aspect-square bg-gray-200" />

      {/* Content Skeleton */}
      <div className="p-2">
        {/* Title */}
        <div className="h-3 bg-gray-200 rounded mb-1.5 w-full" />
        <div className="h-3 bg-gray-200 rounded mb-2 w-2/3" />

        {/* Price */}
        <div className="h-4 bg-gray-200 rounded mb-2 w-1/3" />

        {/* Button */}
        <div className="h-7 bg-gray-200 rounded w-full" />
      </div>
    </div>
  );
}

export function MobileProductCardSkeletonGrid({ count = 6 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <MobileProductCardSkeleton key={i} />
      ))}
    </>
  );
}