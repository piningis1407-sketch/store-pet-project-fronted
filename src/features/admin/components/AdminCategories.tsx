import {
    activateCategory,
    createCategory,
    deactivateCategory,
    getAdminCategories,
    updateCategory,
} from '../../products/api/categoriesApi';

import type { CategoryRequest } from '../../products/api/categoriesApi';
import type { Category } from '../../products/types/product';

import { useCallback, useEffect, useState } from 'react';
import type { FormEvent } from 'react';

import '../admin-product-form.css';

export default function AdminCategories() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [saving, setSaving] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [editingCategoryId, setEditingCategoryId] = useState<number | null>(null);

    const [formData, setFormData] = useState<CategoryRequest>({
        name: '',
        description: '',
    });

    const loadCategories = useCallback(async (showLoader = true) => {
        if (showLoader) {
            setLoading(true);
        }

        setError('');

        try {
            const result = await getAdminCategories();
            setCategories(result);
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : 'Не удалось загрузить категории',
            );
        } finally {
            if (showLoader) {
                setLoading(false);
            }
        }
    }, []);

    useEffect(() => {
        void loadCategories();
    }, [loadCategories]);

    function handleCreate() {
        setEditingCategoryId(null);
        setFormData({ name: '', description: '' });
        setShowForm(true);
        setError('');
    }

    function handleEdit(category: Category) {
        setEditingCategoryId(category.id);

        setFormData({
            name: category.name,
            description: category.description ?? '',
        });

        setShowForm(true);
        setError('');
    }

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setSaving(true);
        setError('');

        try {
            const request: CategoryRequest = {
                name: formData.name.trim(),
                description: formData.description?.trim() || null,
            };

            if (editingCategoryId !== null) {
                await updateCategory(editingCategoryId, request);
            } else {
                await createCategory(request);
            }

            setShowForm(false);
            setEditingCategoryId(null);
            setFormData({ name: '', description: '' });

            await loadCategories();
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : editingCategoryId !== null
                        ? 'Не удалось изменить категорию'
                        : 'Не удалось создать категорию',
            );
        } finally {
            setSaving(false);
        }
    }

    async function handleDeactivate(category: Category) {
        if (!window.confirm(
            `Деактивировать категорию «${category.name}»?`,
        )) {
            return;
        }

        setError('');

        try {
            await deactivateCategory(category.id);
            await loadCategories(false);
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : 'Не удалось деактивировать категорию',
            );
        }
    }

    async function handleActivate(category: Category) {
        setError('');

        try {
            await activateCategory(category.id);
            await loadCategories(false);
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : 'Не удалось активировать категорию',
            );
        }
    }

    return (
        <section className="admin-categories">
            <h2>Управление категориями</h2>

            <div className="admin-products__toolbar">
                <button type="button" onClick={handleCreate}>
                    Добавить категорию
                </button>
            </div>

            {error && <p role="alert">{error}</p>}

            {showForm && (
                <div className="admin-product-modal">
                    <form className="admin-product-form" onSubmit={handleSubmit}>
                        <h3>
                            {editingCategoryId !== null
                                ? 'Редактирование категории'
                                : 'Создание категории'}
                        </h3>

                    <label>
                        Название *
                        <input
                            type="text"
                            maxLength={100}
                            required
                            value={formData.name}
                            onChange={event =>
                                setFormData(current => ({
                                    ...current,
                                    name: event.target.value,
                                }))
                            }
                        />
                    </label>

                    <label>
                        Описание
                        <textarea
                            maxLength={1000}
                            value={formData.description ?? ''}
                            onChange={event =>
                                setFormData(current => ({
                                    ...current,
                                    description: event.target.value,
                                }))
                            }
                        />
                    </label>

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
                </div>
            )}

            {loading ? (
                <p>Загрузка категорий...</p>
            ) : categories.length === 0 ? (
                <p>Категорий пока нет.</p>
            ) : (
                <div className="admin-table-wrapper">
                    <table className="admin-table">
                        <thead>
                        <tr>
                            <th>ID</th>
                            <th>Название</th>
                            <th>Описание</th>
                            <th>Дата создания</th>
                            <th>Действия</th>
                        </tr>
                        </thead>

                        <tbody>
                        {categories.map(category => (
                            <tr key={category.id}>
                                <td>{category.id}</td>
                                <td>{category.name}</td>
                                <td className="admin-table__description">
                                    {category.description || '—'}
                                </td>
                                <td>
                                    {new Date(category.createdAt)
                                        .toLocaleDateString('ru-RU')}
                                </td>
                                <td>
                                    <div className="admin-table__actions">
                                        <button
                                            type="button"
                                            onClick={() => handleEdit(category)}
                                        >
                                            Редактировать
                                        </button>
                                        {category.active ? (
                                            <button
                                                type="button"
                                                className="admin-button--danger"
                                                onClick={() => void handleDeactivate(category)}
                                            >
                                                Деактивировать
                                            </button>
                                        ) : (
                                            <button
                                                type="button"
                                                onClick={() => void handleActivate(category)}
                                            >
                                                Активировать
                                            </button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            )}
        </section>
    );
}