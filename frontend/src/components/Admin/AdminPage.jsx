import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { tokenService } from '../../../api/tokenService';
import { useInitiatives, useReviewInitiative} from "../../hooks/useInitiatives.js";
import { useCreateSessionWithQueue} from "../../hooks/useSessions.js";
import styles from './AdminPage.module.css';

const AdminPage = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('moderation');
    const [sessionForm, setSessionForm] = useState({ title: '', heldAt: '', location: '', committeeId: '' });

    const { initiatives: pendingInitiatives, isLoading: loadPending } = useInitiatives({ status: 'PendingReview' });
    const reviewMutation = useReviewInitiative();
    const createSessionMutation = useCreateSessionWithQueue();

    const handleLogout = () => {
        tokenService.clearTokens();
        navigate('/login');
    };

    const handleReview = async (id, isApproved) => {
        try {
            await reviewMutation.mutateAsync({ id, isApproved });
        } catch (err) {
            console.error('Ошибка модерации:', err);
        }
    };

    const handleCreateSession = async (e) => {
        e.preventDefault();
        try {
            await createSessionMutation.mutateAsync({
                ...sessionForm,
                heldAt: new Date(sessionForm.heldAt).toISOString()
            });
            setSessionForm({ title: '', heldAt: '', location: '', committeeId: '' });
            alert('Заседание создано! Топ-3 инициативы добавлены в повестку.');
        } catch (err) {
            console.error('Ошибка создания заседания:', err);
            alert('Не удалось создать заседание. Проверьте данные.');
        }
    };

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <div className={styles.headerLeft}>
                    <Link to="/dashboard" className={styles.backBtn}>← На главную</Link>
                    <h1 className={styles.headerTitle}>Панель администратора</h1>
                </div>
                <button className={styles.logoutBtn} onClick={handleLogout}>Выйти</button>
            </header>

            <main className={styles.main}>
                <nav className={styles.tabs}>
                    <button className={`${styles.tab} ${activeTab === 'moderation' ? styles.tabActive : ''}`} onClick={() => setActiveTab('moderation')}>
                        Модерация инициатив ({pendingInitiatives.length})
                    </button>
                    <button className={`${styles.tab} ${activeTab === 'sessions' ? styles.tabActive : ''}`} onClick={() => setActiveTab('sessions')}>
                        Создание заседания
                    </button>
                </nav>

                {activeTab === 'moderation' && (
                    <section className={styles.section}>
                        <h2>Ожидают проверки</h2>
                        {loadPending ? (
                            <div className={styles.loading}>Загрузка...</div>
                        ) : pendingInitiatives.length === 0 ? (
                            <div className={styles.empty}>Все инициативы обработаны</div>
                        ) : (
                            <div className={styles.list}>
                                {pendingInitiatives.map(init => (
                                    <div key={init.id} className={styles.reviewCard}>
                                        <div className={styles.reviewInfo}>
                                            <h3>{init.title}</h3>
                                            <p>{init.description}</p>
                                            <span className={styles.meta}>Автор: {init.authorName} • {new Date(init.createdAt).toLocaleDateString('ru-RU')}</span>
                                        </div>
                                        <div className={styles.reviewActions}>
                                            <button className={styles.approveBtn} onClick={() => handleReview(init.id, true)}>✅ Одобрить</button>
                                            <button className={styles.rejectBtn} onClick={() => handleReview(init.id, false)}>❌ Отклонить</button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>
                )}

                {activeTab === 'sessions' && (
                    <section className={styles.section}>
                        <h2>Новое заседание с очередью</h2>
                        <p className={styles.hint}>При создании автоматически добавятся 3 самые старые одобренные инициативы.</p>
                        <form onSubmit={handleCreateSession} className={styles.sessionForm}>
                            <div className={styles.formGrid}>
                                <input type="text" placeholder="Название заседания" value={sessionForm.title} onChange={e => setSessionForm({...sessionForm, title: e.target.value})} required />
                                <input type="datetime-local" value={sessionForm.heldAt} onChange={e => setSessionForm({...sessionForm, heldAt: e.target.value})} required />
                                <input type="text" placeholder="Место проведения" value={sessionForm.location} onChange={e => setSessionForm({...sessionForm, location: e.target.value})} />
                                <input type="text" placeholder="ID Комиссии (GUID)" value={sessionForm.committeeId} onChange={e => setSessionForm({...sessionForm, committeeId: e.target.value})} required />
                            </div>
                            <button type="submit" className={styles.primaryBtn} disabled={createSessionMutation.isPending}>
                                {createSessionMutation.isPending ? 'Создание...' : '🚀 Создать и добавить топ-3 из очереди'}
                            </button>
                        </form>
                    </section>
                )}
            </main>
        </div>
    );
};

export default AdminPage;