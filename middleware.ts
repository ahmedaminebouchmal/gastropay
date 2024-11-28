import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// List of public routes that don't require authentication
const publicRoutes = ['/login', '/api/auth/login', '/', '/favicon.ico']

// Edge-compatible JWT verification
async function verifyJWT(token: string, secret: string): Promise<any> {
  try {
    const encoder = new TextEncoder();
    const data = token.split('.');
    
    if (data.length !== 3) {
      throw new Error('Invalid token format');
    }

    // Parse header and payload
    const [headerB64, payloadB64] = data;
    const payload = JSON.parse(
      Buffer.from(payloadB64, 'base64').toString()
    );

    // Check expiration
    if (payload.exp && Date.now() >= payload.exp * 1000) {
      throw new Error('Token expired');
    }

    return payload;
  } catch (error) {
    console.error('JWT verification error:', error);
    throw error;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  console.log('Middleware processing path:', pathname)
  
  // Allow public routes
  if (publicRoutes.includes(pathname)) {
    console.log('Public route accessed:', pathname)
    return NextResponse.next()
  }

  // Check for token in cookies
  const token = request.cookies.get('token')?.value
  console.log('Token present:', !!token)

  // If no token and trying to access protected route, redirect to login
  if (!token) {
    console.log('No token found, redirecting to login')
    const loginUrl = new URL('/login', request.url)
    return NextResponse.redirect(loginUrl)
  }

  try {
    // Verify token using Edge-compatible function
    const decoded = await verifyJWT(token, process.env.JWT_SECRET!)
    console.log('Token verified successfully:', !!decoded)
    
    // If on login page with valid token, redirect to dashboard
    if (pathname === '/login') {
      console.log('Valid token on login page, redirecting to dashboard')
      const dashboardUrl = new URL('/dashboard', request.url)
      return NextResponse.redirect(dashboardUrl)
    }

    return NextResponse.next()
  } catch (error) {
    console.error('Token verification failed:', error)
    // If token is invalid, clear it and redirect to login
    const response = NextResponse.redirect(new URL('/login', request.url))
    response.cookies.delete('token')
    return response
  }
}

export const config = {
  matcher: [
    // Protected routes that require authentication
    '/dashboard/:path*',
    '/api/protected/:path*',
    // Add other protected routes here
    '/login'  // We still want to check login to redirect to dashboard if already authenticated
  ]
}
