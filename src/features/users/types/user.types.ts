export type Role = 'USER' | 'ADMIN';

export interface UserRequest {
    name: string;
    email: string;
}

export interface UserResponse {
    id: number;
    name: string;
    email: string;
    role: Role;
    createdAt: string;
}