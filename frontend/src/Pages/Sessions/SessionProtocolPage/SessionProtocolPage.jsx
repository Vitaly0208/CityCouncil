import { useParams, useNavigate, Link } from 'react-router-dom';
import { useSessionProtocol } from '../../../hooks/useSessions.js';
import { tokenService } from "../../../../api/tokenService.js";
import Navbar from "../../../components/Layout/NaVbar/NavBar.jsx";
import styles from './SessionProtocolPage.module.css';

const SessionProtocolPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const { data: protocol, isLoading, isError, error } = useSessionProtocol(id);

    const handleLogout = () => {
        tokenService.clearTokens();
        navigate('/login');
    };

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

    const getStatusBadge = (status) => {
        const map = {
            4: { text: 'Принята', class: styles.statusAccepted },
            5: { text: 'Отклонена', class: styles.statusRejected },
            'Accepted': { text: 'Принята', class: styles.statusAccepted },
            'Rejected': { text: 'Отклонена', class: styles.statusRejected },
            2: { text: '1-е слушание', class: styles.statusPending },
            3: { text: '2-е слушание', class: styles.statusPending },
            'InFirstHearing': { text: '1-е слушание', class: styles.statusPending },
            'InSecondHearing': { text: '2-е слушание', class: styles.statusPending },
        };
        const s = map[status] || { text: status, class: '' };
        return <span className={`${styles.statusBadge} ${s.class}`}>{s.text}</span>;
    };

    if (isLoading) {
        return (
            <>
                <Navbar onLogout={handleLogout} />
                <div className={styles.container}>
                    <div className={styles.loading}>Загрузка протокола...</div>
                </div>
            </>
        );
    }

    if (isError || !protocol) {
        return (
            <>
                <Navbar onLogout={handleLogout} />
                <div className={styles.container}>
                    <div className={styles.error}>
                        <h2>Ошибка загрузки</h2>
                        <p>{error?.message || 'Не удалось загрузить протокол'}</p>
                        <Link to="/sessions">Назад к списку</Link>
                    </div>
                </div>
            </>
        );
    }

    return (
        <>
            <Navbar onLogout={handleLogout} />
            <div className={styles.container}>
                <header className={styles.header}>
                    <div>
                        <h1 className={styles.title}>Протокол заседания</h1>
                    </div>
                </header>

                <section className={styles.infoCard}>
                    <div className={styles.infoGrid}>
                        <div className={styles.infoItem}>
                            <span className={styles.infoLabel}>Заседание:</span>
                            <span className={styles.infoValue}>{protocol.title}</span>
                        </div>
                        <div className={styles.infoItem}>
                            <span className={styles.infoLabel}>Комиссия:</span>
                            <span className={styles.infoValue}>{protocol.committeeName}</span>
                        </div>
                        <div className={styles.infoItem}>
                            <span className={styles.infoLabel}>Дата:</span>
                            <span className={styles.infoValue}>{formatDate(protocol.heldAt)}</span>
                        </div>
                        <div className={styles.infoItem}>
                            <span className={styles.infoLabel}>Место:</span>
                            <span className={styles.infoValue}>{protocol.location || 'Не указано'}</span>
                        </div>
                        <div className={styles.infoItem}>
                            <span className={styles.infoLabel}>Завершено:</span>
                            <span className={styles.infoValue}>{formatDate(protocol.finalizedAt)}</span>
                        </div>
                    </div>
                </section>

                <section className={styles.section}>
                    <h2 className={styles.sectionTitle}>Результаты голосования</h2>
                    <div className={styles.initiativesList}>
                        {protocol.initiatives?.length > 0 ? (
                            protocol.initiatives.map(init => (
                                <div key={init.id} className={styles.initiativeCard}>
                                    <div className={styles.initiativeHeader}>
                                        <h3 className={styles.initiativeTitle}>{init.title}</h3>
                                        {getStatusBadge(init.finalStatus)}
                                    </div>

                                    <p className={styles.initiativeDescription}>
                                        {init.description || 'Описание отсутствует'}
                                    </p>

                                    <div className={styles.initiativeMeta}>
                                        <span className={styles.metaItem}>
                                            <strong>Автор:</strong> {init.author || 'Не указан'}
                                        </span>
                                        <span className={styles.metaItem}>
                                            <strong>Создана:</strong> {formatShortDate(init.createdAt || protocol.finalizedAt)}
                                        </span>
                                    </div>

                                    <div className={styles.voteResults}>
                                        <div className={styles.voteSummary}>
                                            <div className={styles.voteCount}>
                                                <span className={styles.voteValue}>{init.totalVotesFor}</span>
                                                <span className={styles.voteLabel}>За</span>
                                            </div>
                                            <div className={styles.voteCount}>
                                                <span className={styles.voteValue}>{init.totalVotesAgainst}</span>
                                                <span className={styles.voteLabel}>Против</span>
                                            </div>
                                            <div className={styles.voteCount}>
                                                <span className={styles.voteValue}>{init.totalVotesFor + init.totalVotesAgainst}</span>
                                                <span className={styles.voteLabel}>Всего</span>
                                            </div>
                                        </div>

                                        {init.votesByRound?.length > 1 && (
                                            <div className={styles.roundsBreakdown}>
                                                <span className={styles.breakdownLabel}>По раундам:</span>
                                                {init.votesByRound.map(round => (
                                                    <div key={round.hearingRound} className={styles.roundItem}>
                                                        <span className={styles.roundName}>
                                                            {round.hearingRound === 1 ? '1-е слушание' : '2-е слушание'}:
                                                        </span>
                                                        <span className={styles.roundVotes}>
                                                            За: {round.votesFor} • Против: {round.votesAgainst}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className={styles.emptyState}>
                                <p>Инициативы не рассматривались</p>
                            </div>
                        )}
                    </div>
                </section>

                <section className={styles.section}>
                    <h2 className={styles.sectionTitle}>
                        Присутствующие ({protocol.attendees?.length || 0})
                    </h2>
                    <div className={styles.attendeesGrid}>
                        {protocol.attendees?.map(att => (
                            <div key={att.id} className={styles.attendeeCard}>
                                <span className={styles.attendeeName}>{att.name}</span>
                                <span className={styles.attendeeRole}>{att.role}</span>
                            </div>
                        ))}
                    </div>
                </section>
            </div>
        </>
    );
};

export default SessionProtocolPage;