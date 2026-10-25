import { Link } from 'react-router-dom';
import { useAuth } from '../../features/auth/context/AuthContext';
import './header.css';

export function Header() {
    const { isAuthenticated, logout } = useAuth();

    return (
        <header className="site-header">
            <Link to="/products" className="site-header__logo">
                Wood & Resin
            </Link>

            <nav className="site-header__nav" aria-label="Основная навигация">
                <Link to="/products">Каталог</Link>

                {!isAuthenticated ? (
                    <>
                        <Link to="/login">Войти</Link>
                        <Link to="/register" className="site-header__register">
                            Регистрация
                        </Link>
                    </>
                ) : (
                    <button
                        type="button"
                        onClick={() => void logout()}
                    >
                        Выйти
                    </button>
                )}
            </nav>
        </header>
    );

}