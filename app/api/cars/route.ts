import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { saveImage, saveVideo } from '@/lib/storage';
import { cacheGet, cacheSet, cacheAddCarToList, CACHE_KEYS, CACHE_EXPIRY_TIME } from '@/lib/redis';
import { requireAdmin, unauthorizedResponse } from '@/lib/auth-middleware';

// Configure route for large file uploads
export const runtime = 'nodejs';
export const maxDuration = 60; // 60 seconds timeout

// Disable body size limit for this route
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

// GET /api/cars - List all cars with caching
export async function GET() {
  try {
    // Try to get from cache first
    const cachedCars = await cacheGet(CACHE_KEYS.CARS_LIST);
    if (cachedCars) {
      console.log('Returning cars from cache');
      return NextResponse.json(cachedCars);
    }

    // If not in cache, fetch from database
    const cars = await prisma.car.findMany({
      orderBy: [
        { displayOrder: 'asc' },
        { createdAt: 'desc' }
      ],
    });

    // Cache the result
    await cacheSet(CACHE_KEYS.CARS_LIST, cars, CACHE_EXPIRY_TIME.CARS_LIST);

    return NextResponse.json(cars);
  } catch (error) {
    console.error('Error fetching cars:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal Server Error' },
      { status: 500 }
    );
  }
}

// POST /api/cars - Create a new car
export async function POST(request: NextRequest) {
  // Require admin authentication
  if (!requireAdmin(request)) {
    return unauthorizedResponse();
  }

  try {
    // Parse form data with error handling for large uploads
    let formData: FormData;
    try {
      formData = await request.formData();
    } catch (_error) {
      const err = _error as Error;
      console.error('FormData parsing error:', err.message);
      // Only catch specific size-related errors
      if (err.message?.includes('Request body exceeded') ||
        err.message?.includes('body size limit') ||
        err.message?.includes('Max body size')) {
        return NextResponse.json(
          { error: `ផាំងខ្ទប់ធំពេក! សូមកាត់បន្ថយទំហំឯកសារ។ ទំហំអតិបរមា 300MB។ ${err.message}` },
          { status: 413 }
        );
      }
      // Re-throw other errors to see what's actually happening
      console.error('Unexpected FormData error:', err);
      return NextResponse.json(
        { error: `មិនអាចដំណើរការទិន្នន័យបាន: ${err.message}` },
        { status: 400 }
      );
    }

    // Get image files
    const imageFiles = formData.getAll('images') as File[];

    if (imageFiles.length === 0) {
      return NextResponse.json(
        { error: 'At least one image is required' },
        { status: 400 }
      );
    }

    // Upload all images in parallel for better performance
    const imageUrls = await Promise.all(
      imageFiles.map(async (file) => {
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        return saveImage(buffer, file.name);
      })
    );

    // Get video files - validate sizes first, then upload in parallel
    const videoFiles = formData.getAll('videos') as File[];
    const oversizedVideo = videoFiles.find(f => f.size > 200 * 1024 * 1024);
    if (oversizedVideo) {
      return NextResponse.json(
        { error: `វីដេអោ ${oversizedVideo.name} ធំពេកពេក។ ទំហំអតិបរមា 200MB។` },
        { status: 400 }
      );
    }

    const videoUrls = await Promise.all(
      videoFiles.map(async (file) => {
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        return saveVideo(buffer, file.name);
      })
    );

    const nextOrder = 0;

    // Create car in database
    const createdAtStr = formData.get('createdAt') as string;
    const createdAtDate = createdAtStr ? new Date(createdAtStr) : new Date();
    
    const car = await prisma.car.create({
      data: {
        name: formData.get('name') as string,
        price: formData.get('price') as string,
        transmission: formData.get('transmission') as string,
        fuelType: formData.get('fuelType') as string,
        images: imageUrls,
        videos: videoUrls,
        location: formData.get('location') as string || 'Phnom Penh',
        description: formData.get('description') as string || null,
        vehicleType: formData.get('vehicleType') as string || null,
        color: formData.get('color') as string || null,
        papers: formData.get('papers') as string || null,
        tiktokUrl: formData.get('tiktokUrl') as string || null,
        status: parseInt(formData.get('status') as string) || 1,
        displayOrder: nextOrder,
        createdAt: createdAtDate,
      },
    });

    // Add new car to cache (if cache exists) or let next GET fetch from DB
    const cacheAdded = await cacheAddCarToList(car);
    if (cacheAdded) {
      console.log(`[POST] Car ${car.id} added to Redis cache`);
    } else {
      console.log(`[POST] Cache was empty, will be refreshed on next GET`);
    }

    return NextResponse.json(car, { status: 201 });
  } catch (error) {
    const err = error as Error;
    console.error('Error creating car:', err.message);
    return NextResponse.json(
      { error: `មិនអាចបន្ថែមរថយន្តបានទេ។ សូមពិនិត្យមើលះជាងវិញ។${err.message}` },
      { status: 500 }
    );
  }
}
