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
    username: "NasFong",
    url: (message: string) => `https://t.me/${CONTACT.telegram.username}?text=${encodeURIComponent(message)}`,
  },
  // Add more contact methods as needed
  // phone: "+1234567890",
  // email: "contact@example.com",
  // whatsapp: "+1234567890",
} as const;


