import { useEffect, useState, type FormEvent } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../features/auth/context/AuthContext';
import './header.css';

export function Header() {
    const { isAuthenticated, isLoading, logout } = useAuth();
    const [search, setSearch] = useState('');
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        setSearch(params.get('search') ?? '');
    }, [location.search]);

    function handleSearch(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        const value = search.trim();

        if (!value) {
            navigate('/products');
            return;
        }

        navigate(`/products?search=${encodeURIComponent(value)}`);
    }

    function openCatalog() {
        setSearch('');
        navigate('/products');
    }

    return (
        <header className="site-header">
            <Link to="/products" className="site-header__logo">
                Wood <span>&amp;</span> Resin
            </Link>

            <form
                className="site-header__search"
                role="search"
                onSubmit={handleSearch}
            >
                <input
                    type="search"
                    aria-label="Поиск товаров"
                    placeholder="Найти товар..."
                    value={search}
                    onChange={event => setSearch(event.target.value)}
                />
                <button type="submit">Найти</button>
            </form>

            <nav
                className="site-header__nav"
                aria-label="Основная навигация"
            >
                <button type="button" onClick={openCatalog}>
                    Каталог
                </button>

                {!isLoading && (
                    isAuthenticated ? (
                        <button
                            type="button"
                            onClick={() => void logout()}
                        >
                            Выйти
                        </button>
                    ) : (
                        <>
                            <Link to="/login">Войти</Link>
                            <Link
                                to="/register"
                                className="site-header__register"
                            >
                                Регистрация
                            </Link>
                        </>
                    )
                )}
            </nav>
        </header>
    );

}