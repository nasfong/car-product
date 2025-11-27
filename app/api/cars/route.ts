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
    
    // Get image file
    const imageFile = formData.get('image') as File | null;
    let imageUrl = '';

    if (imageFile) {
      const bytes = await imageFile.arrayBuffer();
      const buffer = Buffer.from(bytes);
      imageUrl = await saveImage(buffer, imageFile.name);
    } else {
      return NextResponse.json(
        { error: 'Image is required' },
        { status: 400 }
      );
    }

    // Create car in database
    const car = await prisma.car.create({
      data: {
        name: formData.get('name') as string,
        nameKh: formData.get('nameKh') as string,
        brand: formData.get('brand') as string,
        price: formData.get('price') as string,
        priceUSD: parseFloat(formData.get('priceUSD') as string),
        year: parseInt(formData.get('year') as string),
        mileage: formData.get('mileage') as string,
        transmission: formData.get('transmission') as string,
        transmissionKh: formData.get('transmissionKh') as string,
        fuelType: formData.get('fuelType') as string,
        fuelTypeKh: formData.get('fuelTypeKh') as string,
        image: imageUrl,
        condition: formData.get('condition') as string,
        conditionKh: formData.get('conditionKh') as string,
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
