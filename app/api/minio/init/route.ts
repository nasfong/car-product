import { NextResponse } from 'next/server';
import { initializeBucket } from '@/lib/minio';

export async function POST() {
  try {
    await initializeBucket();
    return NextResponse.json({ 
      success: true, 
      message: 'MinIO bucket initialized successfully' 
    });
  } catch (error) {
    console.error('Error initializing MinIO bucket:', error);
    return NextResponse.json(
      { error: 'Failed to initialize MinIO bucket' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({ 
    message: 'Use POST to initialize MinIO bucket' 
  });
}
