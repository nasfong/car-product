import { notFound } from "next/navigation";
import { MapPin, FileText, Settings, Fuel, Car } from "lucide-react";
import type { Metadata } from "next";
import BackButton from "./components/BackButton";
import ContactButtons from "./components/ContactButtons";
import CarImageGalleryWrapper from "./components/CarImageGalleryWrapper";

interface Car {
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
  sold: boolean;
  createdAt: string;
}

async function getCar(id: string): Promise<Car | null> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const response = await fetch(`${baseUrl}/api/cars/${id}`, {
      cache: 'no-store',
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

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const car = await getCar(id);

  if (!car) {
    return {
      title: 'Car Not Found',
    };
  }

  return {
    title: `${car.name} - $${car.price}`,
    description: `${car.name} - ${car.transmission}, ${car.fuelType}, ${car.location}. ${car.description || ''}`.slice(0, 160),
    openGraph: {
      title: car.name,
      description: `$${car.price} - ${car.transmission}, ${car.fuelType}`,
      images: car.images.slice(0, 1),
    },
  };
}

export default async function CarDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const car = await getCar(id);

  if (!car) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <BackButton carName={car.name} />
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <CarImageGalleryWrapper
              images={car.images}
              videos={car.videos}
              carName={car.name}
            />
          </div>

          <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <div className="text-3xl font-bold text-gray-900 mb-2">
                ${car.price}
              </div>
              <div className="text-lg text-gray-600 mb-4">
                {car.name}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Settings className="h-4 w-4" />
                  <span>{car.transmission}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Fuel className="h-4 w-4" />
                  <span>{car.fuelType}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Car className="h-4 w-4" />
                  <span>{car.vehicleType || 'N/A'}</span>
                </div>
                {car.color && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <div className="h-4 w-4 rounded-full border border-gray-300 bg-gray-300" />
                    <span>ពណ៌: {car.color}</span>
                  </div>
                )}
                {car.papers && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <FileText className="h-4 w-4" />
                    <span>ឯកសារ: {car.papers}</span>
                  </div>
                )}
              </div>

              <div className="mt-4 pt-4 border-t">
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                  <MapPin className="h-4 w-4" />
                  <span>{car.location}</span>
                </div>
                <div className="flex gap-2">
                  <div className={`inline-block px-3 py-1 text-sm rounded-full ${car.sold ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                    {car.sold ? 'លក់ចេញហើយ' : 'រៀបចំរួចរាល់'}
                  </div>
                </div>
              </div>
            </div>

            {car.description && (
              <div className="bg-white p-6 rounded-xl shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  ការពិពណ៌នា
                </h3>
                <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">
                  {car.description}
                </p>
              </div>
            )}

            <ContactButtons car={car} />

            <div className="bg-white p-6 rounded-xl shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">ព័ត៌មានលម្អិត</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">ប្រអប់លេខ:</span>
                  <span className="font-medium">{car.transmission}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">ប្រភេទប្រេង:</span>
                  <span className="font-medium">{car.fuelType}</span>
                </div>
                {car.vehicleType && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">ប្រភេទរថយន្ត:</span>
                    <span className="font-medium">{car.vehicleType}</span>
                  </div>
                )}
                {car.color && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">ពណ៌:</span>
                    <span className="font-medium">{car.color}</span>
                  </div>
                )}
                {car.papers && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">ឯកសារ:</span>
                    <span className="font-medium">{car.papers}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-600">ស្ថានភាពលក់:</span>
                  <span className={`font-medium ${car.sold ? 'text-red-600' : 'text-green-600'}`}>
                    {car.sold ? 'លក់ចេញហើយ' : 'រៀបចំរួចរាល់'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">ទីតាំង:</span>
                  <span className="font-medium">{car.location}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">កាលបរិច្ឆេទចុះផ្សាយ:</span>
                  <span className="font-medium">
                    {new Date(car.createdAt).toLocaleDateString('km-KH', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
