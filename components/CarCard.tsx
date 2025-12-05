import Image from "next/image";
import { Car } from "@/lib/types";
import { memo } from "react";

interface CarCardProps {
  car: Car;
  isAuthenticated: boolean;
  onEdit: (carId: string) => void;
  onDelete: (carId: string, carName: string) => void;
}
function CarCard({ car, isAuthenticated, onEdit, onDelete }: CarCardProps) {
  return (
    <div
      className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-all duration-200 cursor-pointer group relative"
      onClick={() => window.location.href = `/cars/${car.id}`}
    >
      {/* Sold Badge - Top Right Corner */}
      {car.sold && (
        <div className="absolute top-3 right-[-25] z-10">
          <div className="bg-red-500 text-white text-sm sm:text-base px-12 sm:px-12 py-1.5 sm:py-2 font-bold transform rotate-30 shadow-xl">
            លក់រួចហើយ
          </div>
        </div>
      )}

      {/* Car Image */}
      <div className="relative aspect-4/3 bg-gray-200">
        <Image
          src={car.images[0] || '/placeholder-car.jpg'}
          alt={car.name}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-200"
        />
        {/* Image Count Badge */}
        {car.images.length > 1 && (
          <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
            </svg>
            {car.images.length}
          </div>
        )}
      </div>

      {/* Car Info */}
      <div className="p-4">
        {/* Title */}
        <h4 className="font-semibold text-gray-900 mb-2 text-base line-clamp-2 group-hover:text-blue-600 transition-colors">
          {car.name}
        </h4>

        {/* Condition */}
        <div className="flex items-center gap-2 mb-3">
          <span className="bg-gray-100 text-gray-700 text-xs font-medium px-2 py-1 rounded">
            {car.condition}
          </span>
        </div>

        {/* Location */}
        <div className="flex items-center gap-1 mb-2">
          <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span className="text-xs text-gray-600 line-clamp-1">{car.location}</span>
        </div>

        {/* Additional Details */}
        <div className="space-y-1 mb-3">
          {car.color && (
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full border border-gray-300 bg-gradient-to-r from-gray-200 to-gray-300"></div>
              <span className="text-xs text-gray-600">ពណ៌: {car.color}</span>
            </div>
          )}
          {car.papers && (
            <div className="flex items-center gap-1">
              <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span className="text-xs text-gray-600 line-clamp-1">ឯកសារ: {car.papers}</span>
            </div>
          )}
        </div>

        {/* Price */}
        <div className="mb-4">
          <span className="text-lg font-bold text-green-600">
            ${car.price.toLocaleString()}
          </span>
        </div>

        {/* Admin buttons - mobile-friendly */}
        {isAuthenticated && (
          <div className="flex gap-2">
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
              className="flex items-center justify-center gap-1 bg-red-100 text-red-700 px-3 py-2 rounded-md hover:bg-red-200 transition-colors font-medium text-sm min-h-9 min-w-[60px] touch-manipulation"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              <span className="hidden sm:inline">Delete</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default memo(CarCard);