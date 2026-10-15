import {
    createContext,
    useContext,
    useState,
    type ReactNode,
} from 'react';
import type { AuthResponse } from '../types/auth.types';

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

    const saveSession = (data: AuthResponse) => {
        sessionStorage.setItem('accessToken', data.accessToken);
        sessionStorage.setItem('refreshToken', data.refreshToken);
        sessionStorage.setItem('tokenType', data.tokenType);
        setAccessToken(data.accessToken);
    };

    const logout = () => {
        sessionStorage.removeItem('accessToken');
        sessionStorage.removeItem('refreshToken');
        sessionStorage.removeItem('tokenType');
        setAccessToken(null);
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