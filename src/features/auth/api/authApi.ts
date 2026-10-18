import { apiRequest } from '../../../shared/api/http';
import type {
    AuthResponse,
    LoginRequest,
    RefreshTokenRequest,
    RegisterRequest,
} from '../types/auth.types';

export const authApi = {
    register(data: RegisterRequest): Promise<AuthResponse> {
        return apiRequest<AuthResponse>('/api/auth/register', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    },

    login(data: LoginRequest): Promise<AuthResponse> {
        return apiRequest<AuthResponse>('/api/auth/login', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    },

    refresh(data: RefreshTokenRequest): Promise<AuthResponse> {
        return apiRequest<AuthResponse>('/api/auth/refresh', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    },

    logout(refreshToken: string): Promise<void> {
        return apiRequest<void>('/api/auth/logout', {
            method: 'POST',
            body: JSON.stringify({ refreshToken }),
        });
    },


};

