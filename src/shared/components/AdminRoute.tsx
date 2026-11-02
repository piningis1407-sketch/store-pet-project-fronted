import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../features/auth/context/AuthContext';

export default function AdminRoute() {
    const { isAuthenticated, isLoading, userRole } = useAuth();

    if (isLoading) {
        return null;
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    if (userRole !== 'ADMIN') {
        return <Navigate to="/products" replace />;
    }

    return <Outlet />;
}