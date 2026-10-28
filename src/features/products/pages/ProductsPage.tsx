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

export function ProductsPage() {
    const [data, setData] = useState<ProductPage | null>(null);
    const [categories, setCategories] = useState<Category[]>([]);
    const [categoryId, setCategoryId] = useState('');
    const [page, setPage] = useState(0);
    const [sort, setSort] = useState<SortOption>('name,asc');
    const [loading, setLoading] = useState(true);
    const [categoriesError, setCategoriesError] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [reloadKey, setReloadKey] = useState(0);
    const [searchParams, setSearchParams] = useSearchParams();
    const search = searchParams.get('search')?.trim() ?? '';

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
                    ...(categoryId ? { categoryId: Number(categoryId) } : {}),
                    ...(search.length > 0 ? { search } : {}),
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

    useEffect(() => {
        setPage(0);
    }, [search]);

    function changeSort(value: SortOption) {
        setSort(value);
        setPage(0);
    }

    function changeCategory(value: string) {
        setCategoryId(value);
        setPage(0);
    }

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
                    <button onClick={() => setReloadKey(value => value + 1)}>
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
                                onClick={() =>
                                    setPage(current => current - 1)
                                }
                            >
                                Назад
                            </button>

                            <span>
                                Страница {data.number + 1} из {data.totalPages}
                            </span>

                            <button
                                disabled={data.last}
                                onClick={() =>
                                    setPage(current => current + 1)
                                }
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