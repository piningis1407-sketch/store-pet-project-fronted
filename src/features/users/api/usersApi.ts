import { apiRequest } from '../../../shared/api/http';
import type { UserRequest, UserResponse } from '../types/user.types';

export const usersApi = {
    getAll(): Promise<UserResponse[]> {
        return apiRequest<UserResponse[]>('/api/users');
    },

    getById(id: number): Promise<UserResponse> {
        return apiRequest<UserResponse>(`/api/users/${id}`);
    },

    create(data: UserRequest): Promise<UserResponse> {
        return apiRequest<UserResponse>('/api/users', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    },

    update(id: number, data: UserRequest): Promise<UserResponse> {
        return apiRequest<UserResponse>(`/api/users/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    },

    delete(id: number): Promise<void> {
        return apiRequest<void>(`/api/users/${id}`, {
            method: 'DELETE',
        });
    },
};