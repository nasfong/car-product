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
    
    // Debug: Log all form data
    console.log('PUT /api/cars/[id] - Received form data:');
    for (const [key, value] of formData.entries()) {
      if (value instanceof File) {
        console.log(`  ${key}: File(${value.name}, ${value.size} bytes)`);
      } else {
        console.log(`  ${key}: ${value}`);
      }
    }
    
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

    // Parse and validate form data
    const name = formData.get('name') as string;
    const brand = formData.get('brand') as string;
    const priceStr = formData.get('price') as string;
    const yearStr = formData.get('year') as string;
    const transmission = formData.get('transmission') as string;
    const fuelType = formData.get('fuelType') as string;
    const condition = formData.get('condition') as string;
    const location = formData.get('location') as string;
    const description = formData.get('description') as string;
    const vehicleType = formData.get('vehicleType') as string;
    const sold = formData.get('sold') === 'true';

    // Convert and validate numeric fields
    const price = parseFloat(priceStr);
    const year = parseInt(yearStr);

    if (isNaN(price) || price <= 0) {
      return NextResponse.json(
        { error: 'Invalid price value' },
        { status: 400 }
      );
    }

    if (isNaN(year) || year < 1900 || year > new Date().getFullYear() + 1) {
      return NextResponse.json(
        { error: 'Invalid year value' },
        { status: 400 }
      );
    }

    // Update car in database
    const updatedCar = await prisma.car.update({
      where: { id },
      data: {
        name,
        brand,
        price,
        year,
        transmission,
        fuelType,
        images: finalImages,
        condition,
        location: location || existingCar.location,
        description: description || null,
        vehicleType: vehicleType || existingCar.vehicleType,
        sold: sold,
      },
    });

    return NextResponse.json(updatedCar);
  } catch (error) {
    console.error('Error updating car:', error);
    
    // Return more detailed error information
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Failed to update car', details: errorMessage },
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
