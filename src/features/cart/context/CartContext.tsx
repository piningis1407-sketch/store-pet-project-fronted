import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react';
import type { ReactNode } from 'react';

import type { CartContextType, CartItem } from '../types/cart';
import type { Product } from '../../products/types/product';

import { useAuth } from '../../auth/context/AuthContext';

import {
    getCart,
    addCartItem,
    updateCartItem,
    removeCartItem,
    clearServerCart,
} from '../api/cartApi';

const CART_STORAGE_KEY = 'wood-resin-cart';

const CartContext = createContext<CartContextType | null>(null);

interface CartProviderProps {
    children: ReactNode;
}

type CartMode = 'guest' | 'server';

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
    const { isAuthenticated, isLoading } = useAuth();

    const [items, setItems] = useState<CartItem[]>(loadCart);
    const [mode, setMode] = useState<CartMode>('guest');

    const syncStarted = useRef(false);

    const isServerMode = isAuthenticated && mode === 'server';

    // Сохраняем только гостевую корзину.
    useEffect(() => {
        if (!isLoading && mode === 'guest') {
            localStorage.setItem(
                CART_STORAGE_KEY,
                JSON.stringify(items),
            );
        }
    }, [items, mode, isLoading]);

    // Переключение между гостевой и серверной корзинами.
    useEffect(() => {
        if (isLoading) {
            return;
        }

        if (!isAuthenticated) {
            syncStarted.current = false;
            setMode('guest');
            setItems(loadCart());
            return;
        }

        if (syncStarted.current) {
            return;
        }

        syncStarted.current = true;
        setMode('server');

        const syncCart = async () => {
            try {
                // Загружаем корзину авторизованного пользователя.
                let serverCart = await getCart();

                // Загружаем гостевую корзину.
                const guestItems = loadCart();
                const remainingGuestItems: CartItem[] = [];

                // Переносим гостевые товары на сервер.
                for (const guestItem of guestItems) {
                    const existingItem = serverCart.items.find(
                        item => item.productId === guestItem.productId,
                    );

                    const availableQuantity = existingItem
                        ? existingItem.stockQuantity - existingItem.quantity
                        : guestItem.quantity;

                    const quantityToAdd = Math.min(
                        guestItem.quantity,
                        availableQuantity,
                    );

                    if (quantityToAdd <= 0) {
                        remainingGuestItems.push(guestItem);
                        continue;
                    }

                    try {
                        serverCart = await addCartItem(
                            guestItem.productId,
                            quantityToAdd,
                        );
                        //если в гостевой корзине 5 единиц, а на складе осталось только 3, три попадут в серверную корзину, а две сохранятся в гостевой
                        if (quantityToAdd < guestItem.quantity) {
                            remainingGuestItems.push({
                                ...guestItem,
                                quantity: guestItem.quantity - quantityToAdd,
                            });
                        }
                    } catch (error) {
                        console.error(
                            `Не удалось перенести товар ${guestItem.productId}:`,
                            error,
                        );

                        remainingGuestItems.push(guestItem);
                    }
                }

                // Сохраняем товары, которые не удалось перенести.
                if (remainingGuestItems.length > 0) {
                    localStorage.setItem(
                        CART_STORAGE_KEY,
                        JSON.stringify(remainingGuestItems),
                    );
                } else {
                    localStorage.removeItem(CART_STORAGE_KEY);
                }

                setItems(serverCart.items);
            } catch (error) {
                console.error('Не удалось загрузить корзину:', error);
                setItems([]);
            }
        };

        void syncCart();
    }, [isAuthenticated, isLoading]);

    const addItem = useCallback(
        async (product: Product): Promise<void> => {
            if (product.stockQuantity <= 0) {
                return;
            }

            if (isServerMode) {
                try {
                    const cart = await addCartItem(product.id, 1);
                    setItems(cart.items);
                } catch (error) {
                    console.error('Не удалось добавить товар в корзину:', error);
                }

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
        },
        [isServerMode],
    );

    const removeItem = useCallback(
        async (productId: number): Promise<void> => {
            if (isServerMode) {
                try {
                    const cart = await removeCartItem(productId);
                    setItems(cart.items);
                } catch (error) {
                    console.error('Не удалось удалить товар:', error);
                }

                return;
            }

            setItems(currentItems =>
                currentItems.filter(item => item.productId !== productId),
            );
        },
        [isServerMode],
    );

    const updateQuantity = useCallback(
        async (productId: number, quantity: number): Promise<void> => {
            if (isServerMode) {
                try {
                    if (quantity <= 0) {
                        const cart = await removeCartItem(productId);
                        setItems(cart.items);
                    } else {
                        const cart = await updateCartItem(
                            productId,
                            Math.floor(quantity),
                        );
                        setItems(cart.items);
                    }
                } catch (error) {
                    console.error('Не удалось изменить количество товара:', error);
                }

                return;
            }

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
        [isServerMode],
    );

    const clearCart = useCallback(
        async (): Promise<void> => {
            if (isServerMode) {
                try {
                    const cart = await clearServerCart();
                    setItems(cart.items);
                } catch (error) {
                    console.error('Не удалось очистить корзину:', error);
                }

                return;
            }

            setItems([]);
        },
        [isServerMode],
    );

    const totalItems = useMemo(
        () => items.reduce((sum, item) => sum + item.quantity, 0),
        [items],
    );

    const totalPrice = useMemo(
        () => items.reduce(
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