import {
    createContext,
    useContext,
    useState,
    useEffect,
    type ReactNode,
} from 'react';
import type { AuthResponse } from '../types/auth.types';
import {authApi} from "../api/authApi";

interface AuthContextValue {
    isAuthenticated: boolean;
    accessToken: string | null;
    saveSession: (data: AuthResponse) => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [accessToken, setAccessToken] = useState<string | null>(
        () => sessionStorage.getItem('accessToken'),
    );

    useEffect(() => {
        const syncToken = () => {
            setAccessToken(sessionStorage.getItem('accessToken'));
        };

        window.addEventListener('auth:token-refreshed', syncToken);

        return () => {
            window.removeEventListener('auth:token-refreshed', syncToken);
        };
    }, []);

    const saveSession = (data: AuthResponse) => {
        sessionStorage.setItem('accessToken', data.accessToken);
        sessionStorage.setItem('refreshToken', data.refreshToken);
        sessionStorage.setItem('tokenType', data.tokenType);
        setAccessToken(data.accessToken);
    };

    const logout = async (): Promise<void> => {
        const refreshToken = sessionStorage.getItem('refreshToken');

        try {
            if (refreshToken) {
                await authApi.logout(refreshToken);
            }
        } catch (error) {
            console.error('Backend logout failed:', error);
        } finally {
            sessionStorage.removeItem('accessToken');
            sessionStorage.removeItem('refreshToken');
            sessionStorage.removeItem('tokenType');

            setAccessToken(null);
            window.location.assign('/login');
        }
    };

    return (
        <AuthContext.Provider
            value={{
                isAuthenticated: Boolean(accessToken),
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
        throw new Error('useAuth must be used inside AuthProvider');
    }

    return context;
}