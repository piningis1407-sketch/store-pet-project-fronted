import { useState } from 'react';
import AdminUsers from '../components/AdminUsers';
import AdminProducts from '../components/AdminProducts';
import '../admin.css';

type AdminTab = 'products' | 'categories' | 'users';

export default function AdminPage() {
    const [activeTab, setActiveTab] = useState<AdminTab>('products');

    return (
        <main className="admin-page">
            <h1>Панель администратора</h1>

            <nav className="admin-tabs" aria-label="Разделы администрирования">
                <button
                    type="button"
                    className={activeTab === 'products' ? 'active' : ''}
                    onClick={() => setActiveTab('products')}
                >
                    Товары
                </button>

                <button
                    type="button"
                    className={activeTab === 'categories' ? 'active' : ''}
                    onClick={() => setActiveTab('categories')}
                >
                    Категории
                </button>

                <button
                    type="button"
                    className={activeTab === 'users' ? 'active' : ''}
                    onClick={() => setActiveTab('users')}
                >
                    Пользователи
                </button>
            </nav>

            <section className="admin-content">
                {activeTab === 'products' && <AdminProducts />}

                {activeTab === 'categories' && (
                    <p>Управление категориями — следующий этап подключения.</p>
                )}

                {activeTab === 'users' && <AdminUsers />}
            </section>
        </main>
    );

}