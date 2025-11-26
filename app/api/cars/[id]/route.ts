import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { uploadImage, deleteImage } from '@/lib/minio';

// GET /api/cars/[id] - Get a single car
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const car = await prisma.car.findUnique({
      where: { id: params.id },
    });

    if (!car) {
      return NextResponse.json(
        { error: 'Car not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(car);
  } catch (error) {
    console.error('Error fetching car:', error);
    return NextResponse.json(
      { error: 'Failed to fetch car' },
      { status: 500 }
    );
  }
}

// PUT /api/cars/[id] - Update a car
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const formData = await request.formData();
    
    // Check if car exists
    const existingCar = await prisma.car.findUnique({
      where: { id: params.id },
    });

    if (!existingCar) {
      return NextResponse.json(
        { error: 'Car not found' },
        { status: 404 }
      );
    }

    // Handle image update
    let imageUrl = existingCar.image;
    const imageFile = formData.get('image') as File | null;

    if (imageFile && imageFile.size > 0) {
      // Delete old image
      if (existingCar.image) {
        await deleteImage(existingCar.image);
      }
      
      // Upload new image
      const bytes = await imageFile.arrayBuffer();
      const buffer = Buffer.from(bytes);
      imageUrl = await uploadImage(buffer, imageFile.name, imageFile.type);
    }

    // Update car in database
    const updatedCar = await prisma.car.update({
      where: { id: params.id },
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

    return NextResponse.json(updatedCar);
  } catch (error) {
    console.error('Error updating car:', error);
    return NextResponse.json(
      { error: 'Failed to update car' },
      { status: 500 }
    );
  }
}

// DELETE /api/cars/[id] - Delete a car
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const car = await prisma.car.findUnique({
      where: { id: params.id },
    });

    if (!car) {
      return NextResponse.json(
        { error: 'Car not found' },
        { status: 404 }
      );
    }

    // Delete image from MinIO
    if (car.image) {
      await deleteImage(car.image);
    }

    // Delete car from database
    await prisma.car.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: 'Car deleted successfully' });
  } catch (error) {
    console.error('Error deleting car:', error);
    return NextResponse.json(
      { error: 'Failed to delete car' },
      { status: 500 }
    );
  }
}
