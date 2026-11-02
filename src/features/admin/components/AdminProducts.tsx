import type React from 'react';
import { useCallback, useEffect, useState } from 'react';
import {
    activateProduct,
    deactivateProduct,
    getAdminProducts,
    createProduct,
    updateProduct,
} from '../../products/api/productApi';
import type { ProductRequest } from '../../products/api/productApi';

import { getCategories } from '../../products/api/categoriesApi';

import type {
    Product,
    ProductPage,
    Category,
} from '../../products/types/product';

const PAGE_SIZE = 10;

export default function AdminProducts() {
    const [data, setData] = useState<ProductPage | null>(null);
    const [page, setPage] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const emptyForm: ProductRequest = {
        name: '',
        description: '',
        price: 0,
        stockQuantity: 0,
        imageUrl: '',
        categoryId: null,
    };

    const [categories, setCategories] = useState<Category[]>([]);
    const [formData, setFormData] = useState<ProductRequest>(emptyForm);
    const [editingProductId, setEditingProductId] = useState<number | null>(null);
    const [showForm, setShowForm] = useState(false);
    const [saving, setSaving] = useState(false);
    const [categoriesError, setCategoriesError] = useState('');

    const loadProducts = useCallback(async () => {
        setLoading(true);
        setError('');

        try {
            const result = await getAdminProducts({
                page,
                size: PAGE_SIZE,
                sort: 'createdAt,desc',
            });

            setData(result);
        } catch (err: unknown) {
            setError(
                err instanceof Error
                    ? err.message
                    : 'Не удалось загрузить товары',
            );
        } finally {
            setLoading(false);
        }
    }, [page]);

    useEffect(() => {
        void loadProducts();
    }, [loadProducts]);

    useEffect(() => {
        getCategories()
            .then(setCategories)
            .catch((err: unknown) => {
                setCategoriesError(
                    err instanceof Error
                        ? err.message
                        : 'Не удалось загрузить категории',
                );
            });
    }, []);

    async function handleToggleActive(product: Product) {
        const action = product.active ? 'деактивировать' : 'активировать';

        if (!window.confirm(
            `Вы действительно хотите ${action} товар «${product.name}»?`,
        )) {
            return;
        }

        try {
            if (product.active) {
                await deactivateProduct(product.id);
            } else {
                await activateProduct(product.id);
            }

            if (data && data.content.length === 1 && page > 0) {
                setPage(current => current - 1);
            } else {
                await loadProducts();
            }
        } catch (err: unknown) {
            setError(
                err instanceof Error
                    ? err.message
                    : 'Не удалось изменить статус товара',
            );
        }
    }

    function handleCreate() {
        setEditingProductId(null);
        setFormData(emptyForm);
        setShowForm(true);
    }

    function handleEdit(product: Product) {
        setEditingProductId(product.id);

        setFormData({
            name: product.name,
            description: product.description,
            price: product.price,
            stockQuantity: product.stockQuantity,
            imageUrl: product.imageUrl,
            categoryId: product.category?.id ?? null,
        });

        setShowForm(true);
    }

    function handleFormChange(
        field: keyof ProductRequest,
        value: string,
    ) {
        setFormData(current => ({
            ...current,
            [field]:
                field === 'price' || field === 'stockQuantity'
                    ? Number(value)
                    : field === 'categoryId'
                        ? value === '' ? null : Number(value)
                        : value,
        }));
    }

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();

        setSaving(true);
        setError('');

        try {
            const request: ProductRequest = {
                ...formData,
                description: formData.description?.trim() || null,
                imageUrl: formData.imageUrl?.trim() || null,
            };

            if (editingProductId === null) {
                await createProduct(request);
            } else {
                await updateProduct(editingProductId, request);
            }

            setShowForm(false);
            setFormData(emptyForm);
            setEditingProductId(null);

            if (page !== 0 && editingProductId === null) {
                setPage(0);
            } else {
                await loadProducts();
            }
        } catch (err: unknown) {
            setError(
                err instanceof Error
                    ? err.message
                    : 'Не удалось сохранить товар',
            );
        } finally {
            setSaving(false);
        }
    }

    return (
        <section className="admin-products">
            <h2>Управление товарами</h2>
            <div className="admin-products__toolbar">
                <button type="button" onClick={handleCreate}>
                    Добавить товар
                </button>
            </div>
            {showForm && (
                <form
                    className="admin-product-form"
                    onSubmit={handleSubmit}
                >
                    <h3>
                        {editingProductId === null
                            ? 'Создание товара'
                            : 'Редактирование товара'}
                    </h3>

                    <label>
                        Название *
                        <input
                            type="text"
                            maxLength={150}
                            required
                            value={formData.name}
                            onChange={e => handleFormChange('name', e.target.value)}
                        />
                    </label>

                    <label>
                        Описание
                        <textarea
                            maxLength={2000}
                            value={formData.description ?? ''}
                            onChange={e => handleFormChange('description', e.target.value)}
                        />
                    </label>

                    <label>
                        Цена *
                        <input
                            type="number"
                            min="0.01"
                            step="0.01"
                            required
                            value={formData.price || ''}
                            onChange={e => handleFormChange('price', e.target.value)}
                        />
                    </label>

                    <label>
                        Количество на складе *
                        <input
                            type="number"
                            min="0"
                            step="1"
                            required
                            value={formData.stockQuantity}
                            onChange={e => handleFormChange('stockQuantity', e.target.value)}
                        />
                    </label>

                    <label>
                        URL изображения
                        <input
                            type="url"
                            maxLength={1000}
                            value={formData.imageUrl ?? ''}
                            onChange={e => handleFormChange('imageUrl', e.target.value)}
                        />
                    </label>

                    <label>
                        Категория
                        <select
                            value={formData.categoryId ?? ''}
                            onChange={e => handleFormChange('categoryId', e.target.value)}
                        >
                            <option value="">Без категории</option>

                            {categories.map(category => (
                                <option key={category.id} value={category.id}>
                                    {category.name}
                                </option>
                            ))}
                        </select>
                    </label>

                    {categoriesError && (
                        <p role="alert">{categoriesError}</p>
                    )}

                    <div className="admin-product-form__actions">
                        <button type="submit" disabled={saving}>
                            {saving ? 'Сохранение...' : 'Сохранить'}
                        </button>

                        <button
                            type="button"
                            disabled={saving}
                            onClick={() => setShowForm(false)}
                        >
                            Отмена
                        </button>
                    </div>
                </form>
            )}
            {data && (
                <p>Всего товаров: {data.totalElements}</p>
            )}

            {loading && <p>Загрузка товаров...</p>}

            {error && <p role="alert">{error}</p>}

            {!loading && data && (
                <>
                    {data.empty ? (
                        <p>Активных товаров пока нет.</p>
                    ) : (
                        <table>
                            <thead>
                            <tr>
                                <th>ID</th>
                                <th>Название</th>
                                <th>Категория</th>
                                <th>Цена</th>
                                <th>Остаток</th>
                                <th>Статус</th>
                                <th>Действия</th>
                            </tr>
                            </thead>

                            <tbody>
                            {data.content.map(product => (
                                <tr key={product.id}>
                                    <td>{product.id}</td>
                                    <td>{product.name}</td>
                                    <td>
                                        {product.category?.name ?? '—'}
                                    </td>
                                    <td>
                                        {product.price.toFixed(2)}
                                    </td>
                                    <td>{product.stockQuantity}</td>
                                    <td>
                                        {product.active ? 'Активен' : 'Неактивен'}
                                    </td>
                                    <td>
                                        <button
                                            type="button"
                                            onClick={() => handleEdit(product)}
                                        >
                                            Редактировать
                                        </button>
                                    </td>
                                    <td>
                                        <button
                                            type="button"
                                            onClick={() => void handleToggleActive(product)}
                                        >
                                            {product.active ? 'Деактивировать' : 'Активировать'}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    )}

                    {data.totalPages > 1 && (
                        <div className="admin-pagination">
                            <button
                                type="button"
                                disabled={data.first}
                                onClick={() => setPage(current => current - 1)}
                            >
                                Назад
                            </button>

                            <span>
                            Страница {data.number + 1} из {data.totalPages}
                        </span>

                            <button
                                type="button"
                                disabled={data.last}
                                onClick={() => setPage(current => current + 1)}
                            >
                                Далее
                            </button>
                        </div>
                    )}
                </>
            )}
        </section>
    );

}