"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { ArrowLeft, Phone, MessageCircle, MapPin, Calendar, Fuel, Settings, Car, FileText } from "lucide-react";
import { CONTACT } from "@/lib/constants";
import CarImageGallery from "@/components/CarImageGallery";

interface Car {
  id: string;
  name: string;
  price: number;
  transmission: string;
  fuelType: string;
  images: string[];
  videos: string[];
  tiktokUrl?: string;
  condition: string;
  location: string;
  description?: string;
  vehicleType?: string;
  color?: string;
  papers?: string;
  sold: boolean;
  createdAt: string;
}

export default function CarDetailPage() {
  const params = useParams();
  const [car, setCar] = useState<Car | null>(null);
  const [loading, setLoading] = useState(true);

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
    if (!car) {
      return;
    }

    const message = `សួស្តី! ខ្ញុំចាប់អារម្មណ៍លើរថយន្តនេះ:

🚗 ${car.name}
💰 តម្លៃ: $${car.price.toLocaleString()}
⚙️ ${car.transmission}
⛽ ${car.fuelType}
🏷️ ${car.condition}${car.color ? `\n🎨 ពណ៌: ${car.color}` : ''}
📍 ${car.location}

🖼️ មើលរូបភាព និង ព័ត៌មានលម្អិត
${window.location.origin}/cars/${car.id}

សូមផ្តល់ព័ត៌មានបន្ថែម។ អរគុណ!`;

    const telegramUrl = CONTACT.telegram.url(message);

    window.open(telegramUrl, '_blank');
  };

  const handlePhoneCall = () => {
    // Create tel: link to make phone call
    const phoneNumber = CONTACT.phone.primary.replace(/\s/g, ''); // Remove spaces
    window.location.href = `tel:+855${phoneNumber.replace('0', '')}`; // Convert to international format
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600" />
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
              <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">
                {car.name}
              </h1>
            </button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Media Gallery */}
          <div className="space-y-6">
            {/* Media Gallery with Images and Videos */}
            <CarImageGallery
              images={car.images}
              videos={car.videos}
              carName={car.name}
            />
          </div>

          {/* Car Details */}
          <div className="space-y-6">
            {/* Price and Basic Info */}
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <div className="text-3xl font-bold text-gray-900 mb-2">
                ${car.price.toLocaleString()}
              </div>
              <div className="text-lg text-gray-600 mb-4">
                {car.name}
              </div>

              {/* Key Specs */}
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
                    <div className="h-4 w-4 rounded-full border border-gray-300 bg-gradient-to-r from-gray-200 to-gray-300"></div>
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
                  <div className={`inline-block px-3 py-1 text-sm rounded-full ${car.sold
                    ? 'bg-red-100 text-red-800'
                    : 'bg-green-100 text-green-800'
                    }`}>
                    {car.sold ? 'លក់រួចហើយ' : 'អាចលក់បាន'}
                  </div>
                </div>
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
                  onClick={handlePhoneCall}
                  className="w-full flex items-center justify-center gap-2 bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Phone className="h-5 w-5" />
                  <span>ទូរស័ព្ទ: {CONTACT.phone.primary}</span>
                </button>

                {car.tiktokUrl && (
                  <button
                    onClick={() => window.open(car.tiktokUrl, '_blank')}
                    className="w-full flex items-center justify-center gap-2 bg-black text-white py-3 px-4 rounded-lg hover:bg-gray-800 transition-colors"
                  >
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M19.321 5.562a5.124 5.124 0 0 1-.443-.258 6.228 6.228 0 0 1-1.137-.966c-.849-.849-1.154-1.996-1.154-2.964C16.587.591 16.03 0 15.348 0h-3.313c-.682 0-1.239.591-1.239 1.374v11.289c0 1.289-.8 2.391-1.929 2.776-.674.23-1.394.154-2-.207a2.79 2.79 0 0 1-1.563-2.513c0-1.547 1.26-2.807 2.807-2.807.682 0 1.239-.557 1.239-1.239V5.36c0-.682-.557-1.239-1.239-1.239C4.26 4.121 1 7.381 1 11.232c0 2.807 1.674 5.387 4.264 6.514 1.017.443 2.077.66 3.15.66.683 0 1.37-.087 2.043-.26 2.807-.721 4.764-3.29 4.764-6.262V8.796c1.29.8 2.807 1.239 4.386 1.239.682 0 1.239-.557 1.239-1.239V6.8c0-.682-.557-1.239-1.239-1.239-.43 0-.849-.087-1.286-.174z" />
                    </svg>
                    <span>មើលវីដេអូ TikTok</span>
                  </button>
                )}

              </div>
            </div>

            {/* Additional Info */}
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
                  <span className="text-gray-600">ស្ថានភាព:</span>
                  <span className="font-medium">{car.condition}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">ស្ថានភាពលក់:</span>
                  <span className={`font-medium ${car.sold ? 'text-red-600' : 'text-green-600'
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