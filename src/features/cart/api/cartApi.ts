import { apiRequest } from '../../../shared/api/http';

export interface CartApiItem {
    productId: number;
    name: string;
    price: number;
    imageUrl: string | null;
    stockQuantity: number;
    quantity: number;
    subtotal: number;
}

export interface CartResponse {
    items: CartApiItem[];
    totalItems: number;
    totalPrice: number;
}

export async function getCart(): Promise<CartResponse> {
    return apiRequest<CartResponse>('/api/cart');
}

export async function addCartItem(
    productId: number,
    quantity: number,
): Promise<CartResponse> {
    return apiRequest<CartResponse>('/api/cart/items', {
        method: 'POST',
        body: JSON.stringify({ productId, quantity }),
    });
}

export async function updateCartItem(
    productId: number,
    quantity: number,
): Promise<CartResponse> {
    return apiRequest<CartResponse>(`/api/cart/items/${productId}`, {
        method: 'PATCH',
        body: JSON.stringify({ quantity }),
    });
}

export async function removeCartItem(
    productId: number,
): Promise<CartResponse> {
    return apiRequest<CartResponse>(`/api/cart/items/${productId}`, {
        method: 'DELETE',
    });
}

export async function clearServerCart(): Promise<CartResponse> {
    return apiRequest<CartResponse>('/api/cart', {
        method: 'DELETE',
    });
}