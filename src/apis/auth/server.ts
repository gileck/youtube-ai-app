import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { login, logout, me, register, updateProfile } from './index';
import {
    ApiHandlerContext,
    CurrentUserResponse,
    LoginRequest,
    LoginResponse,
    LogoutResponse,
    RegisterRequest,
    RegisterResponse,
    UpdateProfileRequest,
    UpdateProfileResponse,
    UserResponse
} from './types';
import * as users from '@/server/database/collections/users/users';
import { User } from '@/server/database/collections/users/types';

// Constants
const SALT_ROUNDS = 10;
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret'; // Should be in environment variables
const JWT_EXPIRES_IN = '7d';
const COOKIE_NAME = 'auth_token';
const COOKIE_OPTIONS = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict' as const,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: '/'
};

// Utility to convert User from DB to UserResponse for client
const sanitizeUser = (user: User): UserResponse => {
    return {
        id: user._id.toString(),
        username: user.username,
        email: user.email,
        createdAt: user.createdAt.toISOString(),
        profilePicture: user.profilePicture
    };
};

// Register endpoint
export const registerUser = async (
    request: RegisterRequest,
    context: ApiHandlerContext
): Promise<RegisterResponse> => {
    try {
        // Validate input
        if (!request.username || !request.email || !request.password) {
            return { error: "Required fields missing" };
        }

        // Check for existing user
        const existingUser = await users.findUserByEmail(request.email);
        if (existingUser) {
            return { error: "Email already exists" };
        }

        // Hash password and create user
        const passwordHash = await bcrypt.hash(request.password, SALT_ROUNDS);
        const newUser = await users.insertUser({
            username: request.username,
            email: request.email,
            password_hash: passwordHash,
            createdAt: new Date(),
            updatedAt: new Date(),
        });

        // Generate JWT token
        const token = jwt.sign(
            { userId: newUser._id.toHexString() },
            JWT_SECRET,
            { expiresIn: JWT_EXPIRES_IN }
        );

        // Set auth cookie
        context.setCookie(COOKIE_NAME, token, COOKIE_OPTIONS);

        return { user: sanitizeUser(newUser) };
    } catch (error: unknown) {
        console.error("Registration error:", error);
        return { error: error instanceof Error ? error.message : "Registration failed" };
    }
};

// Login endpoint
export const loginUser = async (
    request: LoginRequest,
    context: ApiHandlerContext
): Promise<LoginResponse> => {
    try {
        // Validate input
        if (!request.email || !request.password) {
            return { error: "Email and password are required" };
        }

        // Find user by email
        const user = await users.findUserByEmail(request.email);
        if (!user) {
            return { error: "Invalid email or password" };
        }

        // Verify password
        const isPasswordValid = await bcrypt.compare(request.password, user.password_hash);
        if (!isPasswordValid) {
            return { error: "Invalid email or password" };
        }

        // Generate JWT token
        const token = jwt.sign(
            { userId: user._id.toHexString() },
            JWT_SECRET,
            { expiresIn: JWT_EXPIRES_IN }
        );

        // Set auth cookie
        context.setCookie(COOKIE_NAME, token, COOKIE_OPTIONS);

        return { user: sanitizeUser(user) };
    } catch (error: unknown) {
        console.error("Login error:", error);
        return { error: error instanceof Error ? error.message : "Login failed" };
    }
};

// Get current user endpoint
export const getCurrentUser = async (
    _: unknown,
    context: ApiHandlerContext
): Promise<CurrentUserResponse> => {
    try {
        if (!context.userId) {
            return { error: "Not authenticated" };
        }

        const user = await users.findUserById(context.userId);
        if (!user) {
            return { error: "User not found" };
        }

        return { user: sanitizeUser(user) };
    } catch (error: unknown) {
        console.error("Get current user error:", error);
        return { error: error instanceof Error ? error.message : "Failed to get current user" };
    }
};

// Update profile endpoint
export const updateUserProfile = async (
    request: UpdateProfileRequest,
    context: ApiHandlerContext
): Promise<UpdateProfileResponse> => {
    try {
        if (!context.userId) {
            return { success: false, error: "Not authenticated" };
        }

        // Validate update data
        if (!request.username && !request.profilePicture) {
            return { success: false, error: "No update data provided" };
        }

        // Prepare update object
        const updateData: {
            updatedAt: Date;
            username?: string;
            profilePicture?: string;
        } = {
            updatedAt: new Date()
        };

        if (request.username) {
            updateData.username = request.username;
        }

        if (request.profilePicture) {
            updateData.profilePicture = request.profilePicture;
        }

        // Update user in database
        const updatedUser = await users.updateUser(context.userId, updateData);
        if (!updatedUser) {
            return { success: false, error: "User not found" };
        }

        return {
            success: true,
            user: sanitizeUser(updatedUser)
        };
    } catch (error: unknown) {
        console.error("Update profile error:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Failed to update profile"
        };
    }
};

// Logout endpoint
export const logoutUser = async (
    _: unknown,
    context: ApiHandlerContext
): Promise<LogoutResponse> => {
    try {
        context.clearCookie(COOKIE_NAME, COOKIE_OPTIONS);
        return { success: true };
    } catch (error: unknown) {
        console.error("Logout error:", error);
        return { success: false, error: error instanceof Error ? error.message : "Logout failed" };
    }
};

// Export API endpoint names
export {
    login,
    register,
    logout,
    me,
    updateProfile
};
