import {Fragment, useCallback, useEffect, useState } from 'react';

import {
    getAdminOrders,
    updateOrderStatus,
} from '../../orders/api/ordersApi';
import type { Order, OrderStatus } from '../../orders/types/order';

const statusLabels: Record<OrderStatus, string> = {
    NEW: 'Новый',
    CONFIRMED: 'Подтверждён',
    PROCESSING: 'В обработке',
    SHIPPED: 'Отправлен',
    COMPLETED: 'Завершён',
    CANCELLED: 'Отменён',
};

const allowedNextStatuses: Record<OrderStatus, OrderStatus[]> = {
    NEW: ['CONFIRMED', 'CANCELLED'],
    CONFIRMED: ['PROCESSING', 'CANCELLED'],
    PROCESSING: ['SHIPPED', 'CANCELLED'],
    SHIPPED: ['COMPLETED'],
    COMPLETED: [],
    CANCELLED: [],
};

export default function AdminOrders() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [expandedOrderId, setExpandedOrderId] = useState<number | null>(null);
    const [selectedStatus, setSelectedStatus] = useState<OrderStatus | 'ALL'>('ALL');
    const [updatingOrderId, setUpdatingOrderId] = useState<number | null>(null);

    const loadOrders = useCallback(async () => {
        setLoading(true);
        setError('');

        try {
            const result = await getAdminOrders();
            setOrders(result);
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : 'Не удалось загрузить заказы',
            );
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        void loadOrders();
    }, [loadOrders]);

    function toggleDetails(orderId: number) {
        setExpandedOrderId(current =>
            current === orderId ? null : orderId,
        );
    }

    async function handleStatusChange(
        orderId: number,
        newStatus: OrderStatus,
    ) {
        if (
            newStatus === 'CANCELLED' &&
            !window.confirm(
                'Отменить заказ? Товары будут возвращены на склад.',
            )
        ) {
            return;
        }

        setError('');
        setUpdatingOrderId(orderId);

        try {
            const updatedOrder = await updateOrderStatus(orderId, newStatus);

            setOrders(current =>
                current.map(order =>
                    order.id === orderId ? updatedOrder : order,
                ),
            );
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : 'Не удалось изменить статус заказа',
            );
        } finally {
            setUpdatingOrderId(null);
        }
    }

    const filteredOrders = orders.filter(order =>
        selectedStatus === 'ALL' || order.status === selectedStatus,
    );

    return (
        <section className="admin-orders">
            <h2>Управление заказами</h2>
            <div className="admin-orders__toolbar">
                <label htmlFor="order-status-filter">
                    Фильтр по статусу
                </label>

                <select
                    id="order-status-filter"
                    value={selectedStatus}
                    onChange={event =>
                        setSelectedStatus(event.target.value as OrderStatus | 'ALL')
                    }
                >
                    <option value="ALL">Все заказы</option>

                    {Object.entries(statusLabels).map(([value, label]) => (
                        <option key={value} value={value}>
                            {label}
                        </option>
                    ))}
                </select>
            </div>
            {error && <p role="alert">{error}</p>}

            {loading ? (
                <p>Загрузка заказов...</p>
            ) : orders.length === 0 ? (
                <p>Заказов пока нет.</p>
            ) : filteredOrders.length === 0 ? (
                <p>Заказов с выбранным статусом нет.</p>
            ) : (
                <div className="admin-table-wrapper">
                    <table className="admin-table">
                        <thead>
                        <tr>
                            <th>ID</th>
                            <th>Дата</th>
                            <th>Покупатель</th>
                            <th>Телефон</th>
                            <th>Сумма</th>
                            <th>Статус</th>
                            <th>Подробнее</th>
                        </tr>
                        </thead>

                        <tbody>
                        {filteredOrders.map(order => (
                            <Fragment key={order.id}>
                                <tr key={order.id}>
                                    <td>{order.id}</td>

                                    <td className="admin-orders__date-column">
                                        {new Date(order.createdAt).toLocaleString('ru-RU')}
                                    </td>

                                    <td>{order.recipientName}</td>
                                    <td>{order.phone}</td>

                                    <td>
                                        {order.totalPrice.toLocaleString('ru-RU', {
                                            style: 'currency',
                                            currency: 'RUB',
                                        })}
                                    </td>

                                    <td className="admin-orders__status-column">
                                        <div className="admin-order-status">
                                            <span>{statusLabels[order.status]}</span>

                                            {allowedNextStatuses[order.status].length > 0 && (
                                                <select
                                                    value=""
                                                    disabled={updatingOrderId === order.id}
                                                    onChange={event => {
                                                        const newStatus = event.target.value as OrderStatus;

                                                        if (newStatus) {
                                                            void handleStatusChange(order.id, newStatus);
                                                        }
                                                    }}
                                                >
                                                    <option value="" disabled>
                                                        {updatingOrderId === order.id
                                                            ? 'Сохранение...'
                                                            : 'Изменить статус'}
                                                    </option>

                                                    {allowedNextStatuses[order.status].map(status => (
                                                        <option key={status} value={status}>
                                                            {statusLabels[status]}
                                                        </option>
                                                    ))}
                                                </select>
                                            )}
                                        </div>
                                    </td>

                                    <td>
                                        <div className="admin-table__actions">
                                            <button
                                                type="button"
                                                onClick={() => toggleDetails(order.id)}
                                            >
                                                {expandedOrderId === order.id
                                                    ? 'Скрыть'
                                                    : 'Подробнее'}
                                            </button>
                                        </div>
                                    </td>
                                </tr>

                                {expandedOrderId === order.id && (
                                    <tr key={`${order.id}-details`}>
                                        <td colSpan={7}>
                                            <div className="admin-order-details">
                                                <p>
                                                    <strong>Адрес доставки:</strong>{' '}
                                                    {order.deliveryAddress}
                                                </p>

                                                <h3>Состав заказа</h3>

                                                <table className="admin-table">
                                                    <thead>
                                                    <tr>
                                                        <th>Товар</th>
                                                        <th>Цена</th>
                                                        <th>Количество</th>
                                                        <th>Сумма</th>
                                                    </tr>
                                                    </thead>

                                                    <tbody>
                                                    {order.items.map(item => (
                                                        <tr key={item.productId}>
                                                            <td>{item.productName}</td>
                                                            <td>{item.price.toLocaleString('ru-RU')} ₽</td>
                                                            <td>{item.quantity}</td>
                                                            <td>{item.subtotal.toLocaleString('ru-RU')} ₽</td>
                                                        </tr>
                                                    ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </Fragment>
                        ))}
                        </tbody>
                    </table>
                </div>
            )}
        </section>
    );
}