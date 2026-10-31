export interface RegisterRequest {
    name: string;
    email: string;
    password: string;
}

export interface LoginRequest {
    email: string;
    password: string;
}

export interface AuthResponse {
    accessToken: string;
    tokenType: string;
}

export interface UserProfileResponse {
    name: string;
    email: string;
}