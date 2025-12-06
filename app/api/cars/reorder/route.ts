import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { AUTH } from '@/lib/constants';

// PUT /api/cars/reorder - Update car display order
export async function PUT(request: NextRequest) {
  try {
    // Check authorization
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');
    
    if (!token || token !== AUTH.admin.token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { carIds } = body;

    if (!Array.isArray(carIds) || carIds.length === 0) {
      return NextResponse.json(
        { error: 'Invalid car IDs array' },
        { status: 400 }
      );
    }

    // Update display order for each car
    const updatePromises = carIds.map((carId: string, index: number) => 
      prisma.car.update({
        where: { id: carId },
        data: { displayOrder: index + 1 }
      })
    );

    await Promise.all(updatePromises);

    return NextResponse.json({ 
      success: true, 
      message: 'Car order updated successfully' 
    });

  } catch (error) {
    console.error('Error updating car order:', error);
    return NextResponse.json(
      { error: 'Failed to update car order' },
      { status: 500 }
    );
  }
}