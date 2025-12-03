"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import CarForm from "@/components/CarForm";
import LoginModal from "@/components/LoginModal";

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

// Replace with your actual Telegram username or bot
const TELEGRAM_USERNAME = "NasFong"; // Change this to your Telegram username

export default function Home() {
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCarId, setEditingCarId] = useState<string | undefined>();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showLogin, setShowLogin] = useState(false);

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
    // Check if user is already authenticated
    const token = localStorage.getItem('admin-token');
    setIsAuthenticated(!!token);
  }, []);

  // Function to generate Telegram link with car details
  const handleContactClick = (car: Car) => {
    const message = `សួស្តី! ខ្ញុំចាប់អារម្មណ៍លើរថយន្តនេះ:\n\n🚗 ${car.name}\n💰 តម្លៃ: $${car.price.toLocaleString()}\n📅 ឆ្នាំ: ${car.year}\n⚙️ ${car.transmission}\n⛽ ${car.fuelType}\n\nសូមផ្តល់ព័ត៌មានបន្ថែម។ អរគុណ!`;

    const encodedMessage = encodeURIComponent(message);
    const telegramUrl = `https://t.me/${TELEGRAM_USERNAME}?text=${encodedMessage}`;

    window.open(telegramUrl, '_blank');
  };

  const handleAddCar = () => {
    handleLoginRequired(() => {
      setEditingCarId(undefined);
      setShowForm(true);
    });
  };

  const handleEditCar = (carId: string) => {
    handleLoginRequired(() => {
      setEditingCarId(carId);
      setShowForm(true);
    });
  };

  const handleDeleteCar = async (carId: string, carName: string) => {
    if (!confirm(`តើអ្នកពិតជាចង់លុបរថយន្ត ${carName} មែនទេ?`)) {
      return;
    }

    try {
      const token = localStorage.getItem('admin-token');
      const response = await fetch(`/api/cars/${carId}`, {
        method: "DELETE",
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        fetchCars();
      } else if (response.status === 401) {
        alert("Unauthorized: Please login as admin");
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

  const handleLoginRequired = (action: () => void) => {
    if (isAuthenticated) {
      action();
    } else {
      setShowLogin(true);
    }
  };

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
    setShowLogin(false);
  };

  const handleLoginCancel = () => {
    setShowLogin(false);
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth', { method: 'DELETE' });
      localStorage.removeItem('admin-token');
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Logout error:', error);
    }
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

      {/* Login Modal */}
      {showLogin && (
        <LoginModal
          onSuccess={handleLoginSuccess}
          onCancel={handleLoginCancel}
        />
      )}

      {/* Header */}
      <header className="bg-gradient-to-r from-blue-600 to-blue-800 text-white shadow-lg">
        <div className="container mx-auto px-4 py-4 sm:py-6">
          {/* Mobile Layout - Stacked */}
          <div className="block sm:hidden">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h1 className="text-lg font-bold">🚗 ហាងលក់រថយន្ត</h1>
                <p className="text-blue-100 text-xs mt-0.5">Car Showroom Cambodia</p>
              </div>
              {isAuthenticated ? (
                <div className="flex items-center gap-2">
                  <span className="text-blue-100 text-xs bg-blue-700/30 px-2 py-1 rounded">Admin</span>
                  <button
                    onClick={handleLogout}
                    className="bg-red-500 text-white px-3 py-1.5 rounded text-sm font-medium hover:bg-red-600 transition-colors"
                  >
                    Logout
                  </button>
                </div>
              ) :
                <button
                  onClick={() => setShowLogin(true)}
                  className="bg-white text-blue-700 px-4 lg:px-6 py-2 rounded-lg font-semibold hover:bg-blue-50 transition-colors shadow-md text-sm lg:text-base"
                >
                  Login
                </button>}
            </div>
            <div className="flex justify-center">
              {isAuthenticated && (<button
                onClick={handleAddCar}
                className="bg-white text-blue-700 px-4 lg:px-6 py-2 rounded-lg font-semibold hover:bg-blue-50 transition-colors shadow-md text-sm lg:text-base"
              >
                + បន្ថែមរថយន្ត
              </button>)}
            </div>
          </div>

          {/* Desktop Layout - Horizontal */}
          <div className="hidden sm:flex items-center justify-between">
            <div>
              <h1 className="text-xl lg:text-2xl font-bold">🚗 ហាងលក់រថយន្ត</h1>
              <p className="text-blue-100 mt-1">Car Showroom Cambodia</p>
            </div>
            <div className="flex gap-3 lg:gap-4 items-center">
              {isAuthenticated && (
                <div className="hidden md:flex items-center gap-2">
                  <span className="text-blue-100 text-sm bg-blue-700/30 px-3 py-1 rounded">Admin</span>
                </div>
              )}
              {isAuthenticated && (<button
                onClick={handleAddCar}
                className="bg-white text-blue-700 px-4 lg:px-6 py-2 rounded-lg font-semibold hover:bg-blue-50 transition-colors shadow-md text-sm lg:text-base"
              >
                + បន្ថែមរថយន្ត
              </button>)}
              {isAuthenticated && (
                <button
                  onClick={handleLogout}
                  className="bg-red-600 text-white px-3 lg:px-4 py-2 rounded-lg font-semibold hover:bg-red-700 transition-colors text-sm lg:text-base"
                >
                  Logout
                </button>
              )}
            </div>
          </div>
        </div>
      </header>


      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
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
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {cars.map((car) => (
              <div
                key={car.id}
                className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-all duration-200 cursor-pointer group relative"
                onClick={() => window.location.href = `/cars/${car.id}`}
              >
                {/* Sold Badge - Top Right Corner */}
                {car.sold && (
                  <div className="absolute top-2 right-[-20] z-10">
                    <div className="bg-red-500 text-white text-xs px-8 py-1 font-medium transform rotate-[30deg] shadow-lg">
                      លក់រួចហើយ
                    </div>
                  </div>
                )}
                
                {/* Car Image */}
                <div className="relative aspect-[4/3] bg-gray-200">
                  <Image
                    src={car.images[0] || '/placeholder-car.jpg'}
                    alt={car.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-200"
                  />
                  {/* Image Count Badge */}
                  {car.images.length > 1 && (
                    <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                      </svg>
                      {car.images.length}
                    </div>
                  )}
                </div>

                {/* Car Info */}
                <div className="p-4">
                  {/* Title */}
                  <h4 className="font-semibold text-gray-900 mb-2 text-base line-clamp-2 group-hover:text-blue-600 transition-colors">
                    {car.name}
                  </h4>
                  
                  {/* Year and Condition */}
                  <div className="flex items-center gap-2 mb-3">
                    <span className="bg-blue-50 text-blue-700 text-xs font-medium px-2 py-1 rounded">
                      {car.year}
                    </span>
                    <span className="bg-gray-100 text-gray-700 text-xs font-medium px-2 py-1 rounded">
                      {car.condition}
                    </span>
                  </div>
                  
                  {/* Location */}
                  <div className="flex items-center gap-1 mb-3">
                    <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span className="text-xs text-gray-600 line-clamp-1">{car.location}</span>
                  </div>
                  
                  {/* Price */}
                  <div className="mb-4">
                    <span className="text-lg font-bold text-green-600">
                      ${car.price.toLocaleString()}
                    </span>
                  </div>

                  {/* Admin buttons - mobile-friendly */}
                  {isAuthenticated && (
                    <div className="flex gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditCar(car.id);
                        }}
                        className="flex-1 flex items-center justify-center gap-1 bg-blue-100 text-blue-700 px-3 py-2 rounded-md hover:bg-blue-200 transition-colors font-medium text-sm min-h-[36px] touch-manipulation"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        <span className="hidden sm:inline">Edit</span>
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteCar(car.id, car.name);
                        }}
                        className="flex items-center justify-center gap-1 bg-red-100 text-red-700 px-3 py-2 rounded-md hover:bg-red-200 transition-colors font-medium text-sm min-h-[36px] min-w-[60px] touch-manipulation"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        <span className="hidden sm:inline">Delete</span>
                      </button>
                    </div>
                  )}
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
