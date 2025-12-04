"use client";

import { useCallback, useState } from "react";
import CarForm from "@/components/CarForm";
import LoginModal from "@/components/LoginModal";
import Header from "@/components/Header";
import CarCard from "@/components/CarCard";
import { CONTACT, STORE } from "@/lib/constants";
import { useCars } from "@/hooks/useCars";
import { useAuth } from "@/hooks/useAuth";

export default function Home() {
  const { cars, loading, fetchCars, deleteCar } = useCars();
  const { isAuthenticated, login, logout } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [editingCarId, setEditingCarId] = useState<string | undefined>();
  const [showLogin, setShowLogin] = useState(false);

  const handleLoginRequired = useCallback((action: () => void) => {
    if (isAuthenticated) {
      action();
    } else {
      setShowLogin(true);
    }
  }, [isAuthenticated]);

  const handleAddCar = useCallback(() => {
    handleLoginRequired(() => {
      setEditingCarId(undefined);
      setShowForm(true);
    });
  }, [handleLoginRequired]);

  const handleEditCar = useCallback((carId: string) => {
    handleLoginRequired(() => {
      setEditingCarId(carId);
      setShowForm(true);
    });
  }, [handleLoginRequired]);

  const handleDeleteCar = useCallback(async (carId: string, carName: string) => {
    if (!confirm(`តើអ្នកពិតជាចង់លុបរថយន្ត ${carName} មែនទេ?`)) {
      return;
    }

    try {
      await deleteCar(carId);
      fetchCars();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to delete car";
      alert(message);
    }
  }, [deleteCar, fetchCars]);

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingCarId(undefined);
    fetchCars();
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingCarId(undefined);
  };

  const handleLoginSuccess = () => {
    login();
    setShowLogin(false);
  };

  const handleLoginCancel = () => {
    setShowLogin(false);
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 via-white to-blue-50">
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
      <Header
        isAuthenticated={isAuthenticated}
        onAddCar={handleAddCar}
        onLogout={logout}
        onShowLogin={() => setShowLogin(true)}
      />

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600" />
            <p className="mt-4 text-gray-600">កំពុងផ្ទុក...</p>
          </div>
        ) : cars.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-600 text-xl">មិនមានរថយន្តនៅឡើយទេ</p>
            {isAuthenticated && (
              <button
                onClick={handleAddCar}
                className="mt-6 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
              >
                បន្ថែមរថយន្តដំបូង
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {cars.map((car) => (
              <CarCard
                key={car.id}
                car={car}
                isAuthenticated={isAuthenticated}
                onEdit={handleEditCar}
                onDelete={handleDeleteCar}
              />
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white mt-16 py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-lg mb-2">📞 លេខទំនាក់ទំនង: {CONTACT.phone.primary} / {CONTACT.phone.secondary}</p>
          <p className="text-gray-400">{STORE.copyright} {STORE.name.full}</p>
        </div>
      </footer>
    </div>
  );
}
