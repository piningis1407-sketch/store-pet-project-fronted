import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import { getUserOrders } from '../api/ordersApi';
import type { Order, OrderStatus } from '../types/order';
import { getRussianErrorMessage } from '../../../shared/api/errorMessages';

import '../OrdersPage.css';

const priceFormatter = new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    maximumFractionDigits: 2,
});

const dateFormatter = new Intl.DateTimeFormat('ru-RU', {
    dateStyle: 'medium',
    timeStyle: 'short',
});

const statusLabels: Record<OrderStatus, string> = {
    NEW: 'Новый',
    CONFIRMED: 'Подтверждён',
    PROCESSING: 'В обработке',
    SHIPPED: 'Отправлен',
    COMPLETED: 'Завершён',
    CANCELLED: 'Отменён',
};

export default function OrdersPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadOrders = async () => {
            try {
                setError(null);
                const data = await getUserOrders();
                setOrders(data);
            } catch (err) {
                setError(getRussianErrorMessage(err));
            } finally {
                setLoading(false);
            }
        };

        void loadOrders();
    }, []);

    if (loading) {
        return (
            <main className="orders-page">
                <p>Загрузка заказов...</p>
            </main>
        );
    }

    if (error) {
        return (
            <main className="orders-page">
                <h1 className="orders-page__title">Мои заказы</h1>
                <p className="orders-page__error">{error}</p>
            </main>
        );
    }

    return (
        <main className="orders-page">
            <h1 className="orders-page__title">Мои заказы</h1>

            {orders.length === 0 ? (
                <section className="orders-page__empty">
                    <p>У вас пока нет заказов.</p>
                    <Link to="/products">
                        Перейти в каталог
                    </Link>
                </section>
            ) : (
                <div className="orders-list">
                    {orders.map(order => (
                        <article className="order-card" key={order.id}>
                            <div className="order-card__header">
                                <h2>Заказ №{order.id}</h2>

                                <span className={`order-card__status order-card__status--${order.status.toLowerCase()}`}>
                                    {statusLabels[order.status]}
                                </span>
                            </div>

                            <p className="order-card__date">
                                Дата: {dateFormatter.format(new Date(order.createdAt))}
                            </p>

                            <p>
                                Товаров: {order.items.reduce(
                                (sum, item) => sum + item.quantity,
                                0,
                            )}
                            </p>

                            <p className="order-card__total">
                                Сумма: {priceFormatter.format(order.totalPrice)}
                            </p>

                            <Link
                                to={`/orders/${order.id}`}
                                className="order-card__link"
                            >
                                Подробнее о заказе
                            </Link>
                        </article>
                    ))}
                </div>
            )}
        </main>
    );
}