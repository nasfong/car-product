import { useState, useEffect, useCallback, useRef } from 'react';
import { Car } from '@/lib/types';

export function useCars() {
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const controllerRef = useRef<AbortController | null>(null);

  const fetchCars = useCallback(async () => {
    // Cancel previous request if still pending
    if (controllerRef.current) {
      controllerRef.current.abort();
    }

    controllerRef.current = new AbortController();

    try {
      setLoading(true);
      const response = await fetch('/api/cars', {
        signal: controllerRef.current.signal,
      });
      if (!response.ok) {
        throw new Error('Failed to fetch cars');
      }
      const data = await response.json();
      setCars(data);
      setError(null);
    } catch (err) {
      // Ignore abort errors
      if (err instanceof Error && err.name === 'AbortError') {
        return;
      }
      console.error('Error fetching cars:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch cars');
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteCar = async (carId: string) => {
    const token = localStorage.getItem('admin-token');
    const response = await fetch(`/api/cars/${carId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Unauthorized: Please login as admin');
      }
      throw new Error('Failed to delete car');
    }

    return response;
  };

  useEffect(() => {
    fetchCars();

    return () => {
      if (controllerRef.current) {
        controllerRef.current.abort();
      }
    };
  }, [fetchCars]);

  const updateCarsOrder = useCallback((newCars: Car[]) => {
    setCars(newCars);
  }, []);

  return {
    cars,
    loading,
    error,
    fetchCars,
    deleteCar,
    updateCarsOrder,
  };
}
