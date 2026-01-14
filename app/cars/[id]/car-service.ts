import "server-only";
import { headers } from "next/headers";

export interface Car {
  id: string;
  name: string;
  price: number;
  transmission: string;
  fuelType: string;
  images: string[];
  videos: string[];
  tiktokUrl?: string;
  location: string;
  description?: string;
  vehicleType?: string;
  color?: string;
  papers?: string;
  status: number;
  createdAt: string;
}

const DEFAULT_BASE_URL = "http://localhost:3000";

async function getHostFromHeaders(): Promise<string | null> {
  try {
    const headerList = await headers();
    const forwardedHost = headerList.get("x-forwarded-host");
    const host = forwardedHost || headerList.get("host");
    if (!host) {
      return null;
    }

    const proto = headerList.get("x-forwarded-proto") || "https";
    return `${proto}://${host}`;
  } catch (error) {
    return null;
  }
}

function normalizeUrl(url: string): string {
  return url.replace(/\/$/, "");
}

export async function getBaseUrl(): Promise<string> {
  const configuredBaseUrl = process.env.NEXT_PUBLIC_BASE_URL;
  if (configuredBaseUrl) {
    return normalizeUrl(configuredBaseUrl);
  }

  const originFromHeaders = await getHostFromHeaders();
  if (originFromHeaders) {
    return normalizeUrl(originFromHeaders);
  }

  return DEFAULT_BASE_URL;
}

export async function resolveCarImageUrl(imagePath?: string): Promise<string | null> {
  if (!imagePath) {
    return null;
  }

  if (/^https?:\/\//i.test(imagePath)) {
    return imagePath;
  }

  const cleanedPath = imagePath.replace(/^\/+/, "");
  const minioPublicUrl = process.env.MINIO_PUBLIC_URL
    ? normalizeUrl(process.env.MINIO_PUBLIC_URL)
    : null;

  if (minioPublicUrl) {
    return `${minioPublicUrl}/${cleanedPath}`;
  }

  const baseUrl = await getBaseUrl();
  return `${baseUrl}/${cleanedPath}`;
}

export async function getCar(id: string): Promise<Car | null> {
  try {
    const baseUrl = await getBaseUrl();
    const response = await fetch(`${baseUrl}/api/cars/${id}`, {
      cache: "no-store",
    });

    if (!response.ok) {
      return null;
    }

    return response.json();
  } catch (error) {
    console.error("Error fetching car:", error);
    return null;
  }
}
