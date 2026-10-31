
import {
    createContext,
    useContext,
    useState,
    useEffect,
    useRef,
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
    userName: string | null;
    saveSession: (data: AuthResponse) => void;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [accessToken, setTokenState] = useState<string | null>(
        () => getAccessToken(),
    );
    const [userName, setUserName] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Не позволяем устаревшему запросу профиля восстановить имя
    // после выхода из аккаунта или нового входа.
    const profileRequestId = useRef(0);
    const updateAccessToken = (
        token: string | null,
        type = 'Bearer',
    ) => {
        setAccessToken(token, type);
        setTokenState(token);
    };

    async function loadUserProfile(): Promise<void> {
        const token = getAccessToken();

        if (!token) {
            setUserName(null);
            return;
        }

        const requestId = ++profileRequestId.current;

        try {
            const profile = await authApi.getCurrentUserProfile();

            if (
                requestId === profileRequestId.current &&
                getAccessToken() !== null
            ) {
                setUserName(profile.name);
            }
        } catch (error) {
            if (requestId === profileRequestId.current) {
                setUserName(null);
            }

            console.error('Failed to load user profile:', error);
        }
    }

    useEffect(() => {
        let active = true;

        const handleTokenRefreshed = () => {
            if (active) {
                setTokenState(getAccessToken());
            }
        };

        const handleSessionExpired = () => {
            profileRequestId.current++;
            setTokenState(null);
            setUserName(null);
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
                const token = await refreshAccessToken();

                if (!active) {
                    return;
                }

                setTokenState(token);

                if (token) {
                    await loadUserProfile();
                } else {
                    setUserName(null);
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
        profileRequestId.current++;
        setUserName(null);

        updateAccessToken(
            data.accessToken,
            data.tokenType || 'Bearer',
        );
        void loadUserProfile();
    };

    const logout = async (): Promise<void> => {
        try {
            // Refresh-токен браузер отправляет в HttpOnly cookie.
            await authApi.logout();
        } catch (error) {
            console.error('Backend logout failed:', error);
        } finally {
            profileRequestId.current++;
            setUserName(null);
            updateAccessToken(null);
            window.location.assign('/products');
        }
    };

    return (
        <AuthContext.Provider
            value={{
                isAuthenticated: Boolean(accessToken),
                isLoading,
                accessToken,
                userName,
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