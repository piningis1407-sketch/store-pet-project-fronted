import LoginForm from '../components/LoginForm';
import '../../auth/auth.css';

export default function LoginPage() {
    return (
        <main className="auth-page">
            <section className="auth-card">
                <p className="auth-card__eyebrow">Wood & Resin</p>
                <LoginForm />
            </section>
        </main>
    );
}