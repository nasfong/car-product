import { NextRequest, NextResponse } from 'next/server';

/**
 * Validates admin token from cookies or authorization header
 */
export function isValidAdminToken(token: string): boolean {
  const validTokens = [
    'admin-secret-token-2025',
    process.env.ADMIN_SECRET_TOKEN,
  ].filter(Boolean);

  return validTokens.includes(token);
}

/**
 * Extracts admin token from request
 */
export function getAdminToken(request: NextRequest): string | null {
  return request.cookies.get('admin-token')?.value ||
    request.headers.get('authorization')?.replace('Bearer ', '') ||
    null;
}

/**
 * Middleware to protect admin routes
 * Usage: if (!requireAdmin(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
 */
export function requireAdmin(request: NextRequest): boolean {
  const token = getAdminToken(request);
  return token ? isValidAdminToken(token) : false;
}

/**
 * Returns unauthorized response
 */
export function unauthorizedResponse() {
  return NextResponse.json(
    { error: 'Unauthorized. Admin access required.' },
    { status: 401 }
  );
}
