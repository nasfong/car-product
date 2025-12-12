import { Suspense } from "react";
import { cookies } from "next/headers";
import HomeClient from "@/components/HomeClient";
import { CONTACT, STORE } from "@/lib/constants";

// Server Component - fetches cars data
async function getCars() {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
    const response = await fetch(`${baseUrl}/api/cars`, {
      cache: 'no-store', // Always fetch fresh data
      next: { revalidate: 0 }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch cars');
    }

    const data = await response.json();
    return data || [];
  } catch (error) {
    console.error('Error fetching cars:', error);
    return [];
  }
}

// Check if user is authenticated on server
async function checkAuthentication() {
  const cookieStore = await cookies();
  const token = cookieStore.get('admin-token')?.value;

  // Simple token validation - match with middleware logic
  const validTokens = [
    'admin-secret-token-2025',
    process.env.ADMIN_SECRET_TOKEN,
  ].filter(Boolean);

  return token ? validTokens.includes(token) : false;
}

// Loading component for Suspense
function CarsLoading() {
  return (
    <div className="text-center py-20">
      <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600" />
      <p className="mt-4 text-gray-600">កំពុងផ្ទុក...</p>
    </div>
  );
}

// Server Component
export default async function Home() {
  const cars = await getCars();
  const isAuthenticatedOnServer = await checkAuthentication();

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 via-white to-blue-50">
      <Suspense fallback={<CarsLoading />}>
        <HomeClient
          initialCars={cars}
          isAuthenticatedOnServer={isAuthenticatedOnServer}
        />
      </Suspense>

      {/* Footer */}
      <footer className="bg-gray-800 text-white mt-16 py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-lg mb-2">📞 លេខទំនាក់ទំនង: {CONTACT.phone.primary}</p>
          <p className="text-gray-400">{STORE.copyright} {STORE.name.full}</p>
        </div>
      </footer>
    </div>
  );
}