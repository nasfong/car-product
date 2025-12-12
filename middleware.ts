import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const method = request.method;
  
  // Check if the request is for car API routes
  if (pathname.startsWith('/api/cars')) {
    // Allow GET requests (viewing cars) without authentication
    // This includes SSR fetches from the server component
    if (method === 'GET') {
      return NextResponse.next();
    }
    
    // Check for admin operations (POST, PUT, DELETE)
    const isAdminRoute = method === 'POST' || method === 'PUT' || method === 'DELETE';
    
    if (isAdminRoute) {
      // Check for admin token in cookies or headers
      const token = request.cookies.get('admin-token')?.value || 
                    request.headers.get('authorization')?.replace('Bearer ', '');
      
      // Validate admin token
      if (!token || !isValidAdminToken(token)) {
        return NextResponse.json(
          { error: 'Unauthorized. Admin access required.' },
          { status: 401 }
        );
      }
    }
  }
  
  return NextResponse.next();
}

function isValidAdminToken(token: string): boolean {
  // Simple token validation - in production use proper JWT validation
  const validTokens = [
    'admin-secret-token-2025', // Simple admin token
    process.env.ADMIN_SECRET_TOKEN, // Token from environment variable
    // Add more admin tokens here
  ].filter(Boolean); // Remove undefined values
  
  return validTokens.includes(token);
}

export const config = {
  matcher: [
    '/api/cars/:path*',
  ],
};