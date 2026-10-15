import {
    createBrowserRouter,
    Navigate,
} from 'react-router-dom';

import LoginPage from '../features/auth/pages/LoginPage';
import RegisterPage from '../features/auth/pages/RegisterPage';
import UsersPage from '../features/users/pages/UsersPage';
import UserDetailsPage from '../features/users/pages/UserDetailsPage';
import ProtectedRoute from '../shared/components/ProtectedRoute';

export const router = createBrowserRouter([
    {
        path: '/',
        element: <Navigate to="/users" replace />,
    },
    {
        path: '/login',
        element: <LoginPage />,
    },
    {
        path: '/register',
        element: <RegisterPage />,
    },
    {
        element: <ProtectedRoute />,
        children: [
            {
                path: '/users',
                element: <UsersPage />,
            },
            {
                path: '/users/:id',
                element: <UserDetailsPage />,
            },
        ],
    },
]);