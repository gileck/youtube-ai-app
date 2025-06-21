import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { login } from '../index';
import {
    ApiHandlerContext,
    LoginRequest,
    LoginResponse,
} from '../types';
import * as users from '@/server/database/collections/users/users';
import { JWT_SECRET, JWT_EXPIRES_IN, COOKIE_NAME, COOKIE_OPTIONS, sanitizeUser } from '../server';

// Login endpoint
export const loginUser = async (
    request: LoginRequest,
    context: ApiHandlerContext
): Promise<LoginResponse> => {
    try {
        // Validate input
        if (!request.username || !request.password) {
            return { error: "Username and password are required" };
        }

        // Find user by username
        const user = await users.findUserByUsername(request.username);
        if (!user) {
            return { error: "Invalid username or password" };
        }

        // Verify password
        const isPasswordValid = await bcrypt.compare(request.password, user.password_hash);
        if (!isPasswordValid) {
            return { error: "Invalid username or password" };
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

// Export API endpoint name
export { login }; 