import { useNavigate } from 'react-router-dom';
import { tokenService } from '../../../api/tokenService.js';
import { useInitiatives, useCreateInitiative } from "../../hooks/useInitiatives.js";
import { useCommittees } from "../../hooks/useCommittees.js";
import { useUserProfile } from "../../hooks/useUserProfile.js";
import { getUserId } from '../../utils/jwt.js';
import styles from './InitiativesPage.module.css';
import { useState, useMemo } from "react";
import Navbar from "../../components/Layout/NaVbar/NavBar.jsx";
import { useAuthRedirect } from "../../hooks/useAuthRedirect.js";

const InitiativesPage = () => {
    const navigate = useNavigate();
    const requireAuth = useAuthRedirect();
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        committeeId: ''
    });

    const { initiatives, isLoading, isError, error } = useInitiatives({ status: 'Accepted' });
    const createMutation = useCreateInitiative();
    const { committees, isLoading: loadCommittees } = useCommittees();
    const { profile } = useUserProfile();
    const currentUserId = getUserId();

    const userCommittees = useMemo(() => {
        if (!committees || !profile?.commissions) return [];

        const userCommitteeIds = profile.commissions
            .filter(c => !c.dismissedAt)
            .map(c => c.committeeId);

        return committees.filter(c => userCommitteeIds.includes(c.id));
    }, [committees, profile]);

    const handleLogout = () => {
        tokenService.clearTokens();
        navigate('/login');
    };

    const handleCreateClick = () => {
        requireAuth(() => navigate("/initiatives/create"));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await createMutation.mutateAsync({
                title: formData.title,
                description: formData.description,
                userId: currentUserId,
                committeeId: formData.committeeId || undefined
            });
            setFormData({ title: '', description: '', committeeId: '' });
            setShowForm(false);
        } catch (err) {
            console.error('Ошибка создания:', err);
            alert(err.response?.data?.error || err.message || 'Не удалось создать инициативу');
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
                        <button
                            className={styles.primaryBtn}
                            onClick={() => requireAuth(() => setShowForm(prev => !prev))}
                        >
                            {showForm ? 'Скрыть форму' : '+ Предложить инициативу'}
                        </button>
                    </div>

                    {showForm && (
                        <form onSubmit={handleSubmit} className={styles.formCard}>
                            <h3>Новая инициатива</h3>

                            <select
                                value={formData.committeeId}
                                onChange={e => setFormData({ ...formData, committeeId: e.target.value })}
                                className={styles.selectInput}
                                required
                            >
                                <option value="">-- Выберите комиссию --</option>
                                {loadCommittees ? (
                                    <option value="" disabled>Загрузка комиссий...</option>
                                ) : userCommittees.length === 0 ? (
                                    <option value="" disabled>Вы не состоите ни в одной комиссии</option>
                                ) : userCommittees.map(c => (
                                    <option key={c.id} value={c.id}>{c.name}</option>
                                ))}
                            </select>

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
                                            {init.committeeName && (
                                                <span className={styles.committeeBadge}>
                                                    {init.committeeName}
                                                </span>
                                            )}
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