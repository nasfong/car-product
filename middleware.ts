import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  // Check if the request is for admin operations
  const isAdminRoute = request.nextUrl.pathname.startsWith('/api/cars') && 
                      (request.method === 'POST' || request.method === 'PUT' || request.method === 'DELETE');
  
  // Allow GET requests (viewing cars) without authentication
  if (request.method === 'GET') {
    return NextResponse.next();
  }
  
  if (isAdminRoute) {
    // Check for admin token in cookies or headers
    const token = request.cookies.get('admin-token')?.value || 
                  request.headers.get('authorization')?.replace('Bearer ', '');
    
    // Simple token validation (in production, use JWT or more secure method)
    if (!token || !isValidAdminToken(token)) {
      return NextResponse.json(
        { error: 'Unauthorized. Admin access required.' },
        { status: 401 }
      );
    }
  }
  
  return NextResponse.next();
}

function isValidAdminToken(token: string): boolean {
  // Simple token validation - in production use proper JWT validation
  // For now, we'll use a simple hash check
  const validTokens = [
    'admin-secret-token-2025', // Simple admin token
    // Add more admin tokens here
  ];
  
  return validTokens.includes(token);
}

export const config = {
  matcher: [
    '/api/cars/:path*',
  ],
};