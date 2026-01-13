import type { Metadata } from "next";
import NextTopLoader from 'nextjs-toploader';
import { Geist, Geist_Mono, Noto_Sans_Khmer } from "next/font/google";
import "./globals.css";
import { STORE } from "@/lib/constants";
import GoogleAnalytics from "@/components/GoogleAnalytics";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const notoSansKhmer = Noto_Sans_Khmer({
  variable: "--font-khmer",
  subsets: ["khmer"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: STORE.name.full,
  description: STORE.description.full,
  icons: {
    icon: '/favicon.svg',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const publicUrl = process.env.MINIO_PUBLIC_URL;

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Open Graph meta tags for social sharing */}
        <meta property="og:title" content={STORE.name.full} />
        <meta property="og:description" content={STORE.description.full} />
        <meta property="og:image" content="/logo.png" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={typeof window !== 'undefined' ? window.location.href : ''} />
        <link rel="preconnect" href={publicUrl} />
        <link rel="dns-prefetch" href={publicUrl} />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${notoSansKhmer.variable} antialiased`}
        suppressHydrationWarning
      >
        <NextTopLoader />
        <GoogleAnalytics />
        {children}
      </body>
    </html>
  );
}
