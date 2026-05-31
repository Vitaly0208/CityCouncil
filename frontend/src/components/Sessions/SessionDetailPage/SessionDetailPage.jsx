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
    const currentUserId = getUserId();
    const userRole = getUserRole();
    const isAdmin = userRole === 'Admin';

    const [selectedInitiative, setSelectedInitiative] = useState(null);
    const [voteError, setVoteError] = useState('');

    const { data: session, isLoading, isError, error } = useSessionDetails(id);
    const castVote = useCastVote();
    const finalizeSession = useFinalizeSession();

    const handleLogout = () => {
        tokenService.clearTokens();
        navigate('/login');
    };

    const handleVote = async (voteType) => {
        if (!selectedInitiative || session?.isCompleted) return;
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
            const result = await finalizeSession.mutateAsync(id);
            if (result?.nextSessionId) {
                alert('Заседание завершено. Переход ко второму слушанию...');
                navigate(`/sessions/${result.nextSessionId}`);
            } else {
                alert('Заседание завершено');
            }
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

    const isAttendee = session?.attendees?.some(a => a.id === currentUserId);

    const formatDate = (isoString) => {
        if (!isoString) return '—';
        return new Date(isoString).toLocaleString('ru-RU', {
            day: '2-digit', month: 'long', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
    };

    const formatShortDate = (isoString) => {
        if (!isoString) return '—';
        return new Date(isoString).toLocaleDateString('ru-RU', {
            day: 'numeric', month: 'long', year: 'numeric'
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
                        <div>
                            <h1 className={styles.title}>{session.title}</h1>
                            <span className={styles.hearingBadge}>
                                {session.hearingRound <= 1 ? 'Первое слушание' : 'Второе слушание'}
                            </span>
                        </div>
                        {isAdmin && !session.isCompleted && (
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
                            <Link to={`/committees/${session.committeeId}`} className={styles.infoValueLink}>
                                {session.committeeName}
                            </Link>
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
                    <aside className={styles.leftColumn}>
                        <h2 className={styles.columnTitle}>Повестка</h2>
                        <div className={styles.initiativesList}>
                            {session.initiatives?.map((init) => (
                                <button
                                    key={init.id}
                                    className={`${styles.initiativeCard} ${selectedInitiative?.id === init.id ? styles.selected : ''}`}
                                    onClick={() => setSelectedInitiative(init)}
                                >
                                    <h3 className={styles.initiativeName}>{init.initiativeTitle}</h3>
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
                                <h2 className={styles.detailTitle}>{selectedInitiative.initiativeTitle}</h2>

                                <div className={styles.detailMeta}>
                                    <div className={styles.metaItem}>
                                        <strong>Автор:</strong> {selectedInitiative.initiativeAuthor || 'Не указан'}
                                    </div>
                                    <div className={styles.metaItem}>
                                        <strong>Дата создания:</strong> {formatShortDate(selectedInitiative.initiativeCreatedAt)}
                                    </div>
                                    <div className={styles.metaItem}>
                                        <strong>Статус:</strong> {selectedInitiative.status === 2 ? 'На первом слушании' : selectedInitiative.status}
                                    </div>
                                </div>

                                <div className={styles.descriptionBlock}>
                                    <h3>Описание</h3>
                                    <p>{selectedInitiative.initiativeDescription || 'Описание не предоставлено'}</p>
                                </div>

                                {!session.isCompleted && isAttendee ? (
                                    <div className={styles.votingSection}>
                                        <h3>Голосование</h3>
                                        {hasVoted(selectedInitiative) ? (
                                            <div className={styles.alreadyVoted}>Вы уже проголосовали</div>
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
                                        {voteError && <div className={styles.error}>{voteError}</div>}
                                    </div>
                                ) : (
                                    !session.isCompleted && (
                                        <div className={styles.notJoinedNotice}>
                                            Вы не участвуете в этом заседании. Голосование недоступно.
                                        </div>
                                    )
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
                            Участники заседания ({session.attendees?.length || 0})
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
        </>
    );
};

export default SessionDetailPage;