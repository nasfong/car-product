'use client'

import { useEffect, Suspense } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import Script from 'next/script'

declare global {
  interface Window {
    gtag: (...args: unknown[]) => void
  }
}

function GoogleAnalyticsContent() {
  const gaId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID
  const pathname = usePathname()
  const searchParams = useSearchParams()

  // Track page views on route changes
  useEffect(() => {
    if (!gaId || typeof window === 'undefined' || !window.gtag) {
      return
    }

    const url = pathname + (searchParams.toString() ? `?${searchParams.toString()}` : '')
    // Send page view event
    window.gtag('event', 'page_view', {
      page_path: url,
      page_title: document.title,
    })
  }, [pathname, searchParams, gaId])

  // Track client-side events
  useEffect(() => {
    if (!gaId || typeof window === 'undefined') {
      return
    }

    // Track when user interacts with page
    const handleClick = () => {
      if (window.gtag) {
        window.gtag('event', 'user_interaction', {
          timestamp: new Date().toISOString(),
        })
      }
    }

    // Track scroll events
    const handleScroll = () => {
      if (window.gtag) {
        const scrollPercent = Math.round(
          (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100
        )
        if (scrollPercent === 100) {
          window.gtag('event', 'page_scrolled', {
            scroll_depth_percent: scrollPercent,
          })
        }
      }
    }

    window.addEventListener('click', handleClick)
    window.addEventListener('scroll', handleScroll)

    return () => {
      window.removeEventListener('click', handleClick)
      window.removeEventListener('scroll', handleScroll)
    }
  }, [gaId])

  // Return early if GA ID is not configured
  if (!gaId) {
    return null
  }

  return (
    <>
      <Script
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
      />
      <Script
        id="google-analytics"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${gaId}', {
              'anonymize_ip': true,
              'allow_google_signals': true,
              'allow_ad_personalization_signals': true
            });
          `,
        }}
      />
    </>
  )
}

export default function GoogleAnalytics() {
  return (
    <Suspense fallback={null}>
      <GoogleAnalyticsContent />
    </Suspense>
  )
}
