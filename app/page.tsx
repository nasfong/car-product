"use client";

import { useCallback, useState } from "react";
import CarForm from "@/components/CarForm";
import LoginModal from "@/components/LoginModal";
import Header from "@/components/Header";
import CarCard from "@/components/CarCard";
import ErrorDialog from "@/components/ErrorDialog";
import { CONTACT, STORE } from "@/lib/constants";
import { useCars } from "@/hooks/useCars";
import { useAuth } from "@/hooks/useAuth";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
} from "@dnd-kit/sortable";

export default function Home() {
  const { cars, loading, fetchCars, deleteCar, updateCarsOrder } = useCars();
  const { isAuthenticated, login, logout } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [editingCarId, setEditingCarId] = useState<string | undefined>();
  const [showLogin, setShowLogin] = useState(false);
  const [errorDialog, setErrorDialog] = useState({ isOpen: false, message: "" });
  const [activeId, setActiveId] = useState<string | null>(null);
  const [draggedCar, setDraggedCar] = useState<any>(null);
  const [isDragging, setIsDragging] = useState(false);

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
      const message = error instanceof Error ? error.message : "មិនអាចលុបរថយន្តបានទេ។ សូមពិនិត្យមើលះជាងវិញ។";
      setErrorDialog({ 
        isOpen: true, 
        message: message 
      });
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

  // Configure sensors for @dnd-kit with mobile-first approach
  const sensors = useSensors(
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 100,
        tolerance: 8,
      },
    }),
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 3,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Drag and drop handlers
  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    setActiveId(active.id as string);
    setIsDragging(true);
    
    // Prevent default touch behavior to avoid conflicts
    if ('ontouchstart' in window) {
      document.body.style.touchAction = 'none';
    }
    
    // Find the dragged car for overlay
    const draggedCarData = cars.find(car => car.id === active.id);
    setDraggedCar(draggedCarData);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    
    // Restore touch behavior
    if ('ontouchstart' in window) {
      document.body.style.touchAction = '';
    }
    
    setActiveId(null);
    setDraggedCar(null);
    setIsDragging(false);
    
    if (!over) return;
    
    const activeIndex = cars.findIndex(car => car.id === active.id);
    const overIndex = cars.findIndex(car => car.id === over.id);
    
    if (activeIndex !== overIndex) {
      // Immediately update local state for instant UI feedback
      const newCars = arrayMove(cars, activeIndex, overIndex);
      
      // Update the cars state directly without loading
      updateCarsOrder(newCars);
      
      // Update database in background without showing loading
      const updateOrderInBackground = async () => {
        try {
          const token = localStorage.getItem('admin-token');
          const response = await fetch('/api/cars/reorder', {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
              carIds: newCars.map(car => car.id)
            })
          });

          if (!response.ok) {
            throw new Error('Failed to update order');
          }
          
          // Silently update local state to match database response if needed
          console.log('Order updated successfully in database');
        } catch (error) {
          console.error('Error updating car order:', error);
          setErrorDialog({ 
            isOpen: true, 
            message: 'មិនអាចរក្សាទុកលំដាប់ថ្មីបានទេ។ នឹងស្ដារលំដាប់ដើមវិញ។' 
          });
          // Restore original order on error without loading
          fetchCars();
        }
      };
      
      // Execute background update without awaiting
      updateOrderInBackground();
    }
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
        ) : isAuthenticated ? (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={cars.map(car => car.id)}
              strategy={rectSortingStrategy}
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {cars.map((car) => (
                  <CarCard
                    key={car.id}
                    car={car}
                    isAuthenticated={true}
                    onEdit={handleEditCar}
                    onDelete={handleDeleteCar}
                    isDragging={activeId === car.id}
                    showDragHandle={true}
                  />
                ))}
              </div>
            </SortableContext>
            <DragOverlay
              style={{
                cursor: 'grabbing',
                touchAction: 'none',
              }}
            >
              {activeId && draggedCar ? (
                <div className="transform rotate-3 scale-105 opacity-95">
                  <CarCard
                    car={draggedCar}
                    isAuthenticated={true}
                    onEdit={() => {}}
                    onDelete={() => {}}
                    isDragging={true}
                    showDragHandle={true}
                    isOverlay={true}
                  />
                </div>
              ) : null}
            </DragOverlay>
          </DndContext>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {cars.map((car) => (
              <CarCard
                key={car.id}
                car={car}
                isAuthenticated={false}
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
          <p className="text-lg mb-2">📞 លេខទំនាក់ទំនង: {CONTACT.phone.primary}
            {/* / {CONTACT.phone.secondary} */}
          </p>
          <p className="text-gray-400">{STORE.copyright} {STORE.name.full}</p>
        </div>
      </footer>
      
      {/* Error Dialog */}
      <ErrorDialog
        isOpen={errorDialog.isOpen}
        onClose={() => setErrorDialog({ isOpen: false, message: "" })}
        message={errorDialog.message}
      />
    </div>
  );
}
