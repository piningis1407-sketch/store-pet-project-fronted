import {
    createBrowserRouter,
    Navigate,
} from 'react-router-dom';

import LoginPage from '../features/auth/pages/LoginPage';
import RegisterPage from '../features/auth/pages/RegisterPage';
import UsersPage from '../features/users/pages/UsersPage';
import UserDetailsPage from '../features/users/pages/UserDetailsPage';
import { MainLayout } from '../shared/components/MainLayout';
import { ProductsPage } from '../features/products/pages/ProductsPage';
import { ProductDetailsPage } from '../features/products/pages/ProductDetailsPage';
import AdminRoute from "../shared/components/AdminRoute";
import AdminPage from "../features/admin/pages/AdminPage";
import CartPage from "../features/cart/pages/CartPage";
import ProtectedRoute from "../shared/components/ProtectedRoute";
import CheckoutPage from '../features/orders/pages/CheckoutPage';
import OrdersPage from "../features/orders/pages/OrdersPage";
import OrderDetailsPage from "../features/orders/pages/OrderDetailsPage";


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
                path: 'cart',
                element: <CartPage />,
            },
            {
                element: <ProtectedRoute />,
                children: [
                    {
                        path: 'checkout',
                        element: <CheckoutPage />,
                    },
                    {
                        path: 'orders',
                        element: <OrdersPage />,
                    },
                    {
                        path: 'orders/:id',
                        element: <OrderDetailsPage />,
                    },
                ],
            },
            {
                element: <AdminRoute />,
                children: [
                    {
                        path: 'admin',
                        element: <AdminPage />,
                    },
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