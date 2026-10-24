import type { Product } from '../types/product';

interface ProductCardProps {
    product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
    return (
        <article className="product-card">
            {product.imageUrl ? (
                <img
                    className="product-card__image"
                    src={product.imageUrl}
                    alt={product.name}
                    loading="lazy"
                />
            ) : (
                <div className="product-card__placeholder">
                    Нет изображения
                </div>
            )}

            <div className="product-card__content">
                <h2>{product.name}</h2>

                <p className="product-card__description">
                    {product.description || 'Описание отсутствует'}
                </p>

                <p className="product-card__price">
                    {product.price.toLocaleString('ru-RU', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                    })} ₽
                </p>

                <p className="product-card__stock">
                    {product.stockQuantity > 0
                        ? `В наличии: ${product.stockQuantity}`
                        : 'Нет в наличии'}
                </p>
            </div>
        </article>
    );
}