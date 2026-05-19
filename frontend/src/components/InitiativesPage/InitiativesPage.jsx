
import { useNavigate, Link } from 'react-router-dom';
import { tokenService } from '../../../api/tokenService';
import { useInitiatives, useCreateInitiative} from "../../hooks/useInitiatives.js";
import styles from './InitiativesPage.module.css';
import {useState} from "react";

const InitiativesPage = () => {
    const navigate = useNavigate();
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({ title: '', description: '' });

    const { initiatives, isLoading } = useInitiatives({ status: 'Accepted' });
    const createMutation = useCreateInitiative();

    const handleLogout = () => {
        tokenService.clearTokens();
        navigate('/login');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await createMutation.mutateAsync(formData);
            setFormData({ title: '', description: '' });
            setShowForm(false);
        } catch (err) {
            console.error('Ошибка создания:', err);
        }
    };

    const getStatusBadge = (status) => {
        const map = {
            PendingReview: { text: 'На проверке', class: styles.badgePending },
            InQueue: { text: 'В очереди', class: styles.badgeQueue },
            InFirstHearing: { text: 'На слушании', class: styles.badgeHearing },
            Accepted: { text: 'Принята', class: styles.badgeAccepted },
            Rejected: { text: 'Отклонена', class: styles.badgeRejected },
        };
        const s = map[status] || { text: status, class: '' };
        return <span className={`${styles.badge} ${s.class}`}>{s.text}</span>;
    };

    if (isError) return <div className={styles.error}>Не удалось загрузить инициативы</div>;

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <div className={styles.headerLeft}>
                    <Link to="/dashboard" className={styles.backBtn}>← Назад</Link>
                    <h1 className={styles.headerTitle}>Инициативы граждан</h1>
                </div>
                <button className={styles.logoutBtn} onClick={handleLogout}>Выйти</button>
            </header>

            <main className={styles.main}>
                <div className={styles.topBar}>
                    <h2>Активные и принятые инициативы</h2>
                    <button className={styles.primaryBtn} onClick={() => setShowForm(!showForm)}>
                        {showForm ? 'Скрыть форму' : '+ Предложить инициативу'}
                    </button>
                </div>

                {showForm && (
                    <form onSubmit={handleSubmit} className={styles.formCard}>
                        <h3>Новая инициатива</h3>
                        <input
                            type="text"
                            placeholder="Название"
                            value={formData.title}
                            onChange={e => setFormData({ ...formData, title: e.target.value })}
                            required
                            maxLength={200}
                        />
                        <textarea
                            placeholder="Подробное описание проблемы и предложения"
                            value={formData.description}
                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                            required
                            maxLength={2000}
                            rows={4}
                        />
                        <div className={styles.formActions}>
                            <button type="button" onClick={() => setShowForm(false)} className={styles.secondaryBtn}>Отмена</button>
                            <button type="submit" className={styles.primaryBtn} disabled={createMutation.isPending}>
                                {createMutation.isPending ? 'Отправка...' : 'Отправить на рассмотрение'}
                            </button>
                        </div>
                    </form>
                )}

                {isLoading ? (
                    <div className={styles.loading}>Загрузка...</div>
                ) : initiatives.length === 0 ? (
                    <div className={styles.empty}>Пока нет активных инициатив</div>
                ) : (
                    <div className={styles.grid}>
                        {initiatives.map(init => (
                            <article key={init.id} className={styles.card}>
                                <div className={styles.cardHeader}>
                                    {getStatusBadge(init.status)}
                                    <time className={styles.date}>{new Date(init.createdAt).toLocaleDateString('ru-RU')}</time>
                                </div>
                                <h3 className={styles.cardTitle}>{init.title}</h3>
                                <p className={styles.cardDesc}>{init.description}</p>
                                <div className={styles.cardFooter}>
                                    <span className={styles.author}>👤 {init.authorName}</span>
                                </div>
                            </article>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
};

export default InitiativesPage;