import RegisterForm from '../components/RegisterForm';
import '../../auth/auth.css';

export default function RegisterPage() {
    return (
        <main className="auth-page">
            <section className="auth-card">
                <p className="auth-card__eyebrow">Wood & Resin</p>
                <RegisterForm />
            </section>
        </main>
    );
}