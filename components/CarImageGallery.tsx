"use client";

import { useState } from 'react';
import Image from 'next/image';
import Lightbox from "yet-another-react-lightbox";
import Thumbnails from "yet-another-react-lightbox/plugins/thumbnails";
import Zoom from "yet-another-react-lightbox/plugins/zoom";
import "yet-another-react-lightbox/styles.css";
import "yet-another-react-lightbox/plugins/thumbnails.css";

interface CarImageGalleryProps {
  images: string[];
  videos?: string[];
  carName: string;
}

export default function CarImageGallery({ images, videos = [], carName }: CarImageGalleryProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Combine images and videos into slides
  const slides = [
    ...images.map((image) => ({
      src: image,
      alt: carName,
      type: 'image'
    })),
    ...videos.map((video) => ({
      src: video,
      alt: `${carName} - Video`,
      type: 'video'
    }))
  ];

  // Handle video auto-play when slide changes
  const handleSlideChange = ({ index }: { index: number }) => {
    setCurrentIndex(index);

    // Pause all videos first
    setTimeout(() => {
      const allVideos = document.querySelectorAll('.yarl__slide video') as NodeListOf<HTMLVideoElement>;
      allVideos.forEach(video => {
        video.pause();
      });

      // Auto-play video only if current slide is a video
      if (slides[index]?.type === 'video') {
        const currentVideo = document.querySelector('.yarl__slide video') as HTMLVideoElement;
        if (currentVideo) {
          currentVideo.play().catch(() => {
            // Handle auto-play restrictions
          });
        }
      }
    }, 100);
  };

  const openLightbox = (index: number) => {
    setCurrentIndex(index);
    setLightboxOpen(true);
  };

  return (
    <div className="space-y-4">
      {/* Main Media Display */}
      <div
        className="relative aspect-4/3 bg-gray-200 rounded-xl overflow-hidden cursor-pointer group"
        onClick={() => openLightbox(0)}
      >
        {slides[0]?.type === 'video' ? (
          // Video main display
          <>
            <video
              src={slides[0].src}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              muted
              preload="metadata"
            />
            {/* Play Icon Overlay for Video */}
            <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
              <div className="bg-white/90 rounded-full p-4 group-hover:bg-white transition-colors duration-300">
                <svg className="w-12 h-12 text-gray-800" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
            </div>
          </>
        ) : (
          // Image main display
          <>
            <Image
              src={slides[0]?.src || '/placeholder-car.jpg'}
              alt={`${carName} - Main Image`}
              fill
              className="object-cover"
              priority
              sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 600px"
              quality={80}
            />
            {/* Zoom Icon Overlay for Image */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
              <svg
                className="w-16 h-16 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" />
              </svg>
            </div>
          </>
        )}
        {/* Media Counter Badge */}
        {slides.length > 1 && (
          <div className="absolute bottom-4 right-4 bg-black/70 text-white text-sm px-3 py-1.5 rounded-lg flex items-center gap-2">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
            </svg>
            {images.length} រូបភាព {videos.length > 0 && `+ ${videos.length} វីដេអូ`}
          </div>
        )}
      </div>

      {/* Media Thumbnails */}
      {slides.length > 1 && (
        <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-2">
          {slides.slice(1, 7).map((slide, index) => (
            <button
              key={index}
              onClick={() => openLightbox(index + 1)}
              className="relative aspect-square rounded-lg overflow-hidden border-2 border-gray-200 hover:border-blue-500 transition-colors cursor-pointer group"
              onMouseEnter={(e) => {
                // Auto-play video on hover from the middle
                if (slide.type === 'video') {
                  const video = e.currentTarget.querySelector('video') as HTMLVideoElement;
                  if (video) {
                    // Start from 50% of video duration (e.g., 16s for 33s video)
                    video.currentTime = video.duration * 0.5;
                    video.play().catch(() => {});
                  }
                }
              }}
              onMouseLeave={(e) => {
                // Pause video when mouse leaves and reset to middle
                if (slide.type === 'video') {
                  const video = e.currentTarget.querySelector('video') as HTMLVideoElement;
                  if (video) {
                    video.pause();
                    video.currentTime = video.duration * 0.5; // Reset to middle
                  }
                }
              }}
            >
              {slide.type === 'video' ? (
                // Video thumbnail that plays on hover
                <>
                  <video
                    src={slide.src}
                    className="w-full h-full object-cover"
                    muted
                    playsInline
                    preload="none"
                    onLoadedMetadata={(e) => {
                      // Set initial position to middle of video when metadata loads
                      const video = e.currentTarget;
                      video.currentTime = video.duration * 0.5;
                    }}
                  />
                  {/* Play Icon Overlay - shown when not hovering */}
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center group-hover:opacity-0 transition-opacity duration-300">
                    <div className="bg-white/90 rounded-full p-2">
                      <svg className="w-4 h-4 text-gray-800" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z"/>
                      </svg>
                    </div>
                  </div>
                </>
              ) : (
                // Image thumbnail
                <Image
                  src={slide.src}
                  alt={`${carName} - Thumbnail ${index + 2}`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 80px, 120px"
                  quality={70}
                  loading="lazy"
                />
              )}
              {/* Hover Overlay */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
            </button>
          ))}

          {/* "View All" button if more than 7 slides */}
          {slides.length > 8 && (
            <button
              onClick={() => openLightbox(7)}
              className="relative aspect-square rounded-lg overflow-hidden border-2 border-gray-200 hover:border-blue-500 transition-colors cursor-pointer bg-black/70 flex items-center justify-center"
            >
              <div className="text-center text-white">
                <svg className="w-6 h-6 mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="text-xs font-medium">+{slides.length - 7}</span>
              </div>
            </button>
          )}
        </div>
      )}

      {/* Lightbox */}
      <Lightbox
        open={lightboxOpen}
        close={() => setLightboxOpen(false)}
        slides={slides.map(slide => {
          if (slide.type === 'video') {
            // For video slides, we'll handle them in the custom render function
            return {
              src: slide.src,
              alt: `Video ${slides.indexOf(slide) + 1}`,
              width: 1920,
              height: 1080
            };
          }
          return {
            src: slide.src,
            alt: slide.alt
          };
        })}
        index={currentIndex}
        plugins={[Thumbnails, Zoom]}
        thumbnails={{
          position: "bottom",
          width: 120,
          height: 80,
          border: 2,
          borderRadius: 4,
          padding: 4,
          gap: 16,
        }}
        on={{
          view: handleSlideChange,
        }}
        carousel={{
          finite: false,
        }}
        animation={{
          fade: 300,
          swipe: 300,
        }}
        controller={{
          closeOnBackdropClick: true,
        }}
        zoom={{
          maxZoomPixelRatio: 3,
          zoomInMultiplier: 2,
          doubleTapDelay: 300,
          doubleClickDelay: 300,
          doubleClickMaxStops: 2,
          keyboardMoveDistance: 50,
          wheelZoomDistanceFactor: 100,
          pinchZoomDistanceFactor: 100,
          scrollToZoom: true,
        }}
        styles={{
          container: {
            backgroundColor: "rgba(0, 0, 0, 0.8)",
          },
          thumbnailsContainer: {
            backgroundColor: "rgba(0, 0, 0, 0.8)",
            borderTop: "1px solid rgba(255, 255, 255, 0.1)",
          },
          thumbnail: {
            backgroundColor: "rgba(255, 255, 255, 0.1)",
            border: "1px solid rgba(255, 255, 255, 0.2)",
          },
        }}
        render={{
          slide: ({ slide }) => {
            // Find the corresponding slide in our internal array to check if it's a video
            const slideIndex = slides.findIndex(s => s.src === slide.src);
            const internalSlide = slides[slideIndex];

            if (internalSlide && internalSlide.type === 'video') {
              return (
                <div className="yarl__slide">
                  <video
                    src={slide.src}
                    controls
                    loop
                    muted={false}
                    playsInline
                    className="w-full h-full object-contain"
                    style={{
                      maxWidth: '100%',
                      maxHeight: '100%',
                    }}
                    onLoadedData={(e) => {
                      // Auto-play when video is loaded and is the current slide
                      const video = e.currentTarget;
                      if (slideIndex === currentIndex) {
                        video.play().catch(() => {
                          // Handle auto-play restrictions
                        });
                      }
                    }}
                  />
                </div>
              );
            }
            return undefined; // Use default rendering for images
          },
        }}
      />
    </div>
  );
}
