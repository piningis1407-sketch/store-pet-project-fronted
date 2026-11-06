import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
} from 'react';
import type { ReactNode } from 'react';
import type { CartContextType, CartItem } from '../types/cart';
import {Product} from "../../products/types/product";


const CART_STORAGE_KEY = 'wood-resin-cart';

const CartContext = createContext<CartContextType | null>(null);

interface CartProviderProps {
    children: ReactNode;
}

function loadCart(): CartItem[] {
    try {
        const storedCart = localStorage.getItem(CART_STORAGE_KEY);

        if (!storedCart) {
            return [];
        }

        const parsed: unknown = JSON.parse(storedCart);

        if (!Array.isArray(parsed)) {
            return [];
        }

        return parsed.filter((item): item is CartItem => {
            return (
                typeof item.productId === 'number' &&
                typeof item.name === 'string' &&
                typeof item.price === 'number' &&
                (typeof item.imageUrl === 'string' || item.imageUrl === null) &&
                typeof item.stockQuantity === 'number' &&
                typeof item.quantity === 'number' &&
                item.quantity > 0 &&
                item.quantity <= item.stockQuantity
            );
        });
    } catch {
        return [];
    }
}

export function CartProvider({ children }: CartProviderProps) {
    const [items, setItems] = useState<CartItem[]>(loadCart);

    useEffect(() => {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    }, [items]);

    const addItem = useCallback((product: Product) => {
        if (product.stockQuantity <= 0) {
            return;
        }

        setItems(currentItems => {
            const existingItem = currentItems.find(
                item => item.productId === product.id,
            );

            if (existingItem) {
                return currentItems.map(item =>
                    item.productId === product.id
                        ? {
                            ...item,
                            stockQuantity: product.stockQuantity,
                            quantity: Math.min(
                                item.quantity + 1,
                                product.stockQuantity,
                            ),
                        }
                        : item,
                );
            }

            return [
                ...currentItems,
                {
                    productId: product.id,
                    name: product.name,
                    price: product.price,
                    imageUrl: product.imageUrl,
                    stockQuantity: product.stockQuantity,
                    quantity: 1,
                },
            ];
        });
    }, []);

    const removeItem = useCallback((productId: number) => {
        setItems(currentItems =>
            currentItems.filter(item => item.productId !== productId),
        );
    }, []);

    const updateQuantity = useCallback(
        (productId: number, quantity: number) => {
            setItems(currentItems =>
                currentItems
                    .map(item => {
                        if (item.productId !== productId) {
                            return item;
                        }

                        return {
                            ...item,
                            quantity: Math.min(
                                Math.floor(quantity),
                                item.stockQuantity,
                            ),
                        };
                    })
                    .filter(item => item.quantity > 0),
            );
        },
        [],
    );

    const clearCart = useCallback(() => {
        setItems([]);
    }, []);

    const totalItems = useMemo(
        () => items.reduce((sum, item) => sum + item.quantity, 0),
        [items],
    );

    const totalPrice = useMemo(
        () =>
            items.reduce(
                (sum, item) => sum + item.price * item.quantity,
                0,
            ),
        [items],
    );

    const value = useMemo(
        () => ({
            items,
            totalItems,
            totalPrice,
            addItem,
            removeItem,
            updateQuantity,
            clearCart,
        }),
        [
            items,
            totalItems,
            totalPrice,
            addItem,
            removeItem,
            updateQuantity,
            clearCart,
        ],
    );

    return (
        <CartContext.Provider value={value}>
            {children}
        </CartContext.Provider>
    );
}

export function useCart(): CartContextType {
    const context = useContext(CartContext);

    if (!context) {
        throw new Error('useCart должен использоваться внутри CartProvider');
    }

    return context;
}