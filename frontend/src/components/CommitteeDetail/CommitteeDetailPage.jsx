import { useParams, Link, useNavigate } from 'react-router-dom';
import { useCommitteeDetails, useJoinCommittee, useLeaveCommittee } from '../../hooks/useCommittee';
import { tokenService } from "../../../api/tokenService.js";
import { getUserId } from "../../utils/jwt.js";
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
    const joinCommittee = useJoinCommittee();
    const leaveCommittee = useLeaveCommittee();
    const currentUserId = getUserId();

    const handleLogout = () => {
        tokenService.clearTokens();
        navigate('/login');
    };

    const handleJoin = async () => {
        if (!currentUserId) {
            alert('Сначала авторизуйтесь');
            navigate('/login');
            return;
        }
        if (!confirm(`Вступить в комиссию "${committee.name}"?`)) return;

        try {
            await joinCommittee.mutateAsync({ committeeId: id, userId: currentUserId });
            alert(`✅ Вы вступили в комиссию "${committee.name}"`);
        } catch (err) {
            alert('❌ Ошибка: ' + (err.message || 'Не удалось вступить'));
        }
    };

    const handleLeave = async () => {
        console.log('🔍 handleLeave started');
        console.log('🔍 currentUserId:', currentUserId);
        console.log('🔍 committeeId:', id);
        console.log('🔍 leaveCommittee state:', leaveCommittee);

        if (!currentUserId) {
            console.warn('⚠️ Exit blocked: currentUserId is undefined');
            alert('Не удалось определить пользователя. Войдите заново.');
            return;
        }

        const confirmed = confirm(`Покинуть комиссию "${committee.name}"?`);
        console.log('🔍 confirm result:', confirmed);
        if (!confirmed) return;

        try {
            console.log('🚀 Calling mutateAsync...');
            await leaveCommittee.mutateAsync({
                committeeId: id,
                userId: currentUserId
            });
            console.log('✅ mutateAsync resolved');
            alert(`✅ Вы покинули комиссию "${committee.name}"`);
        } catch (err) {
            console.error('❌ mutateAsync rejected:', err);
            alert('❌ Ошибка: ' + (err.message || 'Не удалось покинуть'));
        }
    };

    const isMember = committee?.currentMembers?.some(m => m.userId === currentUserId);
    const isPending = joinCommittee.isPending || leaveCommittee.isPending;

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
                <header className={styles.pageHeader}>
                    <div className={styles.headerContent}>
                        <div className={styles.headerTop}>
                            <span className={styles.committeeCode}>#{committee.code || id.slice(0, 8).toUpperCase()}</span>
                            <span className={`${styles.badge} ${styles.badgeActive}`}>Активна</span>
                        </div>
                        <h1 className={styles.pageTitle}>{committee.name}</h1>
                        <p className={styles.specialization}>{committee.specialization}</p>
                    </div>

                    <div className={styles.actionBar}>
                        {isMember ? (
                            <button className={styles.leaveBtn} onClick={handleLeave} disabled={isPending}>
                                {leaveCommittee.isPending ? 'Выход...' : 'Покинуть комиссию'}
                            </button>
                        ) : (
                            <button className={styles.joinBtn} onClick={handleJoin} disabled={isPending}>
                                {joinCommittee.isPending ? 'Вступление...' : 'Вступить в комиссию'}
                            </button>
                        )}
                    </div>
                </header>

                <main className={styles.main}>
                    <section className={styles.section}>
                        <h2 className={styles.sectionTitle}>О комиссии</h2>
                        <div className={styles.infoGrid}>
                            <div className={styles.infoCard}>
                                <dl className={styles.infoList}>
                                    <div className={styles.infoRow}>
                                        <dt>Председатель</dt>
                                        <dd>{committee.currentMembers?.find(m => m.isChairman)?.fullName || 'Не назначен'}</dd>
                                    </div>
                                    <div className={styles.infoRow}>
                                        <dt>Членов комиссии</dt>
                                        <dd>{committee.currentMembers?.length ?? 0}</dd>
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

                    <section className={styles.section}>
                        <h2 className={styles.sectionTitle}>Состав комиссии</h2>
                        {committee.currentMembers?.length > 0 ? (
                            <div className={styles.membersGrid}>
                                {committee.currentMembers.map((member) => (
                                    <div key={member.userId} className={styles.memberCard}>
                                        <div className={styles.memberHeader}>
                                            <span className={styles.memberName}>{member.fullName}</span>
                                            {member.isChairman && (
                                                <span className={`${styles.badge} ${styles.badgeChairman}`}>Председатель</span>
                                            )}
                                        </div>
                                        <p className={styles.memberRole}>{member.isChairman ? 'Председатель' : 'Член комиссии'}</p>
                                        {member.appointedAt && (
                                            <span className={styles.memberSince}>
                                                С {formatDate(member.appointedAt)}
                                            </span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className={styles.empty}>Состав комиссии не указан</div>
                        )}
                    </section>

                    {/* Остальные секции (Инициативы, Заседания) остаются без изменений */}
                </main>
            </div>
        </>
    );
};

export default CommitteeDetailsPage;