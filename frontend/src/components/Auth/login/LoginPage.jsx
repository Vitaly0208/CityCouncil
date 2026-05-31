import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../../../../api/apiService';
import { tokenService } from "../../../../api/tokenService.js";
import styles from './LoginPage.module.css';

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const { data } = await authService.login({ email, password });
            tokenService.setTokens(data.accessToken, data.refreshToken);
            navigate('/dashboard');
        } catch (err) {
            const message = err.response?.data?.title || 'Неверный email или пароль';
            setError(message);
        } finally {
            setLoading(false);
        }
    };

    const handleGuestContinue = () => {
        navigate('/dashboard');
    };

    return (
        <div className={styles.container}>
            <div className={styles.card}>
                <div className={styles.logoContainer}>
                    <img
                        src="/gerb.png"
                        alt="Логотип"
                        className={styles.logoImage}
                    />
                </div>

                <div className={styles.header}>
                    <h1>Log In</h1>
                </div>

                <form onSubmit={handleSubmit} className={styles.form}>
                    {error && <div className={styles.error}>{error}</div>}

                    <div className={styles.inputGroup}>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Username or email"
                            required
                            className={styles.input}
                        />
                    </div>

                    <div className={styles.inputGroup}>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Password"
                            required
                            className={styles.input}
                        />
                    </div>

                    <button type="submit" disabled={loading} className={styles.button}>
                        {loading ? 'Loading...' : 'Log in'}
                    </button>
                </form>

                <div className={styles.footer}>
                    <Link to="/register" className={styles.link}>Зарегестрироваться.</Link>
                    <span className={styles.divider}>|</span>
                    <button
                        type="button"
                        onClick={handleGuestContinue}
                        className={styles.guestLink}
                    >
                        Продолжить как гость
                    </button>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;