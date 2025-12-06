import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { saveImage, saveVideo } from '@/lib/storage';

// Configure route for large file uploads
export const runtime = 'nodejs';
export const maxDuration = 60; // 60 seconds timeout

// GET /api/cars - List all cars
export async function GET() {
  try {
    const cars = await prisma.car.findMany({
      orderBy: [
        { displayOrder: 'asc' },
        { createdAt: 'desc' }
      ],
    });
    
    return NextResponse.json(cars);
  } catch (error) {
    console.error('Error fetching cars:', error);
    return NextResponse.json(
      { error: 'Failed to fetch cars' },
      { status: 500 }
    );
  }
}

// POST /api/cars - Create a new car
export async function POST(request: NextRequest) {
  try {
    // Parse form data with error handling for large uploads
    let formData: FormData;
    try {
      formData = await request.formData();
    } catch (error: any) {
      console.error('FormData parsing error:', error.message);
      // Only catch specific size-related errors
      if (error.message?.includes('Request body exceeded') || 
          error.message?.includes('body size limit') ||
          error.message?.includes('Max body size')) {
        return NextResponse.json(
          { error: 'ផាំងខ្ទប់ធំពេក! សូមកាត់បន្ថយទំហំឯកសារ។ ទំហំអតិបរមា 300MB។' },
          { status: 413 }
        );
      }
      // Re-throw other errors to see what's actually happening
      console.error('Unexpected FormData error:', error);
      return NextResponse.json(
        { error: `មិនអាចដំណើរការទិន្នន័យបាន: ${error.message}` },
        { status: 400 }
      );
    }
    
    // Get image files
    const imageFiles = formData.getAll('images') as File[];
    const imageUrls: string[] = [];

    if (imageFiles.length > 0) {
      for (const file of imageFiles) {
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const imageUrl = await saveImage(buffer, file.name);
        imageUrls.push(imageUrl);
      }
    } else {
      return NextResponse.json(
        { error: 'At least one image is required' },
        { status: 400 }
      );
    }

    // Get video files
    const videoFiles = formData.getAll('videos') as File[];
    const videoUrls: string[] = [];

    if (videoFiles.length > 0) {
      for (const file of videoFiles) {
        if (file.size > 200 * 1024 * 1024) { // 200MB limit
          return NextResponse.json(
            { error: `វីដេអោ ${file.name} ធំពេកពេក។ ទំហំអតិបរមា 200MB។` },
            { status: 400 }
          );
        }
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const videoUrl = await saveVideo(buffer, file.name);
        videoUrls.push(videoUrl);
      }
    }

    // Get the next display order (highest current + 1)
    const maxOrder = await prisma.car.findFirst({
      select: { displayOrder: true },
      orderBy: { displayOrder: 'desc' }
    });
    const nextOrder = (maxOrder?.displayOrder || 0) + 1;

    // Create car in database
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
        sold: formData.get('sold') === 'true',
        displayOrder: nextOrder,
      },
    });

    return NextResponse.json(car, { status: 201 });
  } catch (error) {
    console.error('Error creating car:', error);
    return NextResponse.json(
      { error: 'មិនអាចបន្ថែមរថយន្តបានទេ។ សូមពិនិត្យមើលះជាងវិញ។' },
      { status: 500 }
    );
  }
}
