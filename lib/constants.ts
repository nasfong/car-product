/**
 * Application Constants
 * 
 * This file contains all configuration values that might change later.
 * Update these values here instead of searching through multiple files.
 * 
 * Usage:
 * import { CONTACT } from "@/lib/constants";
 * const url = CONTACT.telegram.url("Hello!");
 */

// Contact Information
export const CONTACT = {
  telegram: {
    username: "zato_169",
    url: (message: string) => `https://t.me/${CONTACT.telegram.username}?text=${encodeURIComponent(message)}`,
  },
  phone: {
    primary: "097 6666 093",
    secondary: "097 7777 093",
  },
  // Add more contact methods as needed
  // email: "contact@example.com",
  // whatsapp: "+855 12 345 678",
} as const;

// Store Information
export const STORE = {
  name: {
    khmer: "សាតូ លក់ឡាន",
    english: "Zato Car Showroom",
    full: "ហាងលក់រថយន្ត - Zato Car Showroom",
    description: "ទទួលទិញ លក់ និង បង់រលស់រថយន្ត"
  },
  logo: "🚗", // You can replace this with an image path like "/logo.png"
  description: {
    khmer: "រថយន្តគុណភាពខ្ពស់ តម្លៃសមរម្យ",
    english: "Premium cars at reasonable prices",
    full: "រថយន្តគុណភាពខ្ពស់ តម្លៃសមរម្យ - Premium cars at reasonable prices",
  },
  copyright: "© 2025",
} as const;

// Authentication Credentials
// ⚠️ WARNING: In production, move these to environment variables
// and use proper authentication with hashed passwords
export const AUTH = {
  admin: {
    username: "admin",
    password: "admin123", // In production, use hashed passwords and env variables
    token: "admin-secret-token-2025", // In production, generate JWT tokens
  },
} as const;


