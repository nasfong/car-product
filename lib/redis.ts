import { createClient, RedisClientType } from 'redis';

let redisClient: RedisClientType | null = null;

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';
const CACHE_EXPIRY = {
  CARS_LIST: 5 * 60, // 5 minutes
  CAR_DETAIL: 10 * 60, // 10 minutes
  ADMIN_CHECK: 1 * 60, // 1 minute
};

export const getRedisClient = async (): Promise<RedisClientType> => {
  if (redisClient && redisClient.isOpen) {
    return redisClient;
  }

  try {
    const socketConfig: any = {
      reconnectStrategy: (retries: number) => {
        if (retries > 10) return new Error('Redis max retries exceeded');
        return Math.min(retries * 100, 3000); // Increased from 50ms to 100ms
      },
      keepAlive: 30000, // Send keep-alive every 30 seconds
      noDelay: true,
      connectTimeout: 10000, // 10 second timeout
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
      console.error('Redis Client Error:', err.message);
    });
    redisClient.on('connect', () => console.log('Redis Connected'));
    redisClient.on('ready', () => console.log('Redis Ready'));
    redisClient.on('reconnecting', () => console.log('Redis Reconnecting...'));
    redisClient.on('close', () => console.log('Redis Connection Closed'));

    if (!redisClient.isOpen) {
      await redisClient.connect();
    }

    return redisClient;
  } catch (error) {
    console.error('Failed to connect to Redis:', error);
    throw error;
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

export const cacheSet = async (key: string, value: any, expiry: number = CACHE_EXPIRY.CARS_LIST) => {
  try {
    const client = await getRedisClient();
    await client.setEx(key, expiry, JSON.stringify(value));
  } catch (error) {
    console.error(`Cache set error for key ${key}:`, error);
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

export const CACHE_KEYS = {
  CARS_LIST: 'cars:list',
  CAR_DETAIL: (id: string) => `car:${id}`,
  CARS_PATTERN: 'car:*',
};

export const CACHE_EXPIRY_TIME = CACHE_EXPIRY;

export const disconnectRedis = async () => {
  if (redisClient && redisClient.isOpen) {
    await redisClient.quit();
    redisClient = null;
  }
};
