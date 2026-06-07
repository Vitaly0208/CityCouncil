import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSessions, useJoinSession } from '../../../hooks/useSessions.js';
import { useUserProfile } from '../../../hooks/useUserProfile.js';
import { getUserRole } from '../../../utils/jwt.js';
import { tokenService } from "../../../../api/tokenService.js";
import Navbar from "../../../components/Layout/NaVbar/NavBar.jsx";
import styles from './SessionsPage.module.css';

const SESSION_IMAGE_URL = '/session2.png';

const SessionsPage = () => {
    const navigate = useNavigate();
    const isAuth = tokenService.isAuthenticated();
    const userRole = getUserRole() || 'Guest';
    const isAdmin = userRole === 'Admin';

    const { data: sessions, isLoading: loadSessions, isError, error } = useSessions();
    const { profile, isLoading: loadProfile } = useUserProfile();
    const joinSession = useJoinSession();

    const [joiningSessionId, setJoiningSessionId] = useState(null);
    const [joinedSessionIds, setJoinedSessionIds] = useState(new Set());
    const [showCompleted, setShowCompleted] = useState(false);

    const handleLogout = () => {
        tokenService.clearTokens();
        navigate('/login');
    };

    const formatDateTime = (dateStr) => {
        if (!dateStr) return null;
        const d = new Date(dateStr);
        return {
            date: d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' }),
            time: d.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
        };
    };

    const filteredSessions = useMemo(() => {
        if (!sessions) return [];

        let result = [...sessions];

        // Если пользователь не админ, показываем только заседания его комиссий
        if (!isAdmin) {
            const commissions = profile?.commissions || profile?.Commissions || [];
            const userCommitteeIds = new Set(
                commissions
                    .filter(m => !m.dismissedAt && !m.DismissedAt)
                    .map(m => m.committeeId || m.CommitteeId)
                    .filter(Boolean)
            );

            result = result.filter(s => {
                const cid = s.committeeId || s.CommitteeId;
                return userCommitteeIds.has(cid);
            });
        }

        if (!showCompleted) {
            result = result.filter(s => !s.isCompleted);
        }

        result.sort((a, b) => new Date(b.heldAt) - new Date(a.heldAt));

        return result;
    }, [sessions, profile, isAdmin, showCompleted]);

    const isLoading = loadSessions || (!isAdmin && loadProfile);

    const handleCardClick = (session) => {
        if (session.isCompleted) {
            navigate(`/sessions/${session.id}/protocol`);
        } else if (joinedSessionIds.has(session.id)) {
            navigate(`/sessions/${session.id}`);
        } else {
            setJoiningSessionId(session.id);
        }
    };

    const handleConfirmJoin = async () => {
        if (!joiningSessionId) return;
        try {
            await joinSession.mutateAsync(joiningSessionId);
            setJoinedSessionIds(prev => new Set([...prev, joiningSessionId]));
            navigate(`/sessions/${joiningSessionId}`);
        } catch (err) {
            const message = err.response?.data?.error || err.message || 'Ошибка присоединения';
            alert(message);
        }
    };

    const joiningSession = sessions?.find(s => s.id === joiningSessionId);

    const completedCount = useMemo(() =>
            sessions?.filter(s => {
                if (!isAdmin) {
                    const commissions = profile?.commissions || profile?.Commissions || [];
                    const userCommitteeIds = new Set(
                        commissions
                            .filter(m => !m.dismissedAt && !m.DismissedAt)
                            .map(m => m.committeeId || m.CommitteeId)
                            .filter(Boolean)
                    );
                    const cid = s.committeeId || s.CommitteeId;
                    return userCommitteeIds.has(cid) && s.isCompleted;
                }
                return s.isCompleted;
            }).length || 0
        , [sessions, profile, isAdmin]);

    if (!isAuth) {
        return (
            <>
                <Navbar onLogout={handleLogout} />
                <div className={styles.container}>
                    <header className={styles.pageHeader}>
                        <h1 className={styles.pageTitle}>Заседания</h1>
                    </header>
                    <div className={styles.empty}>
                        <p style={{ fontSize: '1.1rem', marginBottom: '1.5rem' }}>
                            Для просмотра расписания и протоколов заседаний необходимо авторизоваться.
                        </p>
                        <button
                            className={styles.primaryBtn}
                            onClick={() => navigate('/login')}
                        >
                            Войти в систему
                        </button>
                    </div>
                </div>
            </>
        );
    }

    if (isLoading) {
        return (
            <>
                <Navbar onLogout={handleLogout} />
                <div className={styles.container}>
                    <div className={styles.loading}>Загрузка расписания...</div>
                </div>
            </>
        );
    }

    if (isError) {
        return (
            <>
                <Navbar onLogout={handleLogout} />
                <div className={styles.container}>
                    <div className={styles.error}>
                        Не удалось загрузить заседания: {error?.message}
                    </div>
                </div>
            </>
        );
    }

    return (
        <>
            <Navbar onLogout={handleLogout} />
            <div className={styles.container}>
                <header className={styles.pageHeader}>
                    <div>
                        <h1 className={styles.pageTitle}>Заседания</h1>
                        <p className={styles.pageSubtitle}>
                            {isAdmin ? 'Все заседания городских комиссий' : 'Заседания ваших комиссий'}
                        </p>
                    </div>

                    {completedCount > 0 && (
                        <button
                            className={styles.toggleCompletedBtn}
                            onClick={() => setShowCompleted(!showCompleted)}
                        >
                            {showCompleted ? 'Скрыть завершённые' : `Показать завершённые (${completedCount})`}
                        </button>
                    )}
                </header>

                <div className={styles.grid}>
                    {filteredSessions.length > 0 ? (
                        filteredSessions.map(s => {
                            const dt = formatDateTime(s.heldAt);
                            const isJoined = joinedSessionIds.has(s.id);
                            const isCompleted = s.isCompleted;

                            return (
                                <div
                                    key={s.id}
                                    className={`${styles.card} ${isJoined ? styles.cardJoined : ''} ${isCompleted ? styles.cardCompleted : ''}`}
                                    onClick={() => handleCardClick(s)}
                                    style={{ cursor: 'pointer' }}
                                >
                                    <div className={styles.cardTop}>
                                        <div className={styles.dateBlock}>
                                            <span className={styles.day}>{dt?.date}</span>
                                            <span className={styles.time}>{dt?.time}</span>
                                        </div>
                                        <span className={`${styles.status} ${isCompleted ? styles.completed : styles.active}`}>
                                            {isCompleted ? 'Завершено' : 'Активно'}
                                        </span>
                                    </div>

                                    <div className={styles.cardImageWrapper}>
                                        <img src={SESSION_IMAGE_URL} alt="Заседание" className={styles.cardImage} />
                                    </div>

                                    <div className={styles.cardBody}>
                                        <h2 className={styles.title}>{s.title}</h2>
                                        <span className={styles.committee}>{s.committeeName}</span>
                                    </div>

                                    <div className={styles.cardFooter}>
                                        <span className={styles.agendaBtn}>
                                            {isCompleted ? 'Просмотреть протокол' : (isJoined ? 'Перейти к повестке' : 'Присоединиться')}
                                        </span>
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <div className={styles.empty}>
                            {showCompleted
                                ? 'Заседаний не найдено'
                                : (isAdmin ? 'Активных заседаний пока нет' : 'У вас нет активных заседаний в ваших комиссиях')}
                        </div>
                    )}
                </div>
            </div>

            {joiningSession && (
                <div className={styles.modalOverlay} onClick={() => setJoiningSessionId(null)}>
                    <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                        <h2 className={styles.modalTitle}>Присоединиться к заседанию?</h2>
                        <p className={styles.modalText}>
                            <strong>{joiningSession.title}</strong><br/>
                            {joiningSession.committeeName} • {formatDateTime(joiningSession.heldAt)?.date} в {formatDateTime(joiningSession.heldAt)?.time}
                        </p>
                        <div className={styles.modalActions}>
                            <button
                                className={styles.cancelBtn}
                                onClick={() => setJoiningSessionId(null)}
                            >
                                Отмена
                            </button>
                            <button
                                className={styles.joinBtn}
                                onClick={handleConfirmJoin}
                                disabled={joinSession.isPending}
                            >
                                {joinSession.isPending ? 'Присоединение...' : 'Подтвердить'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default SessionsPage;