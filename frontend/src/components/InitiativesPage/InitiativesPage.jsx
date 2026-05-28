import { useNavigate } from 'react-router-dom';
import { tokenService } from '../../../api/tokenService';
import { useInitiatives, useCreateInitiative } from "../../hooks/useInitiatives.js";
import styles from './InitiativesPage.module.css';
import { useState } from "react";
import Navbar from "../Layout/NaVbar/NavBar.jsx";

const InitiativesPage = () => {
    const navigate = useNavigate();
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({ title: '', description: '' });

    const { initiatives, isLoading, isError, error } = useInitiatives({ status: 'Accepted' });
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

    if (isError) {
        return (
            <div className={styles.container}>
                <div className={styles.error}>
                    Не удалось загрузить инициативы: {error?.message || 'Проверьте соединение с API'}
                </div>
            </div>
        );
    }

    return (
        <>
            <Navbar onLogout={handleLogout} />
            <div className={styles.container}>
                <main className={styles.main}>
                    <div className={styles.topBar}>
                        <header className={styles.pageHeader}>
                            <h1 className={styles.pageTitle}>Инициативы</h1>
                            <p className={styles.pageSubtitle}>
                                Утвержденные и активные инициативы
                            </p>
                        </header>
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
                        <div className={styles.list}>
                            {initiatives.map(init => (
                                <article key={init.id} className={styles.card}>
                                    <div className={styles.cardImageWrapper}>
                                        <img
                                            src={init.imageUrl || '/initiative.png'}
                                            alt={init.title}
                                            className={styles.cardImage}
                                        />
                                    </div>
                                    <div className={styles.cardContent}>
                                        <div className={styles.cardHeader}>
                                            <h3 className={styles.cardTitle}>{init.title}</h3>
                                        </div>
                                        <p className={styles.cardDesc}>{init.description}</p>
                                    </div>
                                    <div className={styles.cardMeta}>
                                        <time className={styles.date}>{new Date(init.createdAt).toLocaleDateString('ru-RU')}</time>
                                        <span className={styles.author}>{init.authorName}</span>
                                    </div>
                                </article>
                            ))}
                        </div>
                    )}
                </main>
            </div>
        </>
    );
};

export default InitiativesPage;