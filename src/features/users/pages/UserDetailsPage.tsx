import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { usersApi } from '../api/usersApi';
import type { UserResponse } from '../types/user.types';

export default function UserDetailsPage() {
    const { id } = useParams<{ id: string }>();
    const [user, setUser] = useState<UserResponse | null>(null);
    const [error, setError] = useState('');

    useEffect(() => {
        const userId = Number(id);

        if (!id || !Number.isInteger(userId) || userId <= 0) {
            setError('Некорректный ID пользователя');
            return;
        }

        usersApi.getById(userId)
            .then(setUser)
            .catch((err: unknown) => {
                setError(
                    err instanceof Error ? err.message : 'Ошибка загрузки',
                );
            });
    }, [id]);

    if (error) return <p role="alert">{error}</p>;
    if (!user) return <p>Загрузка...</p>;

    return (
        <main>
            <h1>{user.name}</h1>
            <p>ID: {user.id}</p>
            <p>Email: {user.email}</p>
            <p>Роль: {user.role}</p>
            <p>Дата создания: {user.createdAt}</p>
            <Link to="/users">К списку пользователей</Link>
        </main>
    );
}