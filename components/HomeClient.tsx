"use client";

import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import CarForm from "@/components/CarForm";
import LoginModal from "@/components/LoginModal";
import Header from "@/components/Header";
import CarCard from "@/components/CarCard";
import CarCardSkeleton from "@/components/CarCardSkeleton";
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

interface HomeClientProps {
  isAuthenticatedOnServer: boolean;
}

export default function HomeClient({ isAuthenticatedOnServer }: HomeClientProps) {
  const router = useRouter();
  const [_isPending, _startTransition] = useTransition();
  const { login, logout } = useAuth();
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCarId, setEditingCarId] = useState<string | undefined>();
  const [showLogin, setShowLogin] = useState(false);
  const [errorDialog, setErrorDialog] = useState({ isOpen: false, message: "" });
  const [activeId, setActiveId] = useState<string | null>(null);
  const [draggedCar, setDraggedCar] = useState<Car | null>(null);
  const [_isDragging, setIsDragging] = useState(false);
  const bodyTouchActionRef = useRef<string | null>(null);

  // Fetch cars on client side
  useEffect(() => {
    const controller = new AbortController();

    async function fetchCars() {
      try {
        setLoading(true);
        const response = await fetch('/api/cars', {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error('Failed to fetch cars');
        }

        const data = await response.json();
        setCars(data || []);
      } catch (err) {
        // Ignore abort errors (cleanup on unmount or re-render)
        if (err instanceof Error && err.name === 'AbortError') {
          return;
        }
        console.error('Error fetching cars:', err);
        setErrorDialog({
          isOpen: true,
          message: "មិនអាចទាញយករថយន្តបានទេ។ សូមព្យាយាមម្តងទៀត។"
        });
        setCars([]);
      } finally {
        setLoading(false);
      }
    }

    fetchCars();

    return () => controller.abort();
  }, []);

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

  useEffect(() => {
    restoreBodyTouchInteractions();
  }, [restoreBodyTouchInteractions]);

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

      // Optimistically update local state instead of refetching all cars
      setCars(prevCars => prevCars.filter(car => car.id !== carId));
      console.warn(`[HomeClient] Deleted car ${carId} from local state`);
    } catch (_error) {
      const message = _error instanceof Error ? _error.message : "មិនអាចលុបរថយន្តបានទេ។ សូមពិនិត្យមើលះជាងវិញ។";
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
    // Refresh to get server-side auth state
    router.refresh();
  }, [login, router]);

  const handleLoginCancel = useCallback(() => {
    setShowLogin(false);
  }, []);

  const handleLogout = useCallback(() => {
    logout();
    // Refresh to update server-side rendering
    router.refresh();
  }, [logout, router]);

  // Configure sensors for @dnd-kit with optimized touch and pointer handling
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

  // Drag and drop handlers
  const handleDragStart = useCallback((event: DragStartEvent) => {
    const { active } = event;
    setActiveId(active.id as string);
    setIsDragging(true);

    // Prevent default touch behavior to avoid conflicts
    disableBodyTouchInteractions();

    // Find the dragged car for overlay
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

      // Refresh to sync with server in background
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
      // Immediately update local state for instant UI feedback
      const newOrder = arrayMove(previousOrder, activeIndex, overIndex);
      setCars(newOrder);

      // Update database in background without blocking UI
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
        isAuthenticated={isAuthenticatedOnServer}
        onAddCar={handleAddCar}
        onLogout={handleLogout}
        onShowLogin={() => setShowLogin(true)}
      />

      {/* Main Content */}
      <main className="container mx-auto px-4 py-4">
        {_isPending ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <CarCardSkeleton key={i} />
            ))}
          </div>
        ) : loading ?
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <CarCardSkeleton key={i} />
            ))}
          </div> : cars.length === 0 ? (
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

      {/* Error Dialog */}
      <ErrorDialog
        isOpen={errorDialog.isOpen}
        onClose={() => setErrorDialog({ isOpen: false, message: "" })}
        message={errorDialog.message}
      />
    </>
  );
}