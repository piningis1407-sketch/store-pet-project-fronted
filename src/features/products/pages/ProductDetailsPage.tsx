import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getProductById } from '../api/productApi';
import type { Product } from '../types/product';
import { getRussianErrorMessage } from '../../../shared/api/errorMessages';
import '../product-details.css';

const priceFormatter = new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    maximumFractionDigits: 2,
});

export function ProductDetailsPage() {
    const { id } = useParams<{ id: string }>();

    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [imageError, setImageError] = useState(false);
    const [reloadKey, setReloadKey] = useState(0);

    useEffect(() => {
        let cancelled = false;

        async function loadProduct() {
            setLoading(true);
            setError(null);
            setProduct(null);
            setImageError(false);

            const productId = Number(id);

            if (!id || !Number.isSafeInteger(productId) || productId <= 0) {
                setError('Некорректный идентификатор товара.');
                setLoading(false);
                return;
            }

            try {
                const result = await getProductById(productId);

                if (!cancelled) {
                    setProduct(result);
                }
            } catch (err) {
                if (!cancelled) {
                    setError(getRussianErrorMessage(err));
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        }

        void loadProduct();

        return () => {
            cancelled = true;
        };
    }, [id, reloadKey]);

    if (loading) {
        return (
            <main className="product-details">
                <p>Загрузка информации о товаре...</p>
            </main>
        );
    }

    if (error || !product) {
        return (
            <main className="product-details">
                <Link className="product-details__back" to="/products">
                    ← Назад в каталог
                </Link>

                <h1>
                    {error?.includes('Товар не найден')
                        ? 'Товар не найден'
                        : 'Не удалось загрузить товар'}
                </h1>
                <p className="product-details__error" role="alert">
                    {error ?? 'Не удалось загрузить информацию о товаре.'}
                </p>

                <div className="product-details__actions">
                    <button
                        type="button"
                        onClick={() => setReloadKey((value) => value + 1)}
                    >
                        Повторить загрузку
                    </button>
                </div>
            </main>
        );
    }

    const inStock = product.stockQuantity > 0;

    return (
        <main className="product-details">
            <Link className="product-details__back" to="/products">
                ← Назад в каталог
            </Link>

            <article className="product-details__layout">
                <div className="product-details__media">
                    {product.imageUrl && !imageError ? (
                        <img
                            className="product-details__image"
                            src={product.imageUrl}
                            alt={product.name}
                            onError={() => setImageError(true)}
                        />
                    ) : (
                        <div
                            className="product-details__placeholder"
                            role="img"
                            aria-label={`Изображение товара «${product.name}» недоступно`}
                        >
                            Изображение недоступно
                        </div>
                    )}
                </div>

                <div className="product-details__content">
                    {product.category && (
                        <p className="product-details__category">
                            {product.category.name}
                        </p>
                    )}

                    <h1 className="product-details__title">
                        {product.name}
                    </h1>

                    <p className="product-details__price">
                        {priceFormatter.format(product.price)}
                    </p>

                    <p
                        className={
                            inStock
                                ? 'product-details__stock product-details__stock--available'
                                : 'product-details__stock product-details__stock--unavailable'
                        }
                    >
                        {inStock
                            ? `В наличии: ${product.stockQuantity} шт.`
                            : 'Нет в наличии'}
                    </p>

                    <div className="product-details__description">
                        <h2>Описание товара</h2>
                        <p>
                            {product.description?.trim()
                                ? product.description
                                : 'Подробное описание товара пока не добавлено.'}
                        </p>
                    </div>

                    <p className="product-details__meta">
                        Артикул: {product.id}
                    </p>

                    <Link
                        className="product-details__catalog-link"
                        to="/products"
                    >
                        Продолжить просмотр каталога
                    </Link>
                </div>
            </article>
        </main>
    );
}