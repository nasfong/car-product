import { NextRequest, NextResponse } from 'next/server';
import { AUTH } from '@/lib/constants';

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();
    
    if (username === AUTH.admin.username && password === AUTH.admin.password) {
      const token = AUTH.admin.token;
      
      const response = NextResponse.json({ 
        success: true, 
        message: 'Login successful',
        token 
      });
      
      // Set HTTP-only cookie for security
      response.cookies.set('admin-token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 60 * 60 * 24 * 7 // 7 days
      });
      
      return response;
    } else {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }
  } catch (error) {
    return NextResponse.json(
      { error: 'Login failed' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  // Logout endpoint
  const response = NextResponse.json({ message: 'Logged out successfully' });
  
  // Clear the admin token cookie
  response.cookies.set('admin-token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 0 // Expire immediately
  });
  
  return response;
}