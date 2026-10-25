import { useState, type ComponentProps } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authApi } from '../api/authApi';
import { useAuth } from '../context/AuthContext';
import { getRussianErrorMessage } from '../../../shared/api/errorMessages';

type FormSubmitHandler = NonNullable<
    ComponentProps<'form'>['onSubmit']
>;

export default function LoginForm() {
    const navigate = useNavigate();
    const { saveSession } = useAuth();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    async function handleSubmit(
        event: Parameters<FormSubmitHandler>[0],
    ) {
        event.preventDefault();
        setError('');

        const normalizedEmail = email.trim();

        if (!normalizedEmail || !password) {
            setError('Введите email и пароль.');
            return;
        }

        setLoading(true);

        try {
            const response = await authApi.login({
                email: normalizedEmail,
                password,
            });

            // Сохраняем accessToken в памяти.
            // refreshToken устанавливается backend в HttpOnly Cookie.
            saveSession(response);

            navigate('/users', { replace: true });
        } catch (err) {
            setError(getRussianErrorMessage(err));
        } finally {
            setLoading(false);
        }
    }

    return (
        <form onSubmit={handleSubmit}>
            <h1>Вход</h1>

            <label>
                Email
                <input
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    required
                    autoComplete="email"
                />
            </label>

            <label>
                Пароль
                <input
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    required
                    autoComplete="current-password"
                />
            </label>

            {error && <p role="alert">{error}</p>}

            <button type="submit" disabled={loading}>
                {loading ? 'Вход...' : 'Войти'}
            </button>

            <p>
                Нет аккаунта?{' '}
                <Link to="/register">Зарегистрироваться</Link>
            </p>
        </form>
    );
}