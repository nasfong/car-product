import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { saveImage } from '@/lib/storage';

// GET /api/cars - List all cars
export async function GET() {
  try {
    const cars = await prisma.car.findMany({
      orderBy: { createdAt: 'desc' },
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
    const formData = await request.formData();
    
    // Get image files
    const imageFiles = formData.getAll('images') as File[];
    let imageUrls: string[] = [];

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

    // Create car in database
    const car = await prisma.car.create({
      data: {
        name: formData.get('name') as string,
        brand: formData.get('brand') as string,
        price: parseFloat(formData.get('price') as string),
        year: parseInt(formData.get('year') as string),
        mileage: formData.get('mileage') as string,
        transmission: formData.get('transmission') as string,
        fuelType: formData.get('fuelType') as string,
        images: imageUrls,
        condition: formData.get('condition') as string,
        location: formData.get('location') as string || 'Phnom Penh',
        description: formData.get('description') as string || null,
        vehicleType: formData.get('vehicleType') as string || null,
      },
    });

    return NextResponse.json(car, { status: 201 });
  } catch (error) {
    console.error('Error creating car:', error);
    return NextResponse.json(
      { error: 'Failed to create car' },
      { status: 500 }
    );
  }
}
