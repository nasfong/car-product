"use client";

import { useCallback, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import CarForm from "@/components/CarForm";
import LoginModal from "@/components/LoginModal";
import Header from "@/components/Header";
import CarCard from "@/components/CarCard";
import ErrorDialog from "@/components/ErrorDialog";
import { useAuth } from "@/hooks/useAuth";
import { Car } from "@/lib/types";
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
  DragCancelEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
} from "@dnd-kit/sortable";

interface HomeServerProps {
  isAuthenticatedOnServer: boolean;
  initialCars: Car[];
}

export default function HomeServer({ isAuthenticatedOnServer, initialCars }: HomeServerProps) {
  const router = useRouter();
  const { login, logout } = useAuth();
  const [cars, setCars] = useState<Car[]>(initialCars);
  const [showForm, setShowForm] = useState(false);
  const [editingCarId, setEditingCarId] = useState<string | undefined>();
  const [showLogin, setShowLogin] = useState(false);
  const [errorDialog, setErrorDialog] = useState({ isOpen: false, message: "" });
  const [activeId, setActiveId] = useState<string | null>(null);
  const [draggedCar, setDraggedCar] = useState<Car | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const bodyTouchActionRef = useRef<string | null>(null);

  const disableBodyTouchInteractions = useCallback(() => {
    if (typeof window === "undefined" || typeof document === "undefined" || !('ontouchstart' in window) || !document.body) {
      return;
    }

    if (bodyTouchActionRef.current === null) {
      bodyTouchActionRef.current = document.body.style.touchAction || "";
    }

    document.body.style.touchAction = "none";
  }, []);

  const restoreBodyTouchInteractions = useCallback(() => {
    if (typeof window === "undefined" || typeof document === "undefined" || !('ontouchstart' in window) || !document.body) {
      return;
    }

    if (bodyTouchActionRef.current !== null) {
      document.body.style.touchAction = bodyTouchActionRef.current;
      bodyTouchActionRef.current = null;
    } else {
      document.body.style.touchAction = "auto";
    }
  }, []);

  const refreshCars = useCallback(async () => {
    try {
      const response = await fetch('/api/cars');
      if (response.ok) {
        const data = await response.json();
        setCars(data || []);
      }
    } catch (_err) {
      console.error('Error refreshing cars:', _err);
    }
  }, []);

  const handleLoginRequired = useCallback((action: () => void) => {
    if (isAuthenticatedOnServer) {
      action();
    } else {
      setShowLogin(true);
    }
  }, [isAuthenticatedOnServer]);

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
      const token = localStorage.getItem('admin-token');
      const response = await fetch(`/api/cars/${carId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete car');
      }

      setCars(prevCars => prevCars.filter(car => car.id !== carId));
    } catch (_error) {
      const message = _error instanceof Error ? _error.message : "មិនអាចលុបរថយន្តបានទេ។ សូមពិនិត្យមើលវិញ។";
      setErrorDialog({
        isOpen: true,
        message
      });
    }
  }, []);

  const handleFormSuccess = useCallback(() => {
    setShowForm(false);
    setEditingCarId(undefined);
    refreshCars();
  }, [refreshCars]);

  const handleFormCancel = useCallback(() => {
    setShowForm(false);
    setEditingCarId(undefined);
  }, []);

  const handleLoginSuccess = useCallback(() => {
    login();
    setShowLogin(false);
    router.refresh();
  }, [login, router]);

  const handleLoginCancel = useCallback(() => {
    setShowLogin(false);
  }, []);

  const handleLogout = useCallback(() => {
    logout();
    router.refresh();
  }, [logout, router]);

  const sensors = useSensors(
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 100,
        tolerance: 5,
      },
    }),
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
        delay: 0,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const { active } = event;
    setActiveId(active.id as string);
    setIsDragging(true);
    disableBodyTouchInteractions();

    const draggedCarData = cars.find(car => car.id === active.id);
    setDraggedCar(draggedCarData ?? null);
  }, [cars, disableBodyTouchInteractions]);

  const syncCarOrder = useCallback(async (newOrder: Car[], previousOrder: Car[]) => {
    try {
      const token = localStorage.getItem('admin-token');
      const response = await fetch('/api/cars/reorder', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          carIds: newOrder.map(car => car.id)
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update order');
      }

      refreshCars();
    } catch (error) {
      console.error('Error updating car order:', error);
      setErrorDialog({
        isOpen: true,
        message: 'មិនអាចរក្សាទុកលំដាប់ថ្មីបានទេ។ នឹងស្ដារលំដាប់ដើមវិញ។'
      });
      setCars(previousOrder);
    }
  }, [refreshCars]);

  const finalizeDrag = useCallback(() => {
    restoreBodyTouchInteractions();
    setActiveId(null);
    setDraggedCar(null);
    setIsDragging(false);
  }, [restoreBodyTouchInteractions]);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;

    finalizeDrag();

    if (!over) {
      return;
    }

    const previousOrder = [...cars];
    const activeIndex = previousOrder.findIndex(car => car.id === active.id);
    const overIndex = previousOrder.findIndex(car => car.id === over.id);

    if (activeIndex !== overIndex) {
      const newOrder = arrayMove(previousOrder, activeIndex, overIndex);
      setCars(newOrder);
      syncCarOrder(newOrder, previousOrder);
    }
  }, [cars, finalizeDrag, syncCarOrder]);

  const handleDragCancel = useCallback((event: DragCancelEvent) => {
    if (event.active) {
      finalizeDrag();
    }
  }, [finalizeDrag]);

  return (
    <>
      {showForm && (
        <CarForm
          carId={editingCarId}
          onSuccess={handleFormSuccess}
          onCancel={handleFormCancel}
        />
      )}

      {showLogin && (
        <LoginModal
          onSuccess={handleLoginSuccess}
          onCancel={handleLoginCancel}
        />
      )}

      <Header
        isAuthenticated={isAuthenticatedOnServer}
        onAddCar={handleAddCar}
        onLogout={handleLogout}
        onShowLogin={() => setShowLogin(true)}
      />

      <main className="container mx-auto px-4 py-4">
        {cars.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-600 text-xl">មិនមានរថយន្តនៅឡើយទេ</p>
            {isAuthenticatedOnServer && (
              <button
                onClick={handleAddCar}
                className="mt-6 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
              >
                បន្ថែមរថយន្តដំបូង
              </button>
            )}
          </div>
        ) : isAuthenticatedOnServer ? (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onDragCancel={handleDragCancel}
          >
            <SortableContext
              items={cars.map(car => car.id)}
              strategy={rectSortingStrategy}
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 will-change-auto">
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
              dropAnimation={{
                duration: 250,
                easing: 'cubic-bezier(0.25, 1, 0.5, 1)',
              }}
              style={{
                cursor: 'grabbing',
                touchAction: 'none',
              }}
            >
              {activeId && draggedCar ? (
                <CarCard
                  car={draggedCar}
                  isAuthenticated={true}
                  onEdit={() => { }}
                  onDelete={() => { }}
                  isDragging={true}
                  showDragHandle={true}
                  isOverlay={true}
                />
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

      <ErrorDialog
        isOpen={errorDialog.isOpen}
        onClose={() => setErrorDialog({ isOpen: false, message: "" })}
        message={errorDialog.message}
      />
    </>
  );
}
