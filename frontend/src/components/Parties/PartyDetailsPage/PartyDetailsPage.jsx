import { useParams, Link, useNavigate } from 'react-router-dom';
import { usePartyDetails, useJoinParty, useLeaveParty} from "../../../hooks/useParties.js";
import { tokenService} from "../../../../api/tokenService.js";
import { getUserId} from "../../../utils/jwt.js";
import Navbar from "../../Layout/NaVbar/NavBar.jsx";
import styles from './PartyDetailsPage.module.css';


const formatDate = (dateString) => {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleDateString('ru-RU', {
        day: '2-digit', month: 'long', year: 'numeric'
    });
};

const PartyDetailsPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { party, isLoading, isError, error } = usePartyDetails(id);
    const joinParty = useJoinParty();
    const leaveParty = useLeaveParty();
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
        if (!confirm(`Вступить в партию "${party.name}"?`)) return;

        try {
            await joinParty.mutateAsync({ partyId: id, userId: currentUserId });
            alert(`Вы вступили в партию "${party.name}"`);
        } catch (err) {
            alert('Ошибка: ' + (err.message || 'Не удалось вступить'));
        }
    };

    const handleLeave = async () => {
        if (!currentUserId) {
            alert('Не удалось определить пользователя. Войдите заново.');
            return;
        }
        if (!confirm(`Покинуть партию "${party.name}"?`)) return;

        try {
            await leaveParty.mutateAsync({ partyId: id, userId: currentUserId });
            alert(`Вы покинули партию "${party.name}"`);
        } catch (err) {
            alert('Ошибка: ' + (err.message || 'Не удалось покинуть'));
        }
    };

    const isMember = party?.members?.some(m => m.userId === currentUserId);
    const isPending = joinParty.isPending || leaveParty.isPending;

    if (isLoading) {
        return (
            <>
                <Navbar onLogout={handleLogout} />
                <div className={styles.container}>
                    <div className={styles.loading}>Загрузка информации о партии...</div>
                </div>
            </>
        );
    }

    if (isError || !party) {
        return (
            <>
                <Navbar onLogout={handleLogout} />
                <div className={styles.container}>
                    <div className={styles.error}>Партия не найдена</div>
                    <Link to="/parties" className={styles.backLink}>← Вернуться к списку</Link>
                </div>
            </>
        );
    }

    return (
        <>
            <Navbar onLogout={handleLogout} />
            <div className={styles.container}>
                <main className={styles.main}>
                    <header className={styles.pageHeader}>
                        <div className={styles.headerContent}>
                            <div className={styles.headerTop}>
                                <span className={`${styles.badge} ${styles.badgeActive}`}>Активна</span>
                                {party.abbreviation && (
                                    <span className={styles.committeeCode}>{party.abbreviation}</span>
                                )}
                            </div>
                            <h1 className={styles.pageTitle}>{party.name}</h1>
                            <p className={styles.specialization}>{party.ideology || 'Идеология не указана'}</p>
                        </div>

                        <div className={styles.actionBar}>
                            {isMember ? (
                                <button className={styles.leaveBtn} onClick={handleLeave} disabled={isPending}>
                                    {leaveParty.isPending ? 'Выход...' : 'Покинуть партию'}
                                </button>
                            ) : (
                                <button className={styles.joinBtn} onClick={handleJoin} disabled={isPending}>
                                    {joinParty.isPending ? 'Вступление...' : 'Вступить в партию'}
                                </button>
                            )}
                        </div>
                    </header>


                    <section className={styles.section}>
                        <h2 className={styles.sectionTitle}>О партии</h2>
                        <div className={styles.infoGrid}>
                            <div className={styles.infoCard}>
                                <dl className={styles.infoList}>
                                    <div className={styles.infoRow}>
                                        <dt>Идеология</dt>
                                        <dd>{party.ideology || '—'}</dd>
                                    </div>
                                    <div className={styles.infoRow}>
                                        <dt>Участников</dt>
                                        <dd>{party.members?.length ?? 0}</dd>
                                    </div>
                                </dl>
                            </div>
                            <div className={styles.descriptionCard}>
                                <h3>Описание</h3>
                                <p className={styles.fullDescription}>
                                    {party.description || 'Описание партии не предоставлено'}
                                </p>
                            </div>
                        </div>
                    </section>

                    <section className={styles.section}>
                        <h2 className={styles.sectionTitle}>Участники партии</h2>
                        {party.members?.length > 0 ? (
                            <div className={styles.membersGrid}>
                                {party.members.map((member) => (
                                    <div key={member.userId} className={styles.memberCard}>
                                        <div className={styles.memberHeader}>
                                            <span className={styles.memberName}>{member.fullName}</span>
                                        </div>
                                        <div className={styles.memberDesc}>
                                            <p className={styles.memberRole}>Участник</p>
                                            {member.appointedAt && (
                                                <span className={styles.memberSince}>
                                                    с {formatDate(member.appointedAt)}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className={styles.empty}>Участники пока не присоединились</div>
                        )}
                    </section>
                </main>
            </div>
        </>
    );
};

export default PartyDetailsPage;