"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import CarForm from "@/components/CarForm";

interface Car {
  id: string;
  name: string;
  brand: string;
  price: number;
  year: number;
  mileage: string;
  transmission: string;
  fuelType: string;
  images: string[];
  condition: string;
  location: string;
  description?: string;
  vehicleType?: string;
  createdAt: string;
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
    const message = `សួស្តី! ខ្ញុំចាប់អារម្មណ៍លើរថយន្តនេះ:\n\n🚗 ${car.name}\n💰 តម្លៃ: $${car.price.toLocaleString()}\n📅 ឆ្នាំ: ${car.year}\n⚙️ ${car.transmission}\n⛽ ${car.fuelType}\n📏 ${car.mileage}\n\nសូមផ្តល់ព័ត៌មានបន្ថែម។ អរគុណ!`;
    
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
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-xl font-bold">🚗 ហាងលក់រថយន្ត</h1>
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
          <div className="max-w-4xl mx-auto">
            {cars.map((car) => (
            <div
              key={car.id}
              className="border-b border-gray-200 py-4 hover:bg-gray-50 transition-colors"
            >
              <div className="flex gap-4">
                {/* Car Image Thumbnail */}
                <div className="relative w-28 h-32 bg-gray-200 rounded overflow-hidden flex-shrink-0">
                  <Image
                    src={car.images[0] || '/placeholder-car.jpg'}
                    alt={car.name}
                    fill
                    className="object-cover"
                  />
                </div>

                {/* Car Details */}
                <div className="flex-grow">
                  {/* Title - exactly like Khmer24 */}
                  <h4 className="text-blue-600 hover:text-blue-800 font-normal mb-1 cursor-pointer text-sm">
                    {car.name}
                  </h4>
                  
                  {/* Location and Date - Khmer24 format */}
                  <div className="text-xs text-gray-600 mb-1">
                    {car.location} {new Date(car.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </div>
                  
                  {/* Condition/Category */}
                  <div className="text-xs text-gray-600 mb-2">
                    {car.condition}
                  </div>
                  
                  {/* Price - Khmer24 style */}
                  <div className="text-base font-bold text-gray-900">
                    ${car.price.toLocaleString()}
                  </div>

                  {/* Admin buttons - compact and subtle */}
                  <div className="flex gap-2 mt-2">
                    <button 
                      onClick={() => handleContactClick(car)}
                      className="text-xs bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700 transition-colors"
                    >
                      Contact
                    </button>
                    <button
                      onClick={() => handleEditCar(car.id)}
                      className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded hover:bg-gray-300 transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteCar(car.id, car.name)}
                      className="text-xs bg-gray-200 text-red-600 px-2 py-1 rounded hover:bg-red-50 transition-colors"
                    >
                      Delete
                    </button>
                  </div>
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
