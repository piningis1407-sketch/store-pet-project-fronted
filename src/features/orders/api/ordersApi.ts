import { apiRequest } from '../../../shared/api/http';
import type {
    CreateOrderRequest,
    Order, OrderStatus,
} from '../types/order';

// Создание заказа
export async function createOrder(
    request: CreateOrderRequest,
): Promise<Order> {
    return apiRequest<Order>('/api/orders', {
        method: 'POST',
        body: JSON.stringify(request),
    });
}

// Получение истории заказов пользователя
export async function getUserOrders(): Promise<Order[]> {
    return apiRequest<Order[]>('/api/orders');
}

// Получение конкретного заказа
export async function getUserOrder(orderId: number): Promise<Order> {
    return apiRequest<Order>(`/api/orders/${orderId}`);
}
// Получение всех заказов для администратора
export async function getAdminOrders(): Promise<Order[]> {
    return apiRequest<Order[]>('/api/orders/admin');
}

// Изменение статуса заказа администратором
export async function updateOrderStatus(
    orderId: number,
    status: OrderStatus,
): Promise<Order> {
    return apiRequest<Order>(`/api/orders/admin/${orderId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
    });
}