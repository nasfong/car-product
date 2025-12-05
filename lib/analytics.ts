// Google Analytics utility functions

// Declare gtag function type
declare global {
  interface Window {
    gtag: (
      command: 'config' | 'event' | 'set',
      targetId: string,
      config?: Record<string, any>
    ) => void;
    dataLayer: any[];
  }
}

// Track custom events
export const trackEvent = (
  eventName: string,
  properties?: Record<string, any>
) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventName, properties);
  }
};

// Track page views
export const trackPageView = (url: string) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('config', process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID!, {
      page_path: url,
    });
  }
};

// Custom event helpers for your car website
export const analytics = {
  // Car events
  carViewed: (carId: string, carName: string, price: number) => {
    trackEvent('car_viewed', {
      car_id: carId,
      car_name: carName,
      price: price,
      currency: 'USD',
    });
  },

  // Contact events
  contactClicked: (method: 'telegram' | 'phone', carId: string, carName: string) => {
    trackEvent('contact_clicked', {
      contact_method: method,
      car_id: carId,
      car_name: carName,
    });
  },

  // Media events
  imageGalleryOpened: (carId: string, imageCount: number, hasVideo: boolean) => {
    trackEvent('image_gallery_opened', {
      car_id: carId,
      image_count: imageCount,
      has_video: hasVideo,
    });
  },

  videoPlayed: (carId: string) => {
    trackEvent('video_played', {
      car_id: carId,
    });
  },

  imageZoomed: (carId: string) => {
    trackEvent('image_zoomed', {
      car_id: carId,
    });
  },

  // TikTok events
  tiktokClicked: (carId: string) => {
    trackEvent('tiktok_clicked', {
      car_id: carId,
    });
  },

  // Admin events (optional - only track if needed)
  carAdded: (carId: string) => {
    trackEvent('car_added', {
      car_id: carId,
    });
  },

  carEdited: (carId: string) => {
    trackEvent('car_edited', {
      car_id: carId,
    });
  },

  carDeleted: (carId: string) => {
    trackEvent('car_deleted', {
      car_id: carId,
    });
  },
};
