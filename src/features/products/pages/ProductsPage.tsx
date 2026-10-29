import { useSearchParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { getProducts } from '../api/productApi';
import { getCategories } from '../api/categoriesApi';
import type { Category, ProductPage } from '../types/product';
import { ProductCard } from '../components/ProductCard';
import { getRussianErrorMessage } from '../../../shared/api/errorMessages';
import '../products.css';

type SortOption =
    | 'name,asc'
    | 'price,asc'
    | 'price,desc'
    | 'createdAt,desc';

const PAGE_SIZE = 12;

const SORT_OPTIONS: SortOption[] = [
    'name,asc',
    'price,asc',
    'price,desc',
    'createdAt,desc',
];

function parsePage(value: string | null): number {
    if (!value || !/^\d+$/.test(value)) {
        return 0;
    }

    const parsed = Number(value);

    return Number.isSafeInteger(parsed) ? parsed : 0;

}

function parseSort(value: string | null): SortOption {
    return SORT_OPTIONS.includes(value as SortOption)
        ? (value as SortOption)
        : 'name,asc';
}

export function ProductsPage() {
    const [data, setData] = useState<ProductPage | null>(null);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [categoriesError, setCategoriesError] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [reloadKey, setReloadKey] = useState(0);

    const [searchParams, setSearchParams] = useSearchParams();

    const search = searchParams.get('search')?.trim() ?? '';
    const page = parsePage(searchParams.get('page'));
    const sort = parseSort(searchParams.get('sort'));
    const categoryId = searchParams.get('categoryId') ?? '';

    function updateCatalogParams(updates: Record<string, string>) {
        setSearchParams(current => {
            const next = new URLSearchParams(current);

            for (const [key, value] of Object.entries(updates)) {
                if (value) {
                    next.set(key, value);
                } else {
                    next.delete(key);
                }
            }

            return next;
        });
    }

    function changeSort(value: SortOption) {
        updateCatalogParams({
            sort: value === 'name,asc' ? '' : value,
            page: '',
        });
    }

    function changeCategory(value: string) {
        updateCatalogParams({
            categoryId: value,
            page: '',
        });
    }

    function changePage(value: number) {
        updateCatalogParams({
            page: value === 0 ? '' : String(value),
        });
    }

    useEffect(() => {
        let cancelled = false;

        async function loadProducts() {
            setLoading(true);
            setError(null);

            try {
                const result = await getProducts({
                    page: search ? 0 : page,
                    size: PAGE_SIZE,
                    sort,
                    ...(categoryId && /^\d+$/.test(categoryId)
                        ? { categoryId: Number(categoryId) }
                        : {}),
                    ...(search ? { search } : {}),
                });

                if (!cancelled) {
                    setData(result);
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

        void loadProducts();

        return () => {
            cancelled = true;
        };
    }, [page, sort, categoryId, search, reloadKey]);

    useEffect(() => {
        let cancelled = false;

        async function loadCategories() {
            setCategoriesError(null);

            try {
                const result = await getCategories();

                if (!cancelled) {
                    setCategories(result);
                }
            } catch (err) {
                if (!cancelled) {
                    setCategoriesError(getRussianErrorMessage(err));
                }
            }
        }

        void loadCategories();

        return () => {
            cancelled = true;
        };
    }, []);

    return (
        <main className="products-page">
            <div className="products-page__header">
                <div>
                    <h1>Каталог товаров</h1>
                    <p>Всего товаров: {data?.totalElements ?? 0}</p>
                </div>

                <div className="products-page__filters">
                    <label>
                        Категория:{' '}
                        <select
                            value={categoryId}
                            onChange={event => changeCategory(event.target.value)}
                        >
                            <option value="">Все категории</option>
                            {categories.map(category => (
                                <option key={category.id} value={category.id}>
                                    {category.name}
                                </option>
                            ))}
                        </select>
                    </label>

                    <label>
                        Сортировка:{' '}
                        <select
                            value={sort}
                            onChange={event =>
                                changeSort(event.target.value as SortOption)
                            }
                        >
                            <option value="name,asc">По названию</option>
                            <option value="price,asc">Сначала дешевле</option>
                            <option value="price,desc">Сначала дороже</option>
                            <option value="createdAt,desc">Сначала новые</option>
                        </select>
                    </label>
                </div>
            </div>

            {categoriesError && (
                <p role="alert">{categoriesError}</p>
            )}

            {loading ? (
                <p>Загрузка товаров...</p>
            ) : error ? (
                <section>
                    <p role="alert">{error}</p>
                    <button
                        type="button"
                        onClick={() => setReloadKey(value => value + 1)}
                    >
                        Повторить загрузку
                    </button>
                </section>
            ) : !data || data.content.length === 0 ? (
                <p>В этой категории пока нет доступных товаров.</p>
            ) : (
                <>
                    <div className="products-grid">
                        {data.content.map(product => (
                            <ProductCard
                                key={product.id}
                                product={product}
                            />
                        ))}
                    </div>

                    {data.totalPages > 1 && (
                        <nav
                            className="pagination"
                            aria-label="Страницы каталога"
                        >
                            <button
                                disabled={data.first}
                                onClick={() => changePage(page - 1)}
                            >
                                Назад
                            </button>

                            <span>
                            Страница {data.number + 1} из {data.totalPages}
                        </span>

                            <button
                                disabled={data.last}
                                onClick={() => changePage(page + 1)}
                            >
                                Далее
                            </button>
                        </nav>
                    )}
                </>
            )}
        </main>
    );

}