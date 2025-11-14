import type { ApiResponse, User, LoginCredentials, RegisterData } from "@/types"
import { mockUsers } from "@/lib/mock-data"

// Mock API service for authentication
class AuthService {
  private delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

  async login(credentials: LoginCredentials): Promise<ApiResponse<User>> {
    await this.delay(1000) // Simulate network delay

    const user = mockUsers.find(
      (u) => u.email === credentials.email && credentials.password === "password123", // Mock password
    )

    if (user) {
      // Set both localStorage and cookie for authentication
      localStorage.setItem("auth_token", "mock_token_" + user.id)
      // Set cookie for middleware
      document.cookie = `auth-token=mock_token_${user.id}; path=/; max-age=86400; samesite=strict`
      return {
        success: true,
        data: user,
        message: "Login successful",
      }
    }

    return {
      success: false,
      error: "Invalid email or password",
    }
  }

  async register(data: RegisterData): Promise<ApiResponse<User>> {
    await this.delay(1000)

    // Check if user already exists
    const existingUser = mockUsers.find((u) => u.email === data.email)
    if (existingUser) {
      return {
        success: false,
        error: "User with this email already exists",
      }
    }

    const newUser: User = {
      id: "user_" + Date.now(),
      email: data.email,
      firstName: data.firstName,
      lastName: data.lastName,
      role: data.role,
      schoolId: data.schoolId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    // If registering as aspirant, add aspirant-specific fields
    if (data.role === "aspirant") {
      const aspirantUser = {
        ...newUser,
        admissionStatus: "pending" as const,
        applicationDate: new Date().toISOString(),
        applicationId: `APP-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`,
      }
      mockUsers.push(aspirantUser as any)
      localStorage.setItem("auth_token", "mock_token_" + aspirantUser.id)
      return {
        success: true,
        data: aspirantUser as any,
        message: "Registration successful",
      }
    }

    mockUsers.push(newUser)
    localStorage.setItem("auth_token", "mock_token_" + newUser.id)

    return {
      success: true,
      data: newUser,
      message: "Registration successful",
    }
  }

  logout(): void {
    localStorage.removeItem("auth_token")
    // Clear the auth cookie
    document.cookie = "auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"
  }

  async getCurrentUser(): Promise<ApiResponse<User>> {
    await this.delay(500)

    const token = localStorage.getItem("auth_token")
    if (!token) {
      return {
        success: false,
        error: "No authentication token found",
      }
    }

    const userId = token.replace("mock_token_", "")
    const user = mockUsers.find((u) => u.id === userId)

    if (user) {
      return {
        success: true,
        data: user,
      }
    }

    return {
      success: false,
      error: "User not found",
    }
  }
}

export const authService = new AuthService()
