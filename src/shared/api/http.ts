import { getRussianApiError } from './errorMessages';

const API_URL = (
    import.meta.env.VITE_API_URL ?? 'http://localhost:8082'
).replace(/\/$/, '');

let accessToken: string | null = null;
let tokenType = 'Bearer';

let refreshPromise: Promise<string | null> | null = null;

export function setAccessToken(
    token: string | null,
    type = 'Bearer',
): void {
    accessToken = token;
    tokenType = type;
}

export function getAccessToken(): string | null {
    return accessToken;
}

/**
 * Единая функция обновления access-токена.
 * Все одновременные вызовы ожидают один и тот же запрос.
 */
export function refreshAccessToken(): Promise<string | null> {
    if (refreshPromise) {
        return refreshPromise;
    }

    refreshPromise = (async (): Promise<string | null> => {
        try {
            const response = await fetch(
                `${API_URL}/api/auth/refresh`,
                {
                    method: 'POST',
                    credentials: 'include',
                },
            );

            if (!response.ok) {
                if (
                    response.status === 401 ||
                    response.status === 403
                ) {
                    setAccessToken(null);

                    window.dispatchEvent(
                        new Event('auth:session-expired'),
                    );
                }

                return null;
            }

            const data: {
                accessToken: string;
                tokenType: string;
            } = await response.json();

            if (!data.accessToken) {
                setAccessToken(null);

                window.dispatchEvent(
                    new Event('auth:session-expired'),
                );

                return null;
            }

            setAccessToken(
                data.accessToken,
                data.tokenType || 'Bearer',
            );

            window.dispatchEvent(
                new Event('auth:token-refreshed'),
            );

            return data.accessToken;
        } catch {
            // При сетевой ошибке не объявляем сессию завершённой.
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
    const isAuthEndpoint = [
        '/api/auth/login',
        '/api/auth/register',
        '/api/auth/refresh',
        '/api/auth/logout',
    ].includes(path);

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
            headers.set('Authorization', `${tokenType} ${token}`);
        } else {
            headers.delete('Authorization');
        }

        return fetch(`${API_URL}${path}`, {
            ...options,
            credentials: 'include',
            headers,
        });
    };

    let response: Response;

    try {
        response = await sendRequest(getAccessToken());
    } catch (error) {
        if (
            error instanceof TypeError ||
            (error instanceof Error &&
                /failed to fetch|networkerror|load failed/i.test(error.message))
        ) {
            throw new Error(
                'Не удалось связаться с сервером. Проверьте подключение и убедитесь, что backend запущен.',
            );
        }

        throw error;
    }

    if (response.status === 401 && !isAuthEndpoint) {
        const newToken = await refreshAccessToken();

        if (newToken) {
            try {
                response = await sendRequest(newToken);
            } catch (error) {
                if (
                    error instanceof TypeError ||
                    (error instanceof Error &&
                        /failed to fetch|networkerror|load failed/i.test(error.message))
                ) {
                    throw new Error(
                        'Не удалось связаться с сервером. Проверьте подключение и убедитесь, что backend запущен.',
                    );
                }

                throw error;
            }
        }
    }

    if (!response.ok) {
        const body = await response.text();

        throw new Error(
            getRussianApiError(body, response.status, path),
        );
    }

    if (response.status === 204) {
        return undefined as T;
    }

    return response.json() as Promise<T>;
}

