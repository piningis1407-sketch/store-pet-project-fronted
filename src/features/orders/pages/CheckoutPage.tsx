
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { useCart } from '../../cart/context/CartContext';
import { createOrder } from '../api/ordersApi';
import type { Order } from '../types/order';
import { getRussianErrorMessage } from '../../../shared/api/errorMessages';

import '../CheckoutPage.css';

const priceFormatter = new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    maximumFractionDigits: 2,
});

export default function CheckoutPage() {
    const navigate = useNavigate();

    const {
        items,
        totalItems,
        totalPrice,
        clearCart,
    } = useCart();

    const [recipientName, setRecipientName] = useState('');
    const [phone, setPhone] = useState('');
    const [deliveryAddress, setDeliveryAddress] = useState('');

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [completedOrder, setCompletedOrder] = useState<Order | null>(null);

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (items.length === 0 || loading) {
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const order = await createOrder({
                recipientName: recipientName.trim(),
                phone: phone.trim(),
                deliveryAddress: deliveryAddress.trim(),
            });

            await clearCart();
            setCompletedOrder(order);
        } catch (err) {
            setError(getRussianErrorMessage(err));
        } finally {
            setLoading(false);
        }
    };

    if (completedOrder) {
        return (
            <main className="checkout-page">
                <section className="checkout-success">
                    <h1>Заказ успешно оформлен!</h1>

                    <p>
                        Номер вашего заказа: #{completedOrder.id}
                    </p>

                    <p>
                        Сумма заказа:{' '}
                        {priceFormatter.format(completedOrder.totalPrice)}
                    </p>

                    <p>
                        Статус: {completedOrder.status}
                    </p>

                    <Link to="/products">
                        Вернуться в каталог
                    </Link>
                </section>
            </main>
        );
    }

    if (items.length === 0) {
        return (
            <main className="checkout-page">
                <h1>Оформление заказа</h1>

                <p>Корзина пуста.</p>

                <Link to="/products">
                    Перейти в каталог
                </Link>
            </main>
        );
    }

    return (
        <main className="checkout-page">
            <h1 className="checkout-page__title">
                Оформление заказа
            </h1>

            <div className="checkout-page__content">
                <form
                    className="checkout-form"
                    onSubmit={handleSubmit}
                >
                    <h2>Данные получателя</h2>

                    <label>
                        Имя получателя
                        <input
                            type="text"
                            value={recipientName}
                            onChange={event =>
                                setRecipientName(event.target.value)
                            }
                            maxLength={30}
                            required
                        />
                    </label>

                    <label>
                        Телефон
                        <input
                            type="tel"
                            value={phone}
                            onChange={event =>
                                setPhone(event.target.value)
                            }
                            maxLength={30}
                            required
                        />
                    </label>

                    <label>
                        Адрес доставки
                        <textarea
                            value={deliveryAddress}
                            onChange={event =>
                                setDeliveryAddress(event.target.value)
                            }
                            maxLength={500}
                            rows={4}
                            required
                        />
                    </label>

                    {error && (
                        <p className="checkout-form__error">
                            {error}
                        </p>
                    )}

                    <button
                        type="submit"
                        disabled={loading || items.length === 0}
                    >
                        {loading ? 'Оформление...' : 'Подтвердить заказ'}
                    </button>
                </form>

                <aside className="checkout-summary">
                    <h2>Ваш заказ</h2>

                    {items.map(item => (
                        <div
                            className="checkout-summary__item"
                            key={item.productId}
                        >
                            <span>
                                {item.name} × {item.quantity}
                            </span>

                            <span>
                                {priceFormatter.format(
                                    item.price * item.quantity,
                                )}
                            </span>
                        </div>
                    ))}

                    <p>Количество товаров: {totalItems}</p>

                    <p className="checkout-summary__total">
                        Итого: {priceFormatter.format(totalPrice)}
                    </p>

                    <Link to="/cart">
                        Вернуться в корзину
                    </Link>
                </aside>
            </div>
        </main>
    );
}