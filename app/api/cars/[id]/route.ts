import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { saveImage, deleteImage, saveVideo, deleteVideo } from '@/lib/storage';

// Configure route for large file uploads
export const runtime = 'nodejs';
export const maxDuration = 60; // 60 seconds timeout

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
    const err = error as Error;
    console.error('Error fetching car:', err.message);
    return NextResponse.json(
      { error: `Failed to fetch car: ${err.message}` },
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

    // Parse form data with error handling for large uploads
    let formData: FormData;
    try {
      formData = await request.formData();
    } catch (error) {
      const err = error as Error;
      console.error('FormData parsing error:', err.message);
      // Only catch specific size-related errors
      if (err.message?.includes('Request body exceeded') ||
        err.message?.includes('body size limit') ||
        err.message?.includes('Max body size')) {
        return NextResponse.json(
          { error: 'ផាំងខ្ទប់ធំពេក! សូមកាត់បន្ថយទំហំឯកសារ។ ទំហំអតិបរមា 300MB។' },
          { status: 413 }
        );
      }
      // Re-throw other errors to see what's actually happening
      console.error('Unexpected FormData error:', err.message);
      return NextResponse.json(
        { error: `មិនអាចដំណើរការទិន្នន័យបាន: ${err.message}` },
        { status: 400 }
      );
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
      try {
        await deleteImage(removedImg);
      } catch (error) {
        const err = error as Error;
        console.warn('Failed to delete image:', removedImg, error);
        return NextResponse.json(
          { error: `មិនអាចដំណើរការទិន្នន័យបាន: ${err.message}` },
          { status: 400 }
        );
      }
    }

    // Handle video updates
    let finalVideos: string[] = [];

    // Get existing videos from form data
    const existingVideosStr = formData.get('existingVideos') as string;
    if (existingVideosStr) {
      try {
        const existingVideos = JSON.parse(existingVideosStr) as string[];
        finalVideos = [...existingVideos];
      } catch (e) {
        console.error('Error parsing existing videos:', e);
      }
    }

    // Handle new video uploads
    const newVideoFiles = formData.getAll('videos') as File[];
    if (newVideoFiles.length > 0) {
      for (const file of newVideoFiles) {
        if (file.size > 0 && file.name) {
          if (file.size > 200 * 1024 * 1024) { // 200MB limit
            return NextResponse.json(
              { error: `វីដេអោ ${file.name} ធំពេកពេក។ ទំហំអតិបរមា 200MB។` },
              { status: 400 }
            );
          }
          const bytes = await file.arrayBuffer();
          const buffer = Buffer.from(bytes);
          const videoUrl = await saveVideo(buffer, file.name);
          finalVideos.push(videoUrl);
        }
      }
    }

    // Delete removed videos (compare with existing car videos)
    const removedVideos = (existingCar.videos || []).filter(vid => !finalVideos.includes(vid));
    for (const removedVid of removedVideos) {
      try {
        await deleteVideo(removedVid);
      } catch (error) {
        const err = error as Error;
        console.warn('Failed to delete video:', removedVid, error);
        return NextResponse.json(
          { error: `មិនអាចដំណើរការទិន្នន័យបាន: ${err.message}` },
          { status: 400 }
        );
      }
    }

    // Parse and validate form data
    const name = formData.get('name') as string;
    const price = formData.get('price') as string;
    const transmission = formData.get('transmission') as string;
    const fuelType = formData.get('fuelType') as string;
    const location = formData.get('location') as string;
    const description = formData.get('description') as string;
    const vehicleType = formData.get('vehicleType') as string;
    const color = formData.get('color') as string;
    const papers = formData.get('papers') as string;
    const tiktokUrl = formData.get('tiktokUrl') as string;
    const sold = formData.get('sold') === 'true';

    // Update car in database
    const updatedCar = await prisma.car.update({
      where: { id },
      data: {
        name,
        price,
        transmission,
        fuelType,
        images: finalImages,
        videos: finalVideos,
        location: location || existingCar.location,
        description: description || null,
        vehicleType: vehicleType || existingCar.vehicleType,
        color: color || null,
        papers: papers || null,
        tiktokUrl: tiktokUrl || null,
        sold,
      },
    });

    return NextResponse.json(updatedCar);
  } catch (error) {
    console.error('Error updating car:', error);
    // Return more detailed error information
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'មិនអាចកែសំរួលរថយន្តបានទេ។ សូមពិនិត្យមើលះជាងវិញ។', details: errorMessage },
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

    // Delete all images from MinIO storage
    if (car.images && car.images.length > 0) {
      for (const image of car.images) {
        try {
          await deleteImage(image);
        } catch (error) {
          const err = error as Error;
          console.error('Failed to delete image:', err.message);
          NextResponse.json(
            { error: `មិនអាចដំណើរការទិន្នន័យបាន: ${err.message}` },
            { status: 400 }
          );
          // Don't throw error here, continue with deletion process
        }
      }
    }

    // Delete all videos from MinIO storage
    if (car.videos && car.videos.length > 0) {
      for (const video of car.videos) {
        try {
          await deleteVideo(video);
        } catch (error) {
          const err = error as Error;
          console.error('Failed to delete video:', err.message);
          NextResponse.json(
            { error: `មិនអាចដំណើរការទិន្នន័យបាន: ${err.message}` },
            { status: 400 }
          );
        }
      }
    }

    // Delete car from database
    await prisma.car.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'លុបរថយន្តចេញដោយជោគជ័យ។' });
  } catch (error) {
    console.error('Error deleting car:', error);
    return NextResponse.json(
      { error: 'មិនអាចលុបរថយន្តបានទេ។ សូមពិនិត្យមើលះជាងវិញ។' },
      { status: 500 }
    );
  }
}
