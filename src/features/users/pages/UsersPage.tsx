import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { usersApi } from '../api/usersApi';
import type { UserResponse } from '../types/user.types';
import { useAuth } from '../../auth/context/AuthContext';

export default function UsersPage() {
    const [users, setUsers] = useState<UserResponse[]>([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);
    const { logout } = useAuth();

    useEffect(() => {
        usersApi.getAll()
            .then(setUsers)
            .catch((err: unknown) => {
                setError(
                    err instanceof Error
                        ? err.message
                        : 'Не удалось загрузить пользователей',
                );
            })
            .finally(() => setLoading(false));
    }, []);

    async function handleDelete(id: number) {
        if (!window.confirm('Удалить пользователя?')) return;

        try {
            await usersApi.delete(id);
            setUsers((current) => current.filter((user) => user.id !== id));
        } catch (err) {
            setError(
                err instanceof Error ? err.message : 'Ошибка удаления',
            );
        }
    }

    return (
        <main>
            <header>
                <h1>Пользователи</h1>
                <button onClick={logout}>Выйти</button>
            </header>

            {loading && <p>Загрузка...</p>}
            {error && <p role="alert">{error}</p>}

            {!loading && !error && (
                <table>
                    <thead>
                    <tr>
                        <th>ID</th>
                        <th>Имя</th>
                        <th>Email</th>
                        <th>Роль</th>
                        <th>Действия</th>
                    </tr>
                    </thead>
                    <tbody>
                    {users.map((user) => (
                        <tr key={user.id}>
                            <td>{user.id}</td>
                            <td>{user.name}</td>
                            <td>{user.email}</td>
                            <td>{user.role}</td>
                            <td>
                                <Link to={`/users/${user.id}`}>Открыть</Link>
                                {' '}
                                <button onClick={() => handleDelete(user.id)}>
                                    Удалить
                                </button>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            )}
        </main>
    );
}