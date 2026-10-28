import {
    createBrowserRouter,
    Navigate,
} from 'react-router-dom';

import LoginPage from '../features/auth/pages/LoginPage';
import RegisterPage from '../features/auth/pages/RegisterPage';
import UsersPage from '../features/users/pages/UsersPage';
import UserDetailsPage from '../features/users/pages/UserDetailsPage';
import ProtectedRoute from '../shared/components/ProtectedRoute';
import { MainLayout } from '../shared/components/MainLayout';
import { ProductsPage } from '../features/products/pages/ProductsPage';
import { ProductDetailsPage } from '../features/products/pages/ProductDetailsPage';

export const router = createBrowserRouter([
    {
        path: '/',
        element: <MainLayout />,
        children: [
            {
                index: true,
                element: <Navigate to="/products" replace />,
            },
            {
                path: 'products',
                element: <ProductsPage />,
            },
            {
                path: 'products/:id',
                element: <ProductDetailsPage />,
            },
            {
                element: <ProtectedRoute />,
                children: [
                    {
                        path: 'users',
                        element: <UsersPage />,
                    },
                    {
                        path: 'users/:id',
                        element: <UserDetailsPage />,
                    },
                ],
            },
        ],
    },
    {
        path: '/login',
        element: <LoginPage />,
    },
    {
        path: '/register',
        element: <RegisterPage />,
    },
]);