import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './app/App';
import { AuthProvider } from './features/auth/context/AuthContext';
import {CartProvider} from "./features/cart/context/CartContext";

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <AuthProvider>
            <CartProvider>
                <App />
            </CartProvider>
        </AuthProvider>
    </StrictMode>,
);