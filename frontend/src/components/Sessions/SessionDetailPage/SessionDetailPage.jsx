// src/pages/Sessions/SessionDetailPage.jsx
import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useSessionDetails, useCastVote, useFinalizeSession } from '../../../hooks/useSessions';
import { getUserId, getUserRole } from '../../../utils/jwt';
import { tokenService } from "../../../../api/tokenService.js";
import Navbar from "../../Layout/NaVbar/NavBar.jsx";
import styles from './SessionDetailPage.module.css';

const SessionDetailPage = () => {
    const { id } = useParams();

    const navigate = useNavigate();
    const [selectedInitiative, setSelectedInitiative] = useState(null);
    const [voteStatus, setVoteStatus] = useState(null);

    const { data: session, isLoading, isError } = useSessionDetails(id);
    const castVote = useCastVote();
    const finalizeSession = useFinalizeSession();
    const userRole = getUserRole();

    const handleLogout = () => {
        tokenService.clearTokens();
        navigate('/login');
    };

    const handleVote = async (voteType) => {
        if (!selectedInitiative || session?.isCompleted) return;
        try {
            setVoteStatus('loading');
            await castVote.mutateAsync({
                sessionId: id,
                initiativeId: selectedInitiative.id,
                voteType
            });
            setVoteStatus('success');
            setTimeout(() => setVoteStatus(null), 2000);
        } catch {
            setVoteStatus('error');
        }
    };

    const handleFinalize = async () => {
        if (!confirm('Завершить заседание и подвести итоги? Это действие необратимо.')) return;
        try {
            await finalizeSession.mutateAsync(id);
            alert('Заседание завершено. Статусы инициатив обновлены.');
        } catch (err) {
            alert('Ошибка завершения: ' + err.message);
        }
    };

    if (isLoading) return <><Navbar onLogout={handleLogout}/><div className={styles.loading}>Загрузка...</div></>;
    if (isError || !session) return <><Navbar onLogout={handleLogout}/><div className={styles.error}>Заседание не найдено</div></>;

    const formatDate = (d) => new Date(d).toLocaleString('ru-RU');
    const currentUserId = getUserId();

    const hasVoted = (init) => {
        const votes = Array.isArray(init?.votes) ? init.votes : [];
        return votes.some(v => v.voterId === currentUserId);
    };

    return (
        <>
            <Navbar onLogout={handleLogout} />
            <div className={styles.container}>
                <header className={styles.sessionHeader}>
                    <Link to="/sessions" className={styles.backBtn}>← Назад к списку</Link>
                    <div className={styles.headerContent}>
                        <div className={styles.headerTop}>
                            <h1 className={styles.sessionTitle}>{session.title}</h1>
                            {userRole === 'Admin' && !session.isCompleted && (
                                <button
                                    className={styles.finalizeBtn}
                                    onClick={handleFinalize}
                                    disabled={finalizeSession.isPending}
                                >
                                    {finalizeSession.isPending ? 'Завершение...' : 'Завершить заседание'}
                                </button>
                            )}
                        </div>
                        <div className={styles.sessionMeta}>
                            <span>📅 {formatDate(session.heldAt)}</span>
                            <span> {session.location || 'Не указано'}</span>
                            <span>🏛️ {session.committeeName}</span>
                            <span className={`${styles.statusBadge} ${session.isCompleted ? styles.statusClosed : styles.statusOpen}`}>
                                {session.isCompleted ? 'Завершено' : 'Активно'}
                            </span>
                        </div>
                    </div>
                </header>

                <main className={styles.mainLayout}>
                    {/* Левая колонка: Присутствующие + Список инициатив */}
                    <aside className={styles.sidebar}>
                        <section className={styles.panel}>
                            <h3 className={styles.panelTitle}>Присутствующие</h3>
                            <ul className={styles.attendeesList}>
                                {session.attendees?.length > 0 ? (
                                    session.attendees.map(a => (
                                        <li key={a.id} className={styles.attendeeItem}>
                                            <span className={styles.attendeeName}>{a.name}</span>
                                            <span className={styles.attendeeRole}>{a.role}</span>
                                        </li>
                                    ))
                                ) : (
                                    <li className={styles.emptyText}>Список отсутствует</li>
                                )}
                            </ul>
                        </section>

                        <section className={styles.panel}>
                            <h3 className={styles.panelTitle}>Инициативы в повестке</h3>
                            <div className={styles.initiativesList}>
                                {session.initiatives?.map(init => (
                                    <button
                                        key={init.id}
                                        className={`${styles.initiativeRow} ${selectedInitiative?.id === init.id ? styles.selected : ''}`}
                                        onClick={() => { setSelectedInitiative(init); setVoteStatus(null); }}
                                        disabled={session.isCompleted}
                                    >
                                        <span className={styles.initiativeTitle}>{init.title}</span>
                                        {hasVoted(init) && <span className={styles.votedBadge}>Голос принят</span>}
                                    </button>
                                ))}
                            </div>
                        </section>
                    </aside>

                    {/* Правая колонка: Детали и голосование */}
                    <section className={styles.detailPanel}>
                        {!selectedInitiative ? (
                            <div className={styles.placeholder}>Выберите инициативу из списка слева для просмотра деталей и голосования</div>
                        ) : (
                            <>
                                <div className={styles.initiativeDetail}>
                                    <h2 className={styles.detailTitle}>{selectedInitiative.title}</h2>
                                    <div className={styles.detailMeta}>
                                        <span>👤 {selectedInitiative.authorName}</span>
                                        <span>📅 {formatDate(selectedInitiative.createdAt)}</span>
                                        <span className={styles.statusBadge}>
                                            {selectedInitiative.status === 'InFirstHearing' ? 'Первое слушание' : selectedInitiative.status}
                                        </span>
                                    </div>
                                    <p className={styles.detailDescription}>{selectedInitiative.description}</p>
                                </div>

                                {/* Панель голосования */}
                                {!session.isCompleted && (
                                    <div className={styles.votingPanel}>
                                        <h3 className={styles.votingTitle}>Ваш голос</h3>
                                        {hasVoted(selectedInitiative) ? (
                                            <div className={styles.alreadyVoted}>Вы уже проголосовали по этой инициативе</div>
                                        ) : (
                                            <div className={styles.voteButtons}>
                                                <button
                                                    className={`${styles.voteBtn} ${styles.voteFor}`}
                                                    onClick={() => handleVote('For')}
                                                    disabled={castVote.isPending || voteStatus === 'loading'}
                                                >
                                                    ✅ За
                                                </button>
                                                <button
                                                    className={`${styles.voteBtn} ${styles.voteAgainst}`}
                                                    onClick={() => handleVote('Against')}
                                                    disabled={castVote.isPending || voteStatus === 'loading'}
                                                >
                                                    ❌ Против
                                                </button>
                                            </div>
                                        )}
                                        {voteStatus === 'success' && <div className={styles.toastSuccess}>Голос успешно принят!</div>}
                                        {voteStatus === 'error' && <div className={styles.toastError}>Ошибка голосования. Попробуйте позже.</div>}
                                    </div>
                                )}

                                {/* ✅ Результаты — с безопасной фильтрацией */}
                                <div className={styles.resultsPanel}>
                                    <h3 className={styles.resultsTitle}>Текущие результаты</h3>
                                    <div className={styles.resultsGrid}>
                                        {(() => {
                                            // 👇 Вычисляем ТОЛЬКО когда selectedInitiative есть
                                            const votes = Array.isArray(selectedInitiative.votes) ? selectedInitiative.votes : [];
                                            const forCount = votes.filter(v => v.type === 'For').length;
                                            const againstCount = votes.filter(v => v.type === 'Against').length;
                                            const total = votes.length;

                                            return (
                                                <>
                                                    <div className={styles.resultItem}>
                                                        <span className={styles.resultCount}>{forCount}</span>
                                                        <span className={styles.resultLabel}>За</span>
                                                    </div>
                                                    <div className={styles.resultItem}>
                                                        <span className={styles.resultCount}>{againstCount}</span>
                                                        <span className={styles.resultLabel}>Против</span>
                                                    </div>
                                                    <div className={styles.resultItem}>
                                                        <span className={styles.resultCount}>{total}</span>
                                                        <span className={styles.resultLabel}>Всего</span>
                                                    </div>
                                                </>
                                            );
                                        })()}
                                    </div>
                                </div>
                            </>
                        )}
                    </section>
                </main>
            </div>
        </>
    );
};

export default SessionDetailPage;