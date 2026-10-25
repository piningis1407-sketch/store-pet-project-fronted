import { useState } from 'react';
import type { Product } from '../types/product';
import { Link } from 'react-router-dom';

interface ProductCardProps {
    product: Product;
}

const priceFormatter = new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    maximumFractionDigits: 2,
});

export function ProductCard({ product }: ProductCardProps) {
    const [imageError, setImageError] = useState(false);

    const hasImage = Boolean(product.imageUrl) && !imageError;
    const inStock = product.stockQuantity > 0;

    return (
        <article className="product-card">
            <Link
                className="product-card__link"
                to={`/products/${product.id}`}
                aria-label={`Подробнее о товаре: ${product.name}`}
            >
                <div className="product-card__media">
                    {hasImage ? (
                        <img
                            className="product-card__image"
                            src={product.imageUrl!}
                            alt={product.name}
                            loading="lazy"
                            onError={() => setImageError(true)}
                        />
                    ) : (
                        <div
                            className="product-card__placeholder"
                            role="img"
                            aria-label={`Изображение товара «${product.name}» недоступно`}
                        >
                            <span>Изображение недоступно</span>
                        </div>
                    )}

                    {!inStock && (
                        <span className="product-card__badge">
                        Нет в наличии
                    </span>
                    )}
                </div>

                <div className="product-card__content">
                    {product.category && (
                        <p className="product-card__category">
                            {product.category.name}
                        </p>
                    )}

                    <h2 className="product-card__title">
                        {product.name}
                    </h2>

                    <p className="product-card__description">
                        {product.description || 'Описание отсутствует'}
                    </p>

                    <div className="product-card__footer">
                        <p className="product-card__price">
                            {priceFormatter.format(product.price)}
                        </p>

                        <p
                            className={
                                inStock
                                    ? 'product-card__stock product-card__stock--available'
                                    : 'product-card__stock product-card__stock--unavailable'
                            }
                        >
                            {inStock
                                ? `В наличии: ${product.stockQuantity} шт.`
                                : 'Под заказ'}
                        </p>
                    </div>
                </div>
            </Link>
        </article>
    );
}