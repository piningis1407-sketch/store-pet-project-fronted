import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { usersApi } from '../../users/api/usersApi';
import {UserResponse} from "../../users/types/user.types";


export default function AdminUsers() {
    const [users, setUsers] = useState<UserResponse[]>([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);

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
            setUsers(current => current.filter(user => user.id !== id));
        } catch (err: unknown) {
            setError(
                err instanceof Error ? err.message : 'Ошибка удаления',
            );
        }
    }

    if (loading) return <p>Загрузка пользователей...</p>;

    return (
        <section>
            <h2>Зарегистрированные пользователи</h2>

            {error && <p role="alert">{error}</p>}

            {!error && (
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
                    {users.map(user => (
                        <tr key={user.id}>
                            <td>{user.id}</td>
                            <td>{user.name}</td>
                            <td>{user.email}</td>
                            <td>{user.role}</td>
                            <td>
                                <Link to={`/users/${user.id}`}>
                                    Открыть
                                </Link>

                                {' '}

                                <button
                                    onClick={() => handleDelete(user.id)}
                                >
                                    Удалить
                                </button>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            )}

            {!error && users.length === 0 && (
                <p>Зарегистрированных пользователей пока нет.</p>
            )}
        </section>
    );
}