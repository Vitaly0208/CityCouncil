// src/pages/Sessions/SessionDetailPage.jsx
import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useSessionDetails, useCastVote, useFinalizeSession } from '../../../hooks/useSessions';
import { getUserId, getUserRole } from '../../../utils/jwt';
import { tokenService } from "../../../../api/tokenService.js";
import Navbar from "../../Layout/NaVbar/NavBar.jsx";
import styles from './SessionDetailPage.module.css';

/**
 * @typedef {Object} Vote
 * @property {string} voterId
 * @property {'For'|'Against'|'Abstain'} type
 * @property {string} votedAt
 */

/**
 * @typedef {Object} VotingInfo
 * @property {string} id
 * @property {string} initiativeId
 * @property {string} initiativeTitle
 * @property {string} status
 * @property {boolean} isFinalized
 * @property {Vote[]} votes
 * @property {string} authorName
 * @property {string} description
 * @property {string} createdAt
 */

/**
 * @typedef {Object} SessionDetail
 * @property {string} id
 * @property {string} title
 * @property {string} heldAt
 * @property {string|null} location
 * @property {string} committeeName
 * @property {boolean} isCompleted
 * @property {VotingInfo[]} initiatives
 * @property {{id:string,name:string,role:string}[]} attendees
 */

const SessionDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [selectedInitiative, setSelectedInitiative] = useState(null);
    const [voteStatus, setVoteStatus] = useState(null); // 'loading' | 'success' | 'error' | null
    const [voteError, setVoteError] = useState('');

    const { data: session, isLoading, isError, error } = useSessionDetails(id);
    const castVote = useCastVote();
    const finalizeSession = useFinalizeSession();
    const userRole = getUserRole();
    const currentUserId = getUserId();

    const handleLogout = () => {
        tokenService.clearTokens();
        navigate('/login');
    };

    const handleVote = async (voteType) => {
        if (!selectedInitiative || session?.isCompleted) return;

        if (!confirm(`Вы действительно хотите проголосовать "${voteType === 0 ? 'ЗА' : 'ПРОТИВ'}"?`)) {
            return;
        }

        try {
            setVoteStatus('loading');
            setVoteError('');

            await castVote.mutateAsync({
                sessionId: id,
                initiativeId: selectedInitiative.id,
                voteType
            });

            setVoteStatus('success');
            setTimeout(() => setVoteStatus(null), 2500);
        } catch (err) {
            setVoteStatus('error');
            setVoteError(err.message || 'Не удалось отправить голос');
            setTimeout(() => { setVoteStatus(null); setVoteError(''); }, 4000);
        }
    };

    const handleFinalize = async () => {
        if (!confirm('⚠️ Завершить заседание и подвести итоги?\n\nЭто действие необратимо: все инициативы получат финальный статус.')) {
            return;
        }
        try {
            await finalizeSession.mutateAsync(id);
            alert('✅ Заседание завершено. Статусы инициатив обновлены.');
        } catch (err) {
            alert('❌ Ошибка завершения: ' + (err.message || 'Неизвестная ошибка'));
        }
    };

    // 🔹 Ранние возвраты для состояний загрузки/ошибки
    if (isLoading) {
        return (
            <>
                <Navbar onLogout={handleLogout} />
                <div className={styles.loading}>
                    <div className={styles.spinner} aria-live="polite">Загрузка заседания...</div>
                </div>
            </>
        );
    }

    if (isError || !session) {
        return (
            <>
                <Navbar onLogout={handleLogout} />
                <div className={styles.error} role="alert">
                    <h2>⚠️ Ошибка загрузки</h2>
                    <p>{error?.message || 'Не удалось получить данные заседания'}</p>
                    <Link to="/sessions" className={styles.retryLink}>← Вернуться к списку</Link>
                </div>
            </>
        );
    }

    // 🔹 Утилиты
    const formatDate = (isoString) => {
        if (!isoString) return '—';
        return new Date(isoString).toLocaleString('ru-RU', {
            day: '2-digit', month: 'long', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
    };

    const formatStatus = (status) => {
        const map = {
            'PendingReview': 'На проверке',
            'InQueue': 'В очереди',
            'InFirstHearing': 'Первое слушание',
            'Accepted': '✅ Принята',
            'Rejected': '❌ Отклонена'
        };
        return map[status] || status;
    };

    const hasVoted = (initiative) => {
        const votes = Array.isArray(initiative?.votes) ? initiative.votes : [];
        return votes.some(v => v?.voterId === currentUserId);
    };

    const getVoteCounts = (initiative) => {
        const votes = Array.isArray(initiative?.votes) ? initiative.votes : [];
        return {
            for: votes.filter(v => v?.type === 'For').length,
            against: votes.filter(v => v?.type === 'Against').length,
            total: votes.length
        };
    };

    return (
        <>
            <Navbar onLogout={handleLogout} />

            <div className={styles.container}>
                {/* === Шапка заседания === */}
                <header className={styles.sessionHeader} role="banner">
                    <Link to="/sessions" className={styles.backBtn} aria-label="Вернуться к списку заседаний">
                        ← Назад
                    </Link>

                    <div className={styles.headerContent}>
                        <div className={styles.headerTop}>
                            <h1 className={styles.sessionTitle} id="session-title">{session.title}</h1>

                            {userRole === 'Admin' && !session.isCompleted && (
                                <button
                                    className={styles.finalizeBtn}
                                    onClick={handleFinalize}
                                    disabled={finalizeSession.isPending}
                                    aria-busy={finalizeSession.isPending}
                                >
                                    {finalizeSession.isPending ? '⏳ Завершение...' : '🔒 Завершить заседание'}
                                </button>
                            )}
                        </div>

                        <div className={styles.sessionMeta} aria-label="Метаданные заседания">
                            <span>📅 {formatDate(session.heldAt)}</span>
                            <span>📍 {session.location || 'Не указано'}</span>
                            <span>🏛️ {session.committeeName}</span>
                            <span
                                className={`${styles.statusBadge} ${session.isCompleted ? styles.statusClosed : styles.statusOpen}`}
                                role="status"
                            >
                                {session.isCompleted ? 'Завершено' : 'Активно'}
                            </span>
                        </div>
                    </div>
                </header>

                {/* === Основной контент === */}
                <main className={styles.mainLayout}>

                    {/* 🔹 Левая колонка */}
                    <aside className={styles.sidebar} aria-label="Боковая панель">

                        {/* Присутствующие */}
                        <section className={styles.panel} aria-labelledby="attendees-title">
                            <h3 id="attendees-title" className={styles.panelTitle}>Присутствующие</h3>

                            {session.attendees?.length > 0 ? (
                                <ul className={styles.attendeesList} role="list">
                                    {session.attendees.map(a => (
                                        <li key={a?.id || a?.name} className={styles.attendeeItem}>
                                            <span className={styles.attendeeName}>{a?.name || 'Неизвестный'}</span>
                                            <span className={styles.attendeeRole}>{a?.role || ''}</span>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className={styles.emptyText} role="status">Список отсутствует</p>
                            )}
                        </section>

                        {/* Инициативы в повестке */}
                        <section className={styles.panel} aria-labelledby="initiatives-title">
                            <h3 id="initiatives-title" className={styles.panelTitle}>Инициативы в повестке</h3>

                            <div className={styles.initiativesList} role="listbox" aria-label="Список инициатив">
                                {session.initiatives?.length > 0 ? (
                                    session.initiatives.map(init => {
                                        const isSelected = selectedInitiative?.id === init?.id;
                                        const voted = hasVoted(init);

                                        return (
                                            <button
                                                key={init?.id}
                                                className={`${styles.initiativeRow} ${isSelected ? styles.selected : ''} ${session.isCompleted ? styles.disabled : ''}`}
                                                onClick={() => { setSelectedInitiative(init); setVoteStatus(null); setVoteError(''); }}
                                                disabled={session.isCompleted}
                                                role="option"
                                                aria-selected={isSelected}
                                                aria-disabled={session.isCompleted}
                                            >
                                                <span className={styles.initiativeTitle}>{init?.initiativeTitle || init?.title || 'Без названия'}</span>
                                                {voted && <span className={styles.votedBadge} aria-label="Вы уже проголосовали">✓</span>}
                                            </button>
                                        );
                                    })
                                ) : (
                                    <p className={styles.emptyText}>В повестке нет инициатив</p>
                                        )}
                                    </div>
                                    </section>
                                    </aside>

                                {/* 🔹 Правая колонка: Детали + Голосование */}
                                <section className={styles.detailPanel} aria-label="Детали инициативы">

                                    {!selectedInitiative ? (
                                        <div className={styles.placeholder} role="status">
                                            <p>👈 Выберите инициативу из списка слева</p>
                                            <p className={styles.placeholderHint}>для просмотра деталей и голосования</p>
                                        </div>
                                    ) : (
                                        <>
                                            {/* Детали инициативы */}
                                            <article className={styles.initiativeDetail} aria-labelledby="initiative-title">
                                                <h2 id="initiative-title" className={styles.detailTitle}>
                                                    {selectedInitiative.initiativeTitle || selectedInitiative.title}
                                                </h2>

                                                <div className={styles.detailMeta} aria-label="Метаданные инициативы">
                                                    <span>👤 {selectedInitiative.authorName || 'Неизвестный автор'}</span>
                                                    <span>📅 {formatDate(selectedInitiative.createdAt)}</span>
                                                    <span className={`${styles.statusBadge} ${styles.badgeStatus}`}>
                                            {formatStatus(selectedInitiative.status)}
                                        </span>
                                                </div>

                                                <p className={styles.detailDescription}>
                                                    {selectedInitiative.description || 'Описание отсутствует'}
                                                </p>
                                            </article>

                                            {/* Панель голосования (только если сессия активна) */}
                                            {!session.isCompleted && (
                                                <div className={styles.votingPanel} role="region" aria-label="Панель голосования">
                                                    <h3 className={styles.votingTitle}>Ваш голос</h3>

                                                    {hasVoted(selectedInitiative) ? (
                                                        <div className={styles.alreadyVoted} role="status" aria-live="polite">
                                                            ✅ Вы уже проголосовали по этой инициативе
                                                        </div>
                                                    ) : (
                                                        <div className={styles.voteButtons} role="group" aria-label="Выберите вариант голосования">
                                                            <button
                                                                className={`${styles.voteBtn} ${styles.voteFor}`}
                                                                onClick={() => handleVote(0)}
                                                                disabled={castVote.isPending || voteStatus === 'loading'}
                                                                aria-busy={voteStatus === 'loading'}
                                                            >
                                                                ✅ За
                                                            </button>
                                                            <button
                                                                className={`${styles.voteBtn} ${styles.voteAgainst}`}
                                                                onClick={() => handleVote(1)}
                                                                disabled={castVote.isPending || voteStatus === 'loading'}
                                                                aria-busy={voteStatus === 'loading'}
                                                            >
                                                                ❌ Против
                                                            </button>
                                                        </div>
                                                    )}

                                                    {/* Сообщения о статусе голосования */}
                                                    {voteStatus === 'success' && (
                                                        <div className={styles.toastSuccess} role="status" aria-live="polite">
                                                            🎉 Голос успешно принят!
                                                        </div>
                                                    )}
                                                    {voteStatus === 'error' && (
                                                        <div className={styles.toastError} role="alert" aria-live="assertive">
                                                            ❌ {voteError || 'Ошибка голосования. Попробуйте позже.'}
                                                        </div>
                                                    )}
                                                </div>
                                            )}

                                            {/* Результаты голосования (видны всегда) */}
                                            <div className={styles.resultsPanel} role="region" aria-label="Результаты голосования">
                                                <h3 className={styles.resultsTitle}>Текущие результаты</h3>

                                                {(() => {
                                                    const { for: forCount, against: againstCount, total } = getVoteCounts(selectedInitiative);

                                                    return (
                                                        <div className={styles.resultsGrid}>
                                                            <div className={styles.resultItem}>
                                                                <span className={styles.resultCount}>{forCount}</span>
                                                                <span className={styles.resultLabel}>✅ За</span>
                                                            </div>
                                                            <div className={styles.resultItem}>
                                                                <span className={styles.resultCount}>{againstCount}</span>
                                                                <span className={styles.resultLabel}>❌ Против</span>
                                                            </div>
                                                            <div className={styles.resultItem}>
                                                                <span className={styles.resultCount}>{total}</span>
                                                                <span className={styles.resultLabel}>📊 Всего</span>
                                                            </div>
                                                        </div>
                                                    );
                                                })()}
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