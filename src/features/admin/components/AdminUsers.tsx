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
        <section className="admin-users">
            <h2>Зарегистрированные пользователи</h2>

            {error && <p role="alert">{error}</p>}

            {!error && (
                <table className="admin-table admin-table--users">
                    <thead>
                    <tr>
                        <th>ID</th>
                        <th>Имя</th>
                        <th>Email</th>
                        <th>Роль</th>
                        <th>Дата регистрации</th>
                        <th>Действия</th>
                    </tr>
                    </thead>

                    <tbody>
                    {users.map(user => (
                        <tr key={user.id}>
                            <td>{user.id}</td>
                            <td>{user.name}</td>
                            <td className="admin-table__email">{user.email}</td>
                            <td>
                                <span className="admin-role">{user.role}</span>
                            </td>
                            <td>
                                {new Date(user.createdAt).toLocaleDateString('ru-RU')}
                            </td>
                            <td>
                                <div className="admin-table__actions">
                                    <Link
                                        to={`/users/${user.id}`}
                                        className="admin-table__link"
                                    >
                                        Открыть
                                    </Link>

                                    <button
                                        type="button"
                                        className="admin-button--danger"
                                        onClick={() => handleDelete(user.id)}
                                    >
                                        Удалить
                                    </button>
                                </div>
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