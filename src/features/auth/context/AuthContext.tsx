
import {
    createContext,
    useContext,
    useState,
    useEffect,
    type ReactNode,
} from 'react';

import type { AuthResponse } from '../types/auth.types';
import { authApi } from '../api/authApi';
import {
    getAccessToken,
    setAccessToken,
    refreshAccessToken,
} from '../../../shared/api/http';

interface AuthContextValue {
    isAuthenticated: boolean;
    isLoading: boolean;
    accessToken: string | null;
    saveSession: (data: AuthResponse) => void;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [accessToken, setTokenState] = useState<string | null>(
        () => getAccessToken(),
    );

    const [isLoading, setIsLoading] = useState(true);

    const updateAccessToken = (
        token: string | null,
        type = 'Bearer',
    ) => {
        setAccessToken(token, type);
        setTokenState(token);
    };

    useEffect(() => {
        let active = true;

        const handleTokenRefreshed = () => {
            if (active) {
                setTokenState(getAccessToken());
            }
        };

        const handleSessionExpired = () => {
            if (active) {
                setTokenState(null);
            }
        };

        window.addEventListener(
            'auth:token-refreshed',
            handleTokenRefreshed,
        );

        window.addEventListener(
            'auth:session-expired',
            handleSessionExpired,
        );

        const restoreSession = async () => {
            try {
                // Использует общий refreshPromise из http.ts.
                await refreshAccessToken();

                if (active) {
                    setTokenState(getAccessToken());
                }
            } finally {
                if (active) {
                    setIsLoading(false);
                }
            }
        };

        void restoreSession();

        return () => {
            active = false;

            window.removeEventListener(
                'auth:token-refreshed',
                handleTokenRefreshed,
            );

            window.removeEventListener(
                'auth:session-expired',
                handleSessionExpired,
            );
        };
    }, []);

    const saveSession = (data: AuthResponse) => {
        updateAccessToken(
            data.accessToken,
            data.tokenType || 'Bearer',
        );
    };

    const logout = async (): Promise<void> => {
        try {
            // Refresh-токен браузер отправляет в HttpOnly cookie.
            await authApi.logout();
        } catch (error) {
            console.error('Backend logout failed:', error);
        } finally {
            updateAccessToken(null);
            window.location.assign('/login');
        }
    };

    return (
        <AuthContext.Provider
            value={{
                isAuthenticated: Boolean(accessToken),
                isLoading,
                accessToken,
                saveSession,
                logout,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error(
            'useAuth must be used inside AuthProvider',
        );
    }

    return context;
}