import { createClient, RedisClientType } from 'redis';

let redisClient: RedisClientType | null = null;

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';
const CACHE_EXPIRY = {
  CARS_LIST: 24 * 60 * 60, // 1 day
  CAR_DETAIL: 10 * 60, // 10 minutes
  ADMIN_CHECK: 1 * 60, // 1 minute
};

export const getRedisClient = async (): Promise<RedisClientType> => {
  if (redisClient && redisClient.isOpen) {
    return redisClient;
  }

  try {
    const socketConfig: Record<string, unknown> = {
      reconnectStrategy: (retries: number) => {
        if (retries > 15) {
          return new Error('Redis max retries exceeded');
        }
        const delay = Math.min(retries * 500, 30000); // Max 30 second delay
        console.warn(`Redis reconnect attempt ${retries}, delay: ${delay}ms`);
        return delay;
      },
      keepAlive: 30000, // Send keep-alive every 30 seconds
      noDelay: true,
      connectTimeout: 15000, // 15 second timeout
    };

    // Handle TLS for REDISS protocol
    if (REDIS_URL.startsWith('rediss://')) {
      socketConfig.tls = true;
      socketConfig.rejectUnauthorized = false;
      socketConfig.servername = 'redis.nasfong.site'; // Required for SNI
    }

    redisClient = createClient({
      url: REDIS_URL,
      socket: socketConfig,
      legacyMode: false,
    });

    redisClient.on('error', (err) => {
      console.error('Redis Client Error:', err.message || err);
    });
    redisClient.on('connect', () => console.warn('Redis Connected'));
    redisClient.on('ready', () => console.warn('Redis Ready'));
    redisClient.on('reconnecting', () => console.warn('Redis Reconnecting...'));
    redisClient.on('close', () => console.warn('Redis Connection Closed'));

    if (!redisClient.isOpen) {
      await redisClient.connect();
    }

    return redisClient;
  } catch (_error) {
    console.error('Failed to connect to Redis:', _error);
    throw _error;
  }
};

