const API_URL = (
    import.meta.env.VITE_API_URL ?? 'http://localhost:8082'
).replace(/\/$/, '');

let refreshPromise: Promise<string | null> | null = null;

function clearSession(): void {
    sessionStorage.removeItem('accessToken');
    sessionStorage.removeItem('refreshToken');
    sessionStorage.removeItem('tokenType');
}

function redirectToLogin(): void {
    if (
        window.location.pathname !== '/login' &&
        window.location.pathname !== '/register'
    ) {
        window.location.assign('/login');
    }
}

async function refreshAccessToken(): Promise<string | null> {
    // Если несколько запросов одновременно получили 401,
    // выполняем только одно обновление токена.
    if (refreshPromise) {
        return refreshPromise;
    }

    refreshPromise = (async () => {
        const refreshToken = sessionStorage.getItem('refreshToken');

        if (!refreshToken) {
            clearSession();
            redirectToLogin();
            return null;
        }

        try {
            const response = await fetch(`${API_URL}/api/auth/refresh`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ refreshToken }),
            });

            if (!response.ok) {
                clearSession();
                redirectToLogin();
                return null;
            }

            const data: {
                accessToken: string;
                refreshToken: string;
                tokenType: string;
            } = await response.json();

            if (!data.accessToken || !data.refreshToken) {
                clearSession();
                redirectToLogin();
                return null;
            }

            sessionStorage.setItem('accessToken', data.accessToken);
            sessionStorage.setItem('refreshToken', data.refreshToken);
            sessionStorage.setItem('tokenType', data.tokenType || 'Bearer');

            window.dispatchEvent(new Event('auth:token-refreshed'));

            return data.accessToken;
        } catch {
            clearSession();
            redirectToLogin();
            return null;
        } finally {
            refreshPromise = null;
        }
    })();

    return refreshPromise;
}

export async function apiRequest<T>(
    path: string,
    options: RequestInit = {},
): Promise<T> {
    const sendRequest = (token: string | null) => {
        const headers = new Headers(options.headers);

        if (
            options.body != null &&
            !(options.body instanceof FormData) &&
            !headers.has('Content-Type')
        ) {
            headers.set('Content-Type', 'application/json');
        }

        if (token) {
            const tokenType =
                sessionStorage.getItem('tokenType') || 'Bearer';

            headers.set('Authorization', `${tokenType} ${token}`);
        } else {
            headers.delete('Authorization');
        }

        return fetch(`${API_URL}${path}`, {
            ...options,
            headers,
        });
    };

    const isAuthEndpoint = [
        '/api/auth/login',
        '/api/auth/register',
        '/api/auth/refresh',
        '/api/auth/logout',
    ].includes(path);

    let token = sessionStorage.getItem('accessToken');
    let response = await sendRequest(token);

    if (response.status === 401 && !isAuthEndpoint) {
        token = await refreshAccessToken();

        if (token) {
            response = await sendRequest(token);
        }
    }

    if (!response.ok) {
        const message = await response.text();
        throw new Error(message || `HTTP error: ${response.status}`);
    }

    if (response.status === 204) {
        return undefined as T;
    }

    return response.json() as Promise<T>;
}