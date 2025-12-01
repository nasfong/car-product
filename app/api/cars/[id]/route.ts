import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { saveImage, deleteImage } from '@/lib/storage';

// GET /api/cars/[id] - Get a single car
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const car = await prisma.car.findUnique({
      where: { id },
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
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const formData = await request.formData();
    
    // Check if car exists
    const existingCar = await prisma.car.findUnique({
      where: { id },
    });

    if (!existingCar) {
      return NextResponse.json(
        { error: 'Car not found' },
        { status: 404 }
      );
    }

    // Handle image updates
    let finalImages: string[] = [];
    
    // Get existing images from form data
    const existingImagesStr = formData.get('existingImages') as string;
    if (existingImagesStr) {
      try {
        const existingImages = JSON.parse(existingImagesStr) as string[];
        finalImages = [...existingImages];
      } catch (e) {
        console.error('Error parsing existing images:', e);
      }
    }

    // Handle new image uploads
    const newImageFiles = formData.getAll('images') as File[];
    if (newImageFiles.length > 0) {
      for (const file of newImageFiles) {
        if (file.size > 0 && file.name) {
          const bytes = await file.arrayBuffer();
          const buffer = Buffer.from(bytes);
          const imageUrl = await saveImage(buffer, file.name);
          finalImages.push(imageUrl);
        }
      }
    }

    // Delete removed images (compare with existing car images)
    const removedImages = (existingCar.images || []).filter(img => !finalImages.includes(img));
    for (const removedImg of removedImages) {
      if (removedImg.startsWith('/uploads/')) {
        await deleteImage(removedImg);
      }
    }

    // Update car in database
    const updatedCar = await prisma.car.update({
      where: { id },
      data: {
        name: formData.get('name') as string,
        brand: formData.get('brand') as string,
        price: parseFloat(formData.get('price') as string),
        year: parseInt(formData.get('year') as string),
        mileage: formData.get('mileage') as string,
        transmission: formData.get('transmission') as string,
        fuelType: formData.get('fuelType') as string,
        images: finalImages,
        condition: formData.get('condition') as string,
        location: formData.get('location') as string || existingCar.location,
        description: formData.get('description') as string || null,
        vehicleType: formData.get('vehicleType') as string || existingCar.vehicleType,
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
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const car = await prisma.car.findUnique({
      where: { id },
    });

    if (!car) {
      return NextResponse.json(
        { error: 'Car not found' },
        { status: 404 }
      );
    }

    // Delete all images from local storage
    if (car.images && car.images.length > 0) {
      for (const image of car.images) {
        if (image.startsWith('/uploads/')) {
          await deleteImage(image);
        }
      }
    }

    // Delete car from database
    await prisma.car.delete({
      where: { id },
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
