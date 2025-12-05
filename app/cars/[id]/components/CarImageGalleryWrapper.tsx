"use client";

import dynamic from "next/dynamic";

const CarImageGallery = dynamic(() => import("@/components/CarImageGallery"), {
  loading: () => (
    <div className="relative aspect-4/3 bg-gray-200 rounded-xl overflow-hidden animate-pulse" />
  ),
  ssr: false,
});

interface CarImageGalleryWrapperProps {
  images: string[];
  videos: string[];
  carName: string;
}

export default function CarImageGalleryWrapper({ images, videos, carName }: CarImageGalleryWrapperProps) {
  return <CarImageGallery images={images} videos={videos} carName={carName} />;
}
