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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {cars.map((car) => (
            <div
              key={car.id}
              className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-shadow duration-300 border border-gray-100"
            >
              {/* Car Image */}
              <div className="relative h-64 bg-gray-200">
                <Image
                  src={car.image}
                  alt={car.name}
                  fill
                  className="object-cover"
                />
                <div className="absolute top-4 right-4 bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                  {car.year}
                </div>
              </div>

              {/* Car Details */}
              <div className="p-6">
                <h4 className="text-2xl font-bold text-gray-800 mb-1">{car.nameKh}</h4>
                <p className="text-gray-600 mb-4">{car.name}</p>

                <div className="mb-4">
                  <div className="text-3xl font-bold text-blue-700 mb-1">
                    ${car.priceUSD.toLocaleString()}
                  </div>
                  <div className="text-lg text-gray-600">
                    {car.price} ដុល្លារ
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-600">ចម្ងាយបើកបរ:</span>
                    <span className="font-semibold text-gray-800">{car.mileage}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-600">ប្រអប់លេខ:</span>
                    <span className="font-semibold text-gray-800">{car.transmissionKh}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-600">ប្រភេទប្រេង:</span>
                    <span className="font-semibold text-gray-800">{car.fuelTypeKh}</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-gray-600">ស្ថានភាព:</span>
                    <span className="font-semibold text-gray-800">{car.conditionKh}</span>
                  </div>
                </div>

                <div className="space-y-3 mt-4">
                  <button 
                    onClick={() => handleContactClick(car)}
                    className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 transition-all duration-300 shadow-md hover:shadow-lg"
                  >
                    ចាប់អារម្មណ៍ / Contact Us
                  </button>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditCar(car.id)}
                      className="flex-1 bg-yellow-500 text-white py-2 rounded-lg font-semibold hover:bg-yellow-600 transition-colors"
                    >
                      កែប្រែ
                    </button>
                    <button
                      onClick={() => handleDeleteCar(car.id, car.nameKh)}
                      className="flex-1 bg-red-500 text-white py-2 rounded-lg font-semibold hover:bg-red-600 transition-colors"
                    >
                      លុប
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
