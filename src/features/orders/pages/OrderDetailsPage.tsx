import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import {getUserOrder} from "../api/ordersApi";
import {Order, OrderStatus} from "../types/order";
import { getRussianErrorMessage } from '../../../shared/api/errorMessages';

import '../OrderDetailsPage.css';



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

export default function OrderDetailsPage() {
    const { id } = useParams<{ id: string }>();

    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadOrder = async () => {
            if (!id || !/^\d+$/.test(id)) {
                setError('Некорректный номер заказа.');
                setLoading(false);
                return;
            }

            try {
                setError(null);
                const data = await getUserOrder(Number(id));
                setOrder(data);
            } catch (err) {
                setError(getRussianErrorMessage(err));
            } finally {
                setLoading(false);
            }
        };

        void loadOrder();
    }, [id]);

    if (loading) {
        return (
            <main className="order-details-page">
                <p>Загрузка заказа...</p>
            </main>
        );
    }

    if (error || !order) {
        return (
            <main className="order-details-page">
                <h1>Подробности заказа</h1>
                <p className="order-details-page__error">
                    {error ?? 'Заказ не найден.'}
                </p>
                <Link to="/orders">Вернуться к заказам</Link>
            </main>
        );
    }

    return (
        <main className="order-details-page">
            <div className="order-details-page__header">
                <h1>Заказ №{order.id}</h1>

                <span className={`order-details-page__status order-details-page__status--${order.status.toLowerCase()}`}>
                    {statusLabels[order.status]}
                </span>
            </div>

            <p className="order-details-page__date">
                Дата оформления: {dateFormatter.format(new Date(order.createdAt))}
            </p>

            <section className="order-details-section">
                <h2>Данные получателя</h2>

                <p>Имя: {order.recipientName}</p>
                <p>Телефон: {order.phone}</p>
                <p>Адрес доставки: {order.deliveryAddress}</p>
            </section>

            <section className="order-details-section">
                <h2>Состав заказа</h2>

                <div className="order-details-items">
                    {order.items.map(item => (
                        <div
                            className="order-details-item"
                            key={item.productId}
                        >
                            <div className="order-details-item__info">
                                <span className="order-details-item__name">
                                    {item.productName}
                                </span>

                                <span>
                                    {priceFormatter.format(item.price)} × {item.quantity}
                                </span>
                            </div>

                            <span className="order-details-item__subtotal">
                                {priceFormatter.format(item.subtotal)}
                            </span>
                        </div>
                    ))}
                </div>

                <p className="order-details-section__total">
                    Итого: {priceFormatter.format(order.totalPrice)}
                </p>
            </section>

            <Link
                to="/orders"
                className="order-details-page__back"
            >
                Вернуться к заказам
            </Link>
        </main>
    );
}