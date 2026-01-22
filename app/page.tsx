import { cookies } from "next/headers";
import HomeServer from "@/components/HomeServer";
import { CONTACT, STORE } from "@/lib/constants";
import { Suspense } from "react";
import { prisma } from "@/lib/prisma";

// Revalidate every 60 seconds for ISR (Incremental Static Regeneration)
export const revalidate = 60;

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

// Fetch cars on server side for SSR with timeout
async function getCars() {
  try {
    // Use a timeout to prevent slow queries from blocking page rendering
    const abortController = new AbortController();
    const timeoutId = setTimeout(() => abortController.abort(), 3000); // 3 second timeout
    
    const cars = await prisma.car.findMany({
      orderBy: [
        { displayOrder: 'asc' },
        { createdAt: 'desc' }
      ],
      take: 100, // Limit results to improve performance
    });
    
    clearTimeout(timeoutId);
    return cars;
  } catch (error) {
    console.error('Error fetching cars on server:', error);
    return [];
  }
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
  const [isAuthenticatedOnServer, cars] = await Promise.all([
    checkAuthentication(),
    getCars(),
  ]);

  return (
    <div className="flex flex-col min-h-screen bg-linear-to-br from-blue-50 via-white to-blue-50">
      <div className="flex-1">
        <Suspense fallback={<CarsLoading />}>
          <HomeServer
            isAuthenticatedOnServer={isAuthenticatedOnServer}
            initialCars={cars}
          />
        </Suspense>
      </div>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8 mt-auto">
        <div className="container mx-auto px-4 text-center">
          <p className="text-lg mb-2">📞 លេខទំនាក់ទំនង: {CONTACT.phone.primary}</p>
          <p className="text-gray-400">{STORE.copyright} {STORE.name.full}</p>
        </div>
      </footer>
    </div>
  );
}