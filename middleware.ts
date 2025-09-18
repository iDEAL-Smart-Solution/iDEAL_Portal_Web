import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// Define protected routes for each role
const roleRoutes = {
  student: ["/dashboard/student"],
  parent: ["/dashboard/parent"],
  teacher: ["/dashboard/teacher"],
  school_admin: ["/dashboard/school-admin"],
  super_admin: ["/dashboard/super-admin"],
}

const publicRoutes = ["/", "/auth/login", "/auth/register"]

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Allow public routes
  if (publicRoutes.includes(pathname)) {
    return NextResponse.next()
  }

  // Check if user is authenticated (this would normally check a JWT token)
  const authToken = request.cookies.get("auth-token")?.value

  if (!authToken && !publicRoutes.includes(pathname)) {
    // Redirect to login if not authenticated
    return NextResponse.redirect(new URL("/auth/login", request.url))
  }

  // For demo purposes, we'll allow all authenticated routes
  // In a real app, you'd decode the JWT and check user role
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
}
