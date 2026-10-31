import { apiRequest } from '../../../shared/api/http';
import type {
    AuthResponse,
    LoginRequest,
    RegisterRequest,
    UserProfileResponse,
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

    getCurrentUserProfile(): Promise<UserProfileResponse> {
        return apiRequest<UserProfileResponse>('/api/auth/me');
    },

    logout(): Promise<void> {
        return apiRequest<void>('/api/auth/logout', {
            method: 'POST',
        });
    },
};