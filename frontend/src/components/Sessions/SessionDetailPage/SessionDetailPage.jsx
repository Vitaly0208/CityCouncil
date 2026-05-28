import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useSessionDetails, useCastVote, useFinalizeSession, useJoinSession } from '../../../hooks/useSessions';
import { getUserId, getUserRole } from '../../../utils/jwt';
import { tokenService } from "../../../../api/tokenService.js";
import Navbar from "../../Layout/NaVbar/NavBar.jsx";
import styles from './SessionDetailPage.module.css';

const SessionDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [selectedInitiative, setSelectedInitiative] = useState(null);
    const [showJoinModal, setShowJoinModal] = useState(true);
    const [isJoined, setIsJoined] = useState(false);
    const [voteError, setVoteError] = useState('');

    const { data: session, isLoading, isError, error } = useSessionDetails(id);
    const castVote = useCastVote();
    const finalizeSession = useFinalizeSession();
    const joinSession = useJoinSession();

    const userRole = getUserRole();
    const currentUserId = getUserId();

    const handleLogout = () => {
        tokenService.clearTokens();
        navigate('/login');
    };

    const handleJoin = async () => {
        try {
            await joinSession.mutateAsync(id);
            setIsJoined(true);
            setShowJoinModal(false);
        } catch (err) {
            alert('Ошибка присоединения: ' + err.message);
        }
    };

    const handleVote = async (voteType) => {
        if (!selectedInitiative || session?.isCompleted || !isJoined) return;

        try {
            setVoteError('');
            await castVote.mutateAsync({
                sessionId: id,
                initiativeId: selectedInitiative.initiativeId,
                voteType
            });
        } catch (err) {
            setVoteError(err.message || 'Не удалось отправить голос');
            setTimeout(() => setVoteError(''), 4000);
        }
    };

    const handleFinalize = async () => {
        if (!confirm('Завершить заседание? Это действие необратимо.')) return;

        try {
            await finalizeSession.mutateAsync(id);
            alert('Заседание завершено');
        } catch (err) {
            alert('Ошибка: ' + err.message);
        }
    };

    const getVoteCounts = (initiative) => {
        const votes = Array.isArray(initiative?.votes) ? initiative.votes : [];

        return {
            for: votes.filter(v => v?.voteType === 'For' || v?.voteType === 0).length,
            against: votes.filter(v => v?.voteType === 'Against' || v?.voteType === 1).length,
            total: votes.length
        };
    };

    const hasVoted = (initiative) => {
        const votes = Array.isArray(initiative?.votes) ? initiative.votes : [];
        return votes.some(v => v?.voterId === currentUserId);
    };

    const formatDate = (isoString) => {
        if (!isoString) return '—';
        return new Date(isoString).toLocaleString('ru-RU', {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (isLoading) {
        return (
            <>
                <Navbar onLogout={handleLogout} />
                <div className={styles.loading}>Загрузка...</div>
            </>
        );
    }

    if (isError || !session) {
        return (
            <>
                <Navbar onLogout={handleLogout} />
                <div className={styles.error}>
                    <h2>Ошибка загрузки</h2>
                    <p>{error?.message || 'Не удалось загрузить заседание'}</p>
                    <Link to="/sessions">Назад к списку</Link>
                </div>
            </>
        );
    }

    return (
        <>
            <Navbar onLogout={handleLogout} />

            <div className={styles.container}>
                <header className={styles.header}>
                    <div className={styles.headerTop}>
                        <h1 className={styles.title}>{session.title}</h1>

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

                    <div className={styles.headerInfo}>
                        <div className={styles.infoItem}>
                            <span className={styles.infoLabel}>Дата:</span>
                            <span className={styles.infoValue}>{formatDate(session.heldAt)}</span>
                        </div>
                        <div className={styles.infoItem}>
                            <span className={styles.infoLabel}>Место:</span>
                            <span className={styles.infoValue}>{session.location || 'Не указано'}</span>
                        </div>
                        <div className={styles.infoItem}>
                            <span className={styles.infoLabel}>Комиссия:</span>
                            <span className={styles.infoValue}>{session.committeeName}</span>
                        </div>
                        <div className={styles.infoItem}>
                            <span className={styles.infoLabel}>Статус:</span>
                            <span className={`${styles.status} ${session.isCompleted ? styles.completed : styles.active}`}>
                                {session.isCompleted ? 'Завершено' : 'Активно'}
                            </span>
                        </div>
                    </div>
                </header>

                <main className={styles.main}>
                    {/* Левая колонка - Инициативы */}
                    <aside className={styles.leftColumn}>
                        <h2 className={styles.columnTitle}>Повестка</h2>
                        <div className={styles.initiativesList}>
                            {session.initiatives?.map((init) => (
                                <button
                                    key={init.id}
                                    className={`${styles.initiativeCard} ${selectedInitiative?.id === init.id ? styles.selected : ''}`}
                                    onClick={() => setSelectedInitiative(init)}
                                >
                                    <h3 className={styles.initiativeName}>
                                        {init.initiativeTitle || init.title}
                                    </h3>
                                    <span className={styles.initiativeStatus}>{init.status}</span>
                                </button>
                            ))}
                        </div>
                    </aside>

                    <section className={styles.centerColumn}>
                        {!selectedInitiative ? (
                            <div className={styles.placeholder}>
                                Выберите инициативу из списка слева
                            </div>
                        ) : (
                            <div className={styles.initiativeDetail}>
                                <h2 className={styles.detailTitle}>
                                    {selectedInitiative.initiativeTitle || selectedInitiative.title}
                                </h2>

                                <div className={styles.detailMeta}>
                                    <div className={styles.metaItem}>
                                        <strong>Автор:</strong> {selectedInitiative.authorName || 'Неизвестный'}
                                    </div>
                                    <div className={styles.metaItem}>
                                        <strong>Дата создания:</strong> {formatDate(selectedInitiative.createdAt)}
                                    </div>
                                    <div className={styles.metaItem}>
                                        <strong>Статус:</strong> {selectedInitiative.status}
                                    </div>
                                </div>

                                <div className={styles.description}>
                                    <h3>Описание</h3>
                                    <p>{selectedInitiative.description || 'Описание отсутствует'}</p>
                                </div>

                                {!session.isCompleted && isJoined && (
                                    <div className={styles.votingSection}>
                                        <h3>Голосование</h3>

                                        {hasVoted(selectedInitiative) ? (
                                            <div className={styles.alreadyVoted}>
                                                Вы уже проголосовали
                                            </div>
                                        ) : (
                                            <div className={styles.voteButtons}>
                                                <button
                                                    className={styles.voteFor}
                                                    onClick={() => handleVote(0)}
                                                    disabled={castVote.isPending}
                                                >
                                                    За
                                                </button>
                                                <button
                                                    className={styles.voteAgainst}
                                                    onClick={() => handleVote(1)}
                                                    disabled={castVote.isPending}
                                                >
                                                    Против
                                                </button>
                                            </div>
                                        )}

                                        {voteError && (
                                            <div className={styles.error}>{voteError}</div>
                                        )}
                                    </div>
                                )}


                                <div className={styles.resultsSection}>
                                    <h3>Результаты голосования</h3>
                                    {(() => {
                                        const { for: forCount, against: againstCount, total } = getVoteCounts(selectedInitiative);

                                        return (
                                            <div className={styles.results}>
                                                <div className={styles.resultItem}>
                                                    <span className={styles.resultValue}>{forCount}</span>
                                                    <span className={styles.resultLabel}>За</span>
                                                </div>
                                                <div className={styles.resultItem}>
                                                    <span className={styles.resultValue}>{againstCount}</span>
                                                    <span className={styles.resultLabel}>Против</span>
                                                </div>
                                                <div className={styles.resultItem}>
                                                    <span className={styles.resultValue}>{total}</span>
                                                    <span className={styles.resultLabel}>Всего</span>
                                                </div>
                                            </div>
                                        );
                                    })()}
                                </div>
                            </div>
                        )}
                    </section>

                    <aside className={styles.rightColumn}>
                        <h2 className={styles.columnTitle}>
                            Присутствующие ({session.attendees?.length || 0})
                        </h2>
                        <div className={styles.attendeesList}>
                            {session.attendees?.map((attendee) => (
                                <div
                                    key={attendee.id}
                                    className={`${styles.attendee} ${attendee.id === currentUserId ? styles.current : ''}`}
                                >
                                    <div className={styles.attendeeName}>{attendee.name}</div>
                                    <div className={styles.attendeeRole}>{attendee.role}</div>
                                </div>
                            ))}
                        </div>
                    </aside>
                </main>
            </div>

            {showJoinModal && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modal}>
                        <h2 className={styles.modalTitle}>Присоединиться к заседанию?</h2>
                        <p className={styles.modalText}>
                            Вы собираетесь присоединиться к заседанию <strong>{session.title}</strong>
                        </p>
                        <div className={styles.modalActions}>
                            <button
                                className={styles.cancelBtn}
                                onClick={() => navigate('/sessions')}
                            >
                                Отмена
                            </button>
                            <button
                                className={styles.joinBtn}
                                onClick={handleJoin}
                                disabled={joinSession.isPending}
                            >
                                {joinSession.isPending ? 'Присоединение...' : 'Присоединиться'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default SessionDetailPage;