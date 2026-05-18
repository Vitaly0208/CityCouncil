
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useCommitteeDetails } from '../../hooks/useCommittee';
import { tokenService} from "../../../api/tokenService.js";
import Navbar from '../Layout/NaVbar/NavBar.jsx';
import styles from './CommitteeDetailPage.module.css';

const formatDate = (dateString) => {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleDateString('ru-RU', {
        day: '2-digit', month: 'long', year: 'numeric'
    });
};

const CommitteeDetailsPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { committee, isLoading, isError } = useCommitteeDetails(id);

    const handleLogout = () => {
        tokenService.clearTokens();
        navigate('/login');
    };

    if (isLoading) {
        return (
            <>
                <Navbar onLogout={handleLogout} />
                <div className={styles.container}>
                    <div className={styles.loading}>Загрузка информации о комиссии...</div>
                </div>
            </>
        );
    }

    if (isError || !committee) {
        return (
            <>
                <Navbar onLogout={handleLogout} />
                <div className={styles.container}>
                    <div className={styles.error}>Комиссия не найдена</div>
                    <Link to="/committees" className={styles.backLink}>← Вернуться к списку</Link>
                </div>
            </>
        );
    }

    return (
        <>
            <Navbar onLogout={handleLogout} />
            <div className={styles.container}>
                {/* Шапка */}
                <header className={styles.pageHeader}>
                    <Link to="/committees" className={styles.backButton}>← Назад</Link>
                    <div className={styles.headerContent}>
                        <div className={styles.headerTop}>
                            <span className={styles.committeeCode}>#{committee.code || id.slice(0, 8).toUpperCase()}</span>
                            <span className={`${styles.badge} ${styles.badgeActive}`}>Активна</span>
                        </div>
                        <h1 className={styles.pageTitle}>{committee.name}</h1>
                        <p className={styles.specialization}>{committee.specialization}</p>
                    </div>
                </header>

                <main className={styles.main}>
                    {/* Основная информация */}
                    <section className={styles.section}>
                        <h2 className={styles.sectionTitle}>О комиссии</h2>
                        <div className={styles.infoGrid}>
                            <div className={styles.infoCard}>
                                <dl className={styles.infoList}>
                                    <div className={styles.infoRow}>
                                        <dt>Председатель</dt>
                                        <dd>{committee.chairmanName || 'Не назначен'}</dd>
                                    </div>
                                    <div className={styles.infoRow}>
                                        <dt>Членов комиссии</dt>
                                        <dd>{committee.memberCount ?? 0}</dd>
                                    </div>
                                    {committee.meetingSchedule && (
                                        <div className={styles.infoRow}>
                                            <dt>График заседаний</dt>
                                            <dd>{committee.meetingSchedule}</dd>
                                        </div>
                                    )}
                                    <div className={styles.infoRow}>
                                        <dt>Создана</dt>
                                        <dd>{formatDate(committee.createdAt)}</dd>
                                    </div>
                                </dl>
                            </div>
                            <div className={styles.descriptionCard}>
                                <h3>Описание</h3>
                                <p className={styles.fullDescription}>
                                    {committee.description || 'Описание комиссии не предоставлено'}
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* Состав комиссии */}
                    <section className={styles.section}>
                        <h2 className={styles.sectionTitle}>Состав комиссии</h2>
                        {committee.members?.length > 0 ? (
                            <div className={styles.membersGrid}>
                                {committee.members.map((member, idx) => (
                                    <div key={member.id || idx} className={styles.memberCard}>
                                        <div className={styles.memberHeader}>
                                            <span className={styles.memberName}>{member.name}</span>
                                            {member.isChairman && (
                                                <span className={`${styles.badge} ${styles.badgeChairman}`}>Председатель</span>
                                            )}
                                        </div>
                                        <p className={styles.memberRole}>{member.role || 'Член комиссии'}</p>
                                        {member.joinedAt && (
                                            <span className={styles.memberSince}>
                        С {formatDate(member.joinedAt)}
                      </span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className={styles.empty}>Состав комиссии не указан</div>
                        )}
                    </section>

                    {/* Инициативы */}
                    <section className={styles.section}>
                        <div className={styles.sectionHeader}>
                            <h2 className={styles.sectionTitle}>Инициативы комиссии</h2>
                            <Link to={`/committees/${id}/initiatives`} className={styles.viewAllLink}>
                                Все инициативы →
                            </Link>
                        </div>
                        {committee.initiatives?.length > 0 ? (
                            <div className={styles.initiativesList}>
                                {committee.initiatives.slice(0, 5).map((init) => (
                                    <Link key={init.id} to={`/initiatives/${init.id}`} className={styles.initiativeItem}>
                                        <div className={styles.initiativeInfo}>
                                            <h4 className={styles.initiativeTitle}>{init.title}</h4>
                                            <span className={`${styles.badge} ${styles[`badge_${init.status?.toLowerCase()}`]}`}>
                        {init.status === 'Accepted' ? 'Принята' :
                            init.status === 'InQueue' ? 'В очереди' :
                                init.status === 'InFirstHearing' ? 'Первое слушание' :
                                    init.status === 'Rejected' ? 'Отклонена' : init.status}
                      </span>
                                        </div>
                                        <time className={styles.initiativeDate}>
                                            {formatDate(init.createdAt)}
                                        </time>
                                    </Link>
                                ))}
                            </div>
                        ) : (
                            <div className={styles.empty}>Инициативы пока отсутствуют</div>
                        )}
                    </section>

                    {/* Заседания */}
                    <section className={styles.section}>
                        <div className={styles.sectionHeader}>
                            <h2 className={styles.sectionTitle}>Предстоящие заседания</h2>
                            <Link to={`/committees/${id}/sessions`} className={styles.viewAllLink}>
                                Все заседания →
                            </Link>
                        </div>
                        {committee.upcomingSessions?.length > 0 ? (
                            <div className={styles.sessionsList}>
                                {committee.upcomingSessions.slice(0, 3).map((session) => (
                                    <div key={session.id} className={styles.sessionItem}>
                                        <div className={styles.sessionInfo}>
                                            <h4 className={styles.sessionTitle}>{session.title}</h4>
                                            {session.location && (
                                                <span className={styles.sessionLocation}>📍 {session.location}</span>
                                            )}
                                        </div>
                                        <time className={styles.sessionDate}>
                                            {new Date(session.heldAt).toLocaleString('ru-RU', {
                                                day: '2-digit', month: '2-digit', year: 'numeric',
                                                hour: '2-digit', minute: '2-digit'
                                            })}
                                        </time>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className={styles.empty}>Заседания не запланированы</div>
                        )}
                    </section>
                </main>
            </div>
        </>
    );
};

export default CommitteeDetailsPage;