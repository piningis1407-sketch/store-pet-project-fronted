import { useState } from 'react';
import AdminUsers from '../components/AdminUsers';
import AdminProducts from '../components/AdminProducts';
import '../admin.css';
import AdminCategories from "../components/AdminCategories";
import AdminOrders from "../components/AdminOrders";

type AdminTab = 'products' | 'categories' | 'users'| 'orders';

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
                <button
                    type="button"
                    className={activeTab === 'orders' ? 'active' : ''}
                    onClick={() => setActiveTab('orders')}
                >
                    Заказы
                </button>
            </nav>

            <section className="admin-content">
                {activeTab === 'products' && <AdminProducts />}

                {activeTab === 'categories' && <AdminCategories />}

                {activeTab === 'users' && <AdminUsers />}

                {activeTab === 'orders' && <AdminOrders />}
            </section>
        </main>
    );

}