export const cacheGet = async (key: string) => {
  try {
    const client = await getRedisClient();
    const data = await client.get(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error(`Cache get error for key ${key}:`, error);
    return null;
  }
};

export const cacheSet = async (key: string, value: never, expiry: number = CACHE_EXPIRY.CARS_LIST) => {
  try {
    const client = await getRedisClient();
    await client.setEx(key, expiry, JSON.stringify(value));
  } catch (_error) {
    console.error(`Cache set error for key ${key}:`, _error);
  }
};

export const cacheDelete = async (key: string) => {
  try {
    const client = await getRedisClient();
    await client.del(key);
  } catch (error) {
    console.error(`Cache delete error for key ${key}:`, error);
  }
};

export const cacheClear = async (pattern: string) => {
  try {
    const client = await getRedisClient();
    const keys = await client.keys(pattern);
    if (keys.length > 0) {
      await client.del(keys);
    }
  } catch (error) {
    console.error(`Cache clear error for pattern ${pattern}:`, error);
  }
};

// New selective cache operations to avoid clearing entire list

/**
 * Get a specific car from the cached cars list
 */
export const cacheGetCarFromList = async (carId: string) => {
  try {
    const cars = await cacheGet(CACHE_KEYS.CARS_LIST);
    if (!cars || !Array.isArray(cars)) {
      return null;
    }
    return cars.find((car: any) => car.id === carId) || null;
  } catch (_error) {
    console.error(`Cache get car from list error for ID ${carId}:`, _error);
    return null;
  }
};

/**
 * Update a specific car in the cached cars list without clearing the entire cache
 */
export const cacheUpdateCarInList = async (updatedCar: never) => {
  try {
    const cars = await cacheGet(CACHE_KEYS.CARS_LIST);
    if (!cars || !Array.isArray(cars)) {
      console.warn(`[cacheUpdateCarInList] Cache not found for car ${(updatedCar as Record<string, unknown>).id}`);
      return false;
    }

    const index = cars.findIndex((car: never) => car.id === updatedCar.id);
    if (index === -1) {
      console.warn(`[cacheUpdateCarInList] Car ${(updatedCar as Record<string, unknown>).id} not found in cache`);
      return false;
    }

    cars[index] = updatedCar;
    await cacheSet(CACHE_KEYS.CARS_LIST, cars, CACHE_EXPIRY.CARS_LIST);
    console.warn(`[cacheUpdateCarInList] Successfully updated car ${(updatedCar as Record<string, unknown>).id} in cache`);
    return true;
  } catch (_error) {
    console.error(`[cacheUpdateCarInList] Error updating car ${(updatedCar as Record<string, unknown>).id}:`, _error);
    return false;
  }
};

/**
 * Delete a specific car from the cached cars list without clearing the entire cache
 */
export const cacheDeleteCarFromList = async (carId: string) => {
  try {
    const cars = await cacheGet(CACHE_KEYS.CARS_LIST);
    if (!cars || !Array.isArray(cars)) {
      console.warn(`[cacheDeleteCarFromList] Cache not found for car ${carId}`);
      return false;
    }

    const filteredCars = cars.filter((car: never) => car.id !== carId);
    if (filteredCars.length === cars.length) {
      console.warn(`[cacheDeleteCarFromList] Car ${carId} not found in cache`);
      return false;
    }

    await cacheSet(CACHE_KEYS.CARS_LIST, filteredCars, CACHE_EXPIRY.CARS_LIST);
    console.warn(`[cacheDeleteCarFromList] Successfully deleted car ${carId} from cache`);
    return true;
  } catch (_error) {
    console.error(`[cacheDeleteCarFromList] Error deleting car ${carId}:`, _error);
    return false;
  }
};

/**
 * Update car order in the cached cars list
 */
export const cacheUpdateCarOrder = async (carIds: string[]) => {
  try {
    const cars = await cacheGet(CACHE_KEYS.CARS_LIST);
    if (!cars || !Array.isArray(cars)) {
      console.warn('Cache list not found or not an array, skipping order update');
      return false;
    }

    console.warn(`Updating order for ${carIds.length} cars in cache`);

    // Create a map of carIds to their new order
    const orderMap = new Map(carIds.map((id, index) => [id, index + 1]));

    // Update displayOrder for all cars in the list
    const updatedCars = cars.map((car: never) => {
      const newOrder = orderMap.get(car.id);
      if (newOrder !== undefined) {
        console.warn(`Car ${car.id}: order changed to ${newOrder}`);
        return {
          ...car,
          displayOrder: newOrder
        };
      }
      return car;
    });

    // Re-sort by displayOrder to maintain consistency
    updatedCars.sort((a: never, b: never) => a.displayOrder - b.displayOrder);

    await cacheSet(CACHE_KEYS.CARS_LIST, updatedCars, CACHE_EXPIRY.CARS_LIST);
    console.warn('Cache order updated successfully');
    return true;
  } catch (_error) {
    console.error(`Cache update car order error:`, _error);
    return false;
  }
};

/**
 * Add a newly created car to the cached cars list
 * If cache doesn't exist, returns false to trigger normal cache set on next GET
 */
export const cacheAddCarToList = async (newCar: never) => {
  try {
    const cars = await cacheGet(CACHE_KEYS.CARS_LIST);
    if (!cars || !Array.isArray(cars)) {
      console.warn(`[cacheAddCarToList] Cache not found, will be populated on next GET for car ${(newCar as Record<string, unknown>).id}`);
      return false;
    }

    // Add new car to the beginning of the list (newest first for display)
    const updatedCars = [newCar, ...cars];
    await cacheSet(CACHE_KEYS.CARS_LIST, updatedCars, CACHE_EXPIRY.CARS_LIST);
    console.warn(`[cacheAddCarToList] Successfully added car ${(newCar as Record<string, unknown>).id} to cache`);
    return true;
  } catch (_error) {
    console.error(`[cacheAddCarToList] Error adding car ${(newCar as Record<string, unknown>).id}:`, _error);
    return false;
  }
};

export const CACHE_KEYS = {
  CARS_LIST: process.env.MINIO_BUCKET_NAME === 'car-images' ? `cars:list` : `dev:cars:list`,
  CARS_PATTERN: process.env.MINIO_BUCKET_NAME === 'car-images' ? 'car:*' : 'dev:car:*',
};

export const CACHE_EXPIRY_TIME = CACHE_EXPIRY;

export const disconnectRedis = async () => {
  if (redisClient && redisClient.isOpen) {
    await redisClient.quit();
    redisClient = null;
  }
};
