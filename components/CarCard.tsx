'use client';

/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { Car } from "@/lib/types";
import { memo, useState, useCallback } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface CarCardProps {
  car: Car;
  isAuthenticated: boolean;
  onEdit: (carId: string) => void;
  onDelete: (carId: string, carName: string) => void;
  isDragging?: boolean;
  showDragHandle?: boolean;
  isOverlay?: boolean;
}
function CarCard({ car, isAuthenticated, onEdit, onDelete, isDragging = false, showDragHandle = false, isOverlay = false }: CarCardProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [maxImageIndex, setMaxImageIndex] = useState(0);

  // Scroll handler to update current image index
  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const scrollLeft = e.currentTarget.scrollLeft;
    const itemWidth = e.currentTarget.offsetWidth;
    const newIndex = Math.round(scrollLeft / itemWidth);

    // Only update if index changed
    if (newIndex !== currentImageIndex && newIndex >= 0 && newIndex < car.images.length) {
      setCurrentImageIndex(newIndex);
      // Track the maximum index reached
      setMaxImageIndex(prev => Math.max(prev, newIndex));
    }
  }, [currentImageIndex, car.images.length]);

  // Always call useSortable to comply with React Hooks rules
  const sortable = useSortable({ id: car.id });

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
    isSorting,
  } = sortable;

  const shouldUseSortable = showDragHandle && !isOverlay;

  const style = shouldUseSortable
    ? {
      transform: CSS.Transform.toString(transform),
      transition,
      opacity: isDragging || isSortableDragging ? 0.5 : 1,
    }
    : {};

  // Apply drag props only when needed
  const dragProps = shouldUseSortable
    ? { ref: setNodeRef, style }
    : {};

  return (
    <div
      {...dragProps}
      className={`bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-all duration-200 group relative touch-manipulation ${isDragging || isSortableDragging ? 'shadow-xl ring-2 ring-blue-200' : ''} ${isOverlay ? 'pointer-events-none' : ''}`}
    >
      <Link href={`/cars/${car.id}`} className="block">
        <div
          className="cursor-pointer"
          onClick={(e) => {
            if (isDragging || isSortableDragging || isSorting) {
              e.preventDefault();
              return;
            }
          }}
        >
          {/* Drag Handle - Top Right Corner - Only render if needed */}
          {showDragHandle && !isOverlay && sortable && (
            <div
              {...attributes}
              {...listeners}
              className="absolute top-2 right-2 z-20 bg-gray-600/80 hover:bg-gray-700 text-white p-3 rounded-full cursor-pointer hover:cursor-grab active:cursor-grabbing touch-manipulation transition-all duration-200"
              style={{
                touchAction: 'none',
                WebkitTouchCallout: 'none',
                WebkitUserSelect: 'none',
                userSelect: 'none',
              }}
              onTouchStart={(e) => {
                e.stopPropagation();
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
              </svg>
            </div>
          )}

          {/* Status Badge - Top Right Corner */}
          {car.status === 3 && (
            <div className={`absolute top-3 z-10 ${showDragHandle ? '-right-6.25' : '-right-6.25'}`}>
              <div className="bg-red-500 text-white text-sm sm:text-base px-12 sm:px-12 py-1.5 sm:py-2 font-bold transform rotate-30 shadow-xl">
                លក់ចេញហើយ
              </div>
            </div>
          )}
          {car.status === 2 && (
            <div className={`absolute top-3 z-10 ${showDragHandle ? '-right-6.25' : '-right-6.25'}`}>
              <div className="bg-blue-700 text-white text-sm sm:text-base px-12 sm:px-12 py-1.5 sm:py-2 font-bold transform rotate-30 shadow-xl">
                កំពុងរៀបចំ
              </div>
            </div>
          )}

          {/* Car Image - Swipeable Gallery */}
          <div className="relative aspect-4/3 bg-gray-200">
            {/* Scrollable Image Container */}
            <div
              className="w-full h-full overflow-x-auto snap-x snap-mandatory scrollbar-hide flex"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              onScroll={handleScroll}
            >
              {car.images.map((image, index) => {
                // Render images up to the maximum index reached (keeps downloaded images)
                const shouldRender = index <= maxImageIndex + 1; // +1 to preload next image

                return (
                  <div key={index} className="w-full h-full shrink-0 snap-center relative">
                    {shouldRender ? (
                      <img
                        src={image}
                        alt={`${car.name} - Image ${index + 1}`}
                        className="object-cover pointer-events-none w-full h-full"
                        loading={index === 0 ? "eager" : "lazy"}
                        draggable={false}
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-300" />
                    )}
                  </div>
                );
              })}
            </div>

            {/* Pagination Dots */}
            {car.images.length > 1 && (
              <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex gap-1.5 z-10">
                {car.images.map((_, index) => (
                  <div
                    key={index}
                    className={`w-1.5 h-1.5 rounded-full transition-all ${index === currentImageIndex
                      ? 'bg-white w-4'
                      : 'bg-white/60'
                      }`}
                  />
                ))}
              </div>
            )}

            {/* Image Count Badge */}
            {car.images.length > 1 && (
              <div className="absolute top-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded flex items-center gap-1 z-10">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                </svg>
                {currentImageIndex + 1}/{car.images.length}
              </div>
            )}
          </div>

          {/* Car Info */}
          <div className="p-4">
            {/* Title */}
            <h4 className="font-semibold text-gray-900 mb-2 text-base line-clamp-2 group-hover:text-blue-600 transition-colors">
              {car.name}
            </h4>

            {/* Additional Details */}
            <div className="space-y-1 mb-3">
              {car.description && (
                <div className="flex items-start gap-1">
                  <svg className="w-3 h-3 text-gray-400 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span className="text-xs text-gray-600 line-clamp-2">{car.description}</span>
                </div>
              )}
              {car.color && (
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-full border border-gray-300 bg-linear-to-r from-gray-200 to-gray-300" />
                  <span className="text-xs text-gray-600">ពណ៌: {car.color}</span>
                </div>
              )}
              <div className="flex items-center gap-1">
                <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="text-xs text-gray-600 line-clamp-1">{car.location}</span>
              </div>
            </div>

            {/* Price */}
            <div className={`${isAuthenticated ? 'mb-4' : 'mb-4'}`}>
              <span className="text-lg font-bold text-green-600">
                {car.price}
              </span>
            </div>
          </div>
        </div>
      </Link>

      {/* Admin buttons - Outside Link but visually inside card */}
      {isAuthenticated && !isOverlay && (
        <div className="flex gap-2 px-4 mb-4">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(car.id);
            }}
            className="flex-1 flex items-center justify-center gap-1 bg-blue-100 text-blue-700 px-3 py-2 rounded-md hover:bg-blue-200 transition-colors font-medium text-sm min-h-9 touch-manipulation"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            <span className="hidden sm:inline">Edit</span>
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(car.id, car.name);
            }}
            className="flex items-center justify-center gap-1 bg-red-100 text-red-700 px-3 py-2 rounded-md hover:bg-red-200 transition-colors font-medium text-sm min-h-9 min-w-15 touch-manipulation"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            <span className="hidden sm:inline">Delete</span>
          </button>
        </div>
      )}
    </div>
  );
}

export default memo(CarCard);