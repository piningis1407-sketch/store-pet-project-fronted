export type OrderStatus =
    | 'NEW'
    | 'CONFIRMED'
    | 'PROCESSING'
    | 'SHIPPED'
    | 'COMPLETED'
    | 'CANCELLED';

export interface CreateOrderRequest {
    recipientName: string;
    phone: string;
    deliveryAddress: string;
}

export interface OrderItem {
    productId: number;
    productName: string;
    price: number;
    quantity: number;
    subtotal: number;
}

export interface Order {
    id: number;
    recipientName: string;
    phone: string;
    deliveryAddress: string;
    status: OrderStatus;
    totalPrice: number;
    createdAt: string;
    items: OrderItem[];
}