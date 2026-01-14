'use client';

export default function CarCardSkeleton() {
  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      {/* Image Skeleton */}
      <div className="relative aspect-4/3 bg-gray-200 animate-pulse">
        <div className="w-full h-full bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer" />
        
        {/* Pagination dots skeleton */}
        <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex gap-1.5 z-10">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="w-1.5 h-1.5 rounded-full bg-gray-300 animate-pulse"
            />
          ))}
        </div>
      </div>

      {/* Content Skeleton */}
      <div className="p-4">
        {/* Title skeleton */}
        <div className="h-5 bg-gray-200 rounded animate-pulse mb-3" />
        <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse mb-3" />

        {/* Details skeleton */}
        <div className="space-y-2 mb-4">
          <div className="h-3 bg-gray-200 rounded w-5/6 animate-pulse" />
          <div className="h-3 bg-gray-200 rounded w-4/5 animate-pulse" />
          <div className="h-3 bg-gray-200 rounded w-3/4 animate-pulse" />
        </div>

        {/* Price skeleton */}
        <div className="h-6 bg-gray-200 rounded w-1/3 animate-pulse mb-4" />

        {/* Buttons skeleton */}
        <div className="flex gap-2">
          <div className="flex-1 h-9 bg-gray-200 rounded animate-pulse" />
          <div className="flex-1 h-9 bg-gray-200 rounded animate-pulse" />
        </div>
      </div>
    </div>
  );
}
