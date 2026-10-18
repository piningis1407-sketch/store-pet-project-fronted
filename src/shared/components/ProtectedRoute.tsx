import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../features/auth/context/AuthContext';

export default function ProtectedRoute() {
    const { isAuthenticated, isLoading } = useAuth();

    if (isLoading) {
        return <p>Проверка сессии...</p>;
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    return <Outlet />;
}