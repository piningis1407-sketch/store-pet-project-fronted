import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import '../CartPage.css';

const priceFormatter = new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    maximumFractionDigits: 2,
});

export default function CartPage() {
    const {
        items,
        totalItems,
        totalPrice,
        removeItem,
        updateQuantity,
        clearCart,
    } = useCart();

    if (items.length === 0) {
        return (
            <main className="cart-page">
                <h1 className="cart-page__title">Корзина</h1>

                <div className="cart-page__empty">
                    <p>Ваша корзина пока пуста</p>
                    <Link to="/products" className="cart-page__catalog-link">
                        Перейти в каталог
                    </Link>
                </div>
            </main>
        );
    }

    return (
        <main className="cart-page">
            <h1 className="cart-page__title">Корзина</h1>

            <div className="cart-page__content">
                <section className="cart-page__items">
                    {items.map(item => (
                        <article
                            className="cart-item"
                            key={item.productId}
                        >
                            <div className="cart-item__image-wrapper">
                                {item.imageUrl ? (
                                    <img
                                        className="cart-item__image"
                                        src={item.imageUrl}
                                        alt={item.name}
                                    />
                                ) : (
                                    <div className="cart-item__placeholder">
                                        Изображение недоступно
                                    </div>
                                )}
                            </div>

                            <div className="cart-item__info">
                                <h2 className="cart-item__name">
                                    {item.name}
                                </h2>

                                <p className="cart-item__price">
                                    {priceFormatter.format(item.price)}
                                </p>

                                <p className="cart-item__stock">
                                    Доступно: {item.stockQuantity} шт.
                                </p>

                                <div className="cart-item__quantity">
                                    <button
                                        type="button"
                                        onClick={() =>
                                            updateQuantity(
                                                item.productId,
                                                item.quantity - 1,
                                            )
                                        }
                                        disabled={item.quantity <= 1}
                                        aria-label="Уменьшить количество"
                                    >
                                        −
                                    </button>

                                    <span>{item.quantity}</span>

                                    <button
                                        type="button"
                                        onClick={() =>
                                            updateQuantity(
                                                item.productId,
                                                item.quantity + 1,
                                            )
                                        }
                                        disabled={
                                            item.quantity >= item.stockQuantity
                                        }
                                        aria-label="Увеличить количество"
                                    >
                                        +
                                    </button>
                                </div>
                            </div>

                            <div className="cart-item__actions">
                                <p className="cart-item__subtotal">
                                    {priceFormatter.format(
                                        item.price * item.quantity,
                                    )}
                                </p>

                                <button
                                    type="button"
                                    className="cart-item__remove"
                                    onClick={() =>
                                        removeItem(item.productId)
                                    }
                                >
                                    Удалить
                                </button>
                            </div>
                        </article>
                    ))}
                </section>

                <aside className="cart-summary">
                    <h2 className="cart-summary__title">
                        Итого
                    </h2>

                    <p className="cart-summary__count">
                        Товаров: {totalItems}
                    </p>

                    <p className="cart-summary__total">
                        {priceFormatter.format(totalPrice)}
                    </p>

                    <button
                        type="button"
                        className="cart-summary__clear"
                        onClick={clearCart}
                    >
                        Очистить корзину
                    </button>

                    <button
                        type="button"
                        className="cart-summary__checkout"
                        disabled
                    >
                        Оформить заказ
                    </button>

                    <Link
                        to="/products"
                        className="cart-summary__continue"
                    >
                        Продолжить покупки
                    </Link>
                </aside>
            </div>
        </main>
    );
}