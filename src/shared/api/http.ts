const API_URL = (
    import.meta.env.VITE_API_URL ?? 'http://localhost:8080'
).replace(/\/$/, '');

export async function apiRequest<T>(
    path: string,
    options: RequestInit = {},
): Promise<T> {
    const token = sessionStorage.getItem('accessToken');

    const headers = new Headers(options.headers);
    if (token) {
        const tokenType = sessionStorage.getItem('tokenType') || 'Bearer';
        headers.set('Authorization', `${tokenType} ${token}`);
    }

    if (token) {
        headers.set('Authorization', `Bearer ${token}`);
    }

    const response = await fetch(`${API_URL}${path}`, {
        ...options,
        headers,
    });

    if (!response.ok) {
        const message = await response.text();
        throw new Error(message || `HTTP error: ${response.status}`);
    }

    if (response.status === 204) {
        return undefined as T;
    }

    return response.json() as Promise<T>;
}