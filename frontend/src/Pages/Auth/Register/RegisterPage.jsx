import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from "../../../../api/apiService.js";
import styles from './RegisterPage.module.css';

const RegisterPage = () => {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        middleName: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (formData.password !== formData.confirmPassword) {
            setError('Пароли не совпадают');
            return;
        }

        setLoading(true);
        try {
            await authService.register({
                firstName: formData.firstName,
                lastName: formData.lastName,
                middleName: formData.middleName,
                email: formData.email,
                password: formData.password
            });
            navigate('/login');
        } catch (err) {
            const message = err.response?.data?.title || 'Ошибка регистрации. Попробуйте позже.';
            setError(message);
        } finally {
            setLoading(false);
        }
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
                    <h1>Регистрация</h1>
                    <p>Создайте учётную запись для доступа к системе</p>
                </div>

                <form onSubmit={handleSubmit} className={styles.form}>
                    {error && <div className={styles.error}>{error}</div>}

                    <div className={styles.row}>
                        <div className={styles.field}>
                            <label htmlFor="firstName">Имя</label>
                            <input
                                id="firstName"
                                name="firstName"
                                type="text"
                                value={formData.firstName}
                                onChange={handleChange}
                                placeholder="Иван"
                                required
                                className={styles.input}
                            />
                        </div>

                        <div className={styles.field}>
                            <label htmlFor="lastName">Фамилия</label>
                            <input
                                id="lastName"
                                name="lastName"
                                type="text"
                                value={formData.lastName}
                                onChange={handleChange}
                                placeholder="Иванов"
                                required
                                className={styles.input}
                            />
                        </div>
                    </div>

                    <div className={styles.field}>
                        <label htmlFor="middleName">Отчество</label>
                        <input
                            id="middleName"
                            name="middleName"
                            type="text"
                            value={formData.middleName}
                            onChange={handleChange}
                            placeholder="Иванович"
                            className={styles.input}
                        />
                    </div>

                    <div className={styles.field}>
                        <label htmlFor="email">Email</label>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="deputy@duma.gov"
                            required
                            className={styles.input}
                        />
                    </div>

                    <div className={styles.field}>
                        <label htmlFor="password">Пароль</label>
                        <input
                            id="password"
                            name="password"
                            type="password"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="Минимум 6 символов"
                            required
                            className={styles.input}
                        />
                    </div>

                    <div className={styles.field}>
                        <label htmlFor="confirmPassword">Подтвердите пароль</label>
                        <input
                            id="confirmPassword"
                            name="confirmPassword"
                            type="password"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            placeholder="Повторите пароль"
                            required
                            className={styles.input}
                        />
                    </div>

                    <button type="submit" disabled={loading} className={styles.button}>
                        {loading ? 'Создание...' : 'Зарегистрироваться'}
                    </button>
                </form>

                <div className={styles.footer}>
                    <span>Уже есть аккаунт? </span>
                    <Link to="/login" className={styles.link}>Войти в систему</Link>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;