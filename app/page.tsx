"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import CarForm from "@/components/CarForm";

interface Car {
  id: string;
  name: string;
  nameKh: string;
  brand: string;
  price: string;
  priceUSD: number;
  year: number;
  mileage: string;
  transmission: string;
  transmissionKh: string;
  fuelType: string;
  fuelTypeKh: string;
  image: string;
  condition: string;
  conditionKh: string;
}

// Replace with your actual Telegram username or bot
const TELEGRAM_USERNAME = "NasFong"; // Change this to your Telegram username

export default function Home() {
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCarId, setEditingCarId] = useState<string | undefined>();

  // Fetch cars from API
  const fetchCars = async () => {
    try {
      const response = await fetch("/api/cars");
      const data = await response.json();
      setCars(data);
    } catch (error) {
      console.error("Error fetching cars:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCars();
  }, []);

  // Function to generate Telegram link with car details
  const handleContactClick = (car: Car) => {
    const message = `សួស្តី! ខ្ញុំចាប់អារម្មណ៍លើរថយន្តនេះ:\n\n🚗 ${car.nameKh} (${car.name})\n💰 តម្លៃ: $${car.priceUSD.toLocaleString()}\n📅 ឆ្នាំ: ${car.year}\n⚙️ ${car.transmissionKh}\n⛽ ${car.fuelTypeKh}\n📏 ${car.mileage}\n\nសូមផ្តល់ព័ត៌មានបន្ថែម។ អរគុណ!`;
    
    const encodedMessage = encodeURIComponent(message);
    const telegramUrl = `https://t.me/${TELEGRAM_USERNAME}?text=${encodedMessage}`;
    
    window.open(telegramUrl, '_blank');
  };

  const handleAddCar = () => {
    setEditingCarId(undefined);
    setShowForm(true);
  };

  const handleEditCar = (carId: string) => {
    setEditingCarId(carId);
    setShowForm(true);
  };

  const handleDeleteCar = async (carId: string, carName: string) => {
    if (!confirm(`តើអ្នកពិតជាចង់លុបរថយន្ត ${carName} មែនទេ?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/cars/${carId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        fetchCars();
      } else {
        alert("Failed to delete car");
      }
    } catch (error) {
      console.error("Error deleting car:", error);
      alert("Failed to delete car");
    }
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingCarId(undefined);
    fetchCars();
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingCarId(undefined);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      {/* Car Form Modal */}
      {showForm && (
        <CarForm
          carId={editingCarId}
          onSuccess={handleFormSuccess}
          onCancel={handleFormCancel}
        />
      )}

      {/* Header */}
      <header className="bg-gradient-to-r from-blue-600 to-blue-800 text-white shadow-lg">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">🚗 ហាងលក់រថយន្ត</h1>
              <p className="text-blue-100 mt-1">Car Showroom Cambodia</p>
            </div>
            <div className="flex gap-4 items-center">
              <button
                onClick={handleAddCar}
                className="bg-white text-blue-700 px-6 py-2 rounded-lg font-semibold hover:bg-blue-50 transition-colors shadow-md"
              >
                + បន្ថែមរថយន្ត
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-700 to-blue-900 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            ស្វាគមន៍មកកាន់ហាងរថយន្តរបស់យើង
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            រថយន្តគុណភាពខ្ពស់ តម្លៃសមរម្យ សេវាកម្មល្អបំផុត
          </p>
          <p className="text-lg text-blue-200">
            Welcome to Our Premium Car Showroom
          </p>
        </div>
      </section>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        <div className="mb-8">
          <h3 className="text-3xl font-bold text-gray-800 mb-2">រថយន្តដែលមានលក់</h3>
          <p className="text-gray-600">Available Vehicles</p>
        </div>

        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">កំពុងផ្ទុក...</p>
          </div>
        ) : cars.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-600 text-xl">មិនមានរថយន្តនៅឡើយទេ</p>
            <button
              onClick={handleAddCar}
              className="mt-4 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              បន្ថែមរថយន្តដំបូង
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 max-w-7xl mx-auto">
            {cars.map((car) => (
            <div
              key={car.id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 overflow-hidden"
            >
              {/* Car Image */}
              <div className="relative aspect-[4/3] bg-gray-200">
                <Image
                  src={car.image}
                  alt={car.name}
                  fill
                  className="object-cover"
                />
                {/* Photo count badge - top right */}
                <div className="absolute top-2 right-2 bg-black bg-opacity-70 text-white px-2 py-1 rounded text-xs font-medium flex items-center gap-1">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                  </svg>
                  8
                </div>
              </div>

              {/* Car Details */}
              <div className="p-4">
                {/* Title */}
                <h3 className="text-base font-medium text-gray-900 mb-1 line-clamp-2">
                  {car.nameKh}
                </h3>
                
                {/* Time and Location */}
                <div className="text-xs text-gray-500 mb-2">
                  <span>13h • Russei Kaev, Phnom Penh</span>
                </div>
                
                {/* Category */}
                <div className="text-xs text-gray-600 mb-4">
                  {car.conditionKh}
                </div>

                {/* Bottom section with price and heart */}
                <div className="flex items-center justify-between">
                  {/* Price */}
                  <div className="text-xl font-bold text-orange-500">
                    ${car.priceUSD.toLocaleString()}
                  </div>
                  
                  {/* Heart icon */}
                  <button className="text-gray-300 hover:text-red-500 transition-colors">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 000-6.364 4.5 4.5 0 00-6.364 0L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  </button>
                </div>

                {/* Admin buttons - below price section */}
                <div className="flex gap-2 mt-3 pt-3 border-t border-gray-100">
                  <button
                    onClick={() => handleContactClick(car)}
                    className="flex-1 text-xs bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition-colors"
                  >
                    Contact
                  </button>
                  <button
                    onClick={() => handleEditCar(car.id)}
                    className="flex-1 text-xs bg-gray-200 text-gray-700 py-2 rounded hover:bg-gray-300 transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteCar(car.id, car.nameKh)}
                    className="flex-1 text-xs bg-gray-200 text-red-600 py-2 rounded hover:bg-red-50 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white mt-16 py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-lg mb-2">📞 លេខទំនាក់ទំនង: 012 345 678 / 098 765 432</p>
          <p className="text-gray-400">© 2025 ហាងលក់រថយន្ត - Car Showroom Cambodia</p>
        </div>
      </footer>
    </div>
  );
}
