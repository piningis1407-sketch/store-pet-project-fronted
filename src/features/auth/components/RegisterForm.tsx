import { useState, type ComponentProps } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authApi } from '../api/authApi';
import { useAuth } from '../context/AuthContext';
import { getRussianErrorMessage } from '../../../shared/api/errorMessages';

type FormSubmitHandler = NonNullable<
    ComponentProps<'form'>['onSubmit']
>;

export default function RegisterForm() {
    const navigate = useNavigate();
    const { saveSession } = useAuth();

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    async function handleSubmit(
        event: Parameters<FormSubmitHandler>[0],
    ) {
        event.preventDefault();
        setError('');

        const normalizedName = name.trim();
        const normalizedEmail = email.trim();

        if (!normalizedName || normalizedName.length > 30) {
            setError(
                'Имя обязательно и должно содержать не более 30 символов.',
            );
            return;
        }

        if (!normalizedEmail) {
            setError('Введите email.');
            return;
        }

        if (password.length < 8 || password.length > 72) {
            setError('Пароль должен содержать от 8 до 72 символов.');
            return;
        }

        setLoading(true);

        try {
            const response = await authApi.register({
                name: normalizedName,
                email: normalizedEmail,
                password,
            });

            // Сохраняется только accessToken в памяти.
            // refreshToken браузер получает в HttpOnly Cookie.
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
            <h1>Регистрация</h1>

            <label>
                Имя
                <input
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    maxLength={30}
                    required
                    autoComplete="name"
                />
            </label>

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
                    minLength={8}
                    maxLength={72}
                    required
                    autoComplete="new-password"
                />
            </label>

            {error && <p role="alert">{error}</p>}

            <button type="submit" disabled={loading}>
                {loading ? 'Регистрация...' : 'Зарегистрироваться'}
            </button>

            <p>
                Уже есть аккаунт? <Link to="/login">Войти</Link>
            </p>
        </form>
    );
}