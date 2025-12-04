"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { ArrowLeft, Phone, MessageCircle, MapPin, Calendar, Gauge, Fuel, Settings, Car, FileText } from "lucide-react";
import { CONTACT } from "@/lib/constants";

interface Car {
  id: string;
  name: string;
  brand: string;
  price: number;
  year: number;
  transmission: string;
  fuelType: string;
  images: string[];
  condition: string;
  location: string;
  description?: string;
  vehicleType?: string;
  sold: boolean;
  createdAt: string;
}

export default function CarDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [car, setCar] = useState<Car | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    if (params.id) {
      fetchCar(params.id as string);
    }
  }, [params.id]);

  const fetchCar = async (id: string) => {
    try {
      const response = await fetch(`/api/cars/${id}`);
      if (response.ok) {
        const data = await response.json();
        setCar(data);
      } else {
        console.error("Car not found");
        window.location.href = '/';
      }
    } catch (error) {
      console.error("Error fetching car:", error);
      window.location.href = '/';
    } finally {
      setLoading(false);
    }
  };

  const handleContactClick = () => {
    if (!car) return;
    
    const message = `សួស្តី! ខ្ញុំចាប់អារម្មណ៍លើរថយន្តនេះ:

🚗 ${car.name} (${car.year})
💰 តម្លៃ: $${car.price.toLocaleString()}
📅 ឆ្នាំ: ${car.year}
⚙️ ${car.transmission}
⛽ ${car.fuelType}
🏷️ ${car.condition}
📍 ${car.location}

សូមផ្តល់ព័ត៌មានបន្ថែម។ អរគុណ!`;
    
    const telegramUrl = CONTACT.telegram.url(message);
    
    window.open(telegramUrl, '_blank');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">កំពុងផ្ទុក...</p>
        </div>
      </div>
    );
  }

  if (!car) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 text-xl">រកមិនឃើញរថយន្តនេះទេ</p>
          <button
            onClick={() => window.location.href = '/'}
            className="mt-4 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            ត្រលប់ទៅទំព័រដើម
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => window.history.back()}
              className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
              <span className="hidden sm:inline">ត្រលប់ក្រោយ</span>
            </button>
            <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">
              {car.name} ({car.year})
            </h1>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Image Gallery */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="relative aspect-[4/3] bg-gray-200 rounded-xl overflow-hidden">
              <Image
                src={car.images[currentImageIndex] || '/placeholder-car.jpg'}
                alt={`${car.name} - Image ${currentImageIndex + 1}`}
                fill
                className="object-cover"
                priority
              />
            </div>
            
            {/* Image Thumbnails */}
            {car.images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {car.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-colors ${
                      currentImageIndex === index ? 'border-blue-500' : 'border-gray-200'
                    }`}
                  >
                    <Image
                      src={image}
                      alt={`${car.name} - Thumbnail ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Car Details */}
          <div className="space-y-6">
            {/* Price and Basic Info */}
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <div className="text-3xl font-bold text-gray-900 mb-2">
                ${car.price.toLocaleString()}
              </div>
              <div className="text-lg text-gray-600 mb-4">
                {car.brand} {car.name} ({car.year})
              </div>
              
              {/* Key Specs */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar className="h-4 w-4" />
                  <span>{car.year}</span>
                </div>
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
              </div>

              {/* Location and Condition */}
              <div className="mt-4 pt-4 border-t">
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                  <MapPin className="h-4 w-4" />
                  <span>{car.location}</span>
                </div>
                <div className="flex gap-2">
                  <div className="inline-block px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                    {car.condition}
                  </div>
                  <div className={`inline-block px-3 py-1 text-sm rounded-full ${
                    car.sold 
                      ? 'bg-red-100 text-red-800' 
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {car.sold ? 'លក់រួចហើយ' : 'អាចលក់បាន'}
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Buttons */}
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">ទំនាក់ទំនងអ្នកលក់</h3>
              <div className="space-y-3">
                <button
                  onClick={handleContactClick}
                  className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <MessageCircle className="h-5 w-5" />
                  <span>ផ្ញើសារតាម Telegram</span>
                </button>
                <button
                  onClick={handleContactClick}
                  className="w-full flex items-center justify-center gap-2 bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Phone className="h-5 w-5" />
                  <span>ទំនាក់ទំនងអ្នកលក់</span>
                </button>
              </div>
            </div>

            {/* Description */}
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

            {/* Additional Info */}
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">ព័ត៌មានលម្អិត</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">ម៉ាក:</span>
                  <span className="font-medium">{car.brand}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">ឆ្នាំ:</span>
                  <span className="font-medium">{car.year}</span>
                </div>
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
                <div className="flex justify-between">
                  <span className="text-gray-600">ស្ថានភាព:</span>
                  <span className="font-medium">{car.condition}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">ស្ថានភាពលក់:</span>
                  <span className={`font-medium ${
                    car.sold ? 'text-red-600' : 'text-green-600'
                  }`}>
                    {car.sold ? 'លក់រួចហើយ' : 'អាចលក់បាន'}
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