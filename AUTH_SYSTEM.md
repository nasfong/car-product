# Authentication System Documentation

## Overview
This application now includes a comprehensive admin authentication system that protects all administrative operations (create, edit, delete cars).

## Authentication Flow

### 1. Protected Operations
- **Create Car**: Requires admin login
- **Edit Car**: Requires admin login  
- **Delete Car**: Requires admin login
- **View Cars**: Public access (no authentication required)

### 2. Middleware Protection
The application uses Next.js middleware (`middleware.ts`) to:
- Intercept all admin operations (POST, PUT, DELETE requests to `/api/cars`)
- Validate authentication tokens
- Return 401 Unauthorized for invalid/missing tokens

### 3. Admin Credentials
**Username**: `admin`
**Password**: `admin123`

### 4. Token Management
- Tokens are stored in both localStorage and HTTP-only cookies
- Token validation happens on every protected request
- Automatic logout clears both storage mechanisms

## User Interface Features

### Login Modal
- Triggered when unauthenticated users attempt admin operations
- Clean, responsive design with error handling
- Shows demo credentials for testing

### Authentication States
- **Unauthenticated**: Only "Add Car" button visible, triggers login modal
- **Authenticated**: Shows admin status, edit/delete buttons, and logout option
- **Auto-detection**: Checks authentication status on page load

### Admin Controls
- Edit/Delete buttons only visible to authenticated admins
- Add Car button works for everyone but requires authentication
- Logout button clears authentication and returns to public view

## API Endpoints

### `/api/auth`
- **POST**: Login with username/password
- **DELETE**: Logout (clears tokens)

### Protected Car APIs
- **POST `/api/cars`**: Create car (admin only)
- **PUT `/api/cars/[id]`**: Update car (admin only)  
- **DELETE `/api/cars/[id]`**: Delete car (admin only)
- **GET `/api/cars`**: List cars (public)
- **GET `/api/cars/[id]`**: View car details (public)

## Security Features

1. **Token-based Authentication**: Secure token validation
2. **HTTP-only Cookies**: Server-side token storage
3. **Client-side Storage**: localStorage for UI state
4. **Route Protection**: Middleware intercepts unauthorized requests
5. **Error Handling**: Proper 401 responses for unauthorized access

## Testing the System

1. **Public Access**: Visit the site - can view all cars
2. **Admin Access**: Click "Add Car" or any Edit/Delete button
3. **Login**: Use admin/admin123 credentials
4. **Admin Operations**: Create, edit, or delete cars
5. **Logout**: Click logout to return to public view

## Development Notes

- Authentication state is managed in the main page component
- All admin operations include Authorization headers
- Form submissions handle 401 responses gracefully
- Middleware provides centralized security control
- Compatible with both development and production environments