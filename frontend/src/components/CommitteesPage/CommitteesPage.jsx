
import { Link, useNavigate } from 'react-router-dom';
import { useCommittees } from "../../hooks/useCommittees.js";
import { tokenService} from "../../../api/tokenService.js";
import Navbar from '../Layout/NaVbar/NavBar.jsx';
import styles from './CommitteesPage.module.css';

const CommitteesPage = () => {
    const navigate = useNavigate();
    const { committees, isLoading, isError } = useCommittees();

    const handleLogout = () => {
        tokenService.clearTokens();
        navigate('/login');
    };

    if (isLoading) {
        return (
            <>
                <Navbar onLogout={handleLogout} />
                <div className={styles.container}>
                    <div className={styles.loading}>Загрузка комиссий...</div>
                </div>
            </>
        );
    }

    if (isError) {
        return (
            <>
                <Navbar onLogout={handleLogout} />
                <div className={styles.container}>
                    <div className={styles.error}>Не удалось загрузить список комиссий</div>
                </div>
            </>
        );
    }

    return (
        <>
            <Navbar onLogout={handleLogout} />
            <div className={styles.container}>
                <header className={styles.pageHeader}>
                    <h1 className={styles.pageTitle}>Комиссии</h1>
                    <p className={styles.pageSubtitle}>
                        Постоянные комиссии городского совета по направлениям деятельности
                    </p>
                </header>

                <div className={styles.grid}>
                    {committees.map((committee) => (
                        <Link
                            key={committee.id}
                            to={`/committees/${committee.id}`}
                            className={styles.card}
                        >
                            <header className={styles.cardHeader}>
                                <span className={styles.committeeCode}>
                                    #{committee.code || committee.id.slice(0, 6).toUpperCase()}
                                </span>
                                <span className={`${styles.badge} ${styles.badgeActive}`}>
                                    Активна
                                </span>
                            </header>

                            <div className={styles.cardBody}>
                                <h2 className={styles.cardTitle}>{committee.name}</h2>

                                <p className={styles.specialization}>
                                    {committee.specialization}
                                </p>

                                <p className={styles.description}>
                                    {committee.description || 'Описание комиссии не предоставлено'}
                                </p>

                                <dl className={styles.details}>
                                    <div className={styles.detailRow}>
                                        <dt>Председатель</dt>
                                        <dd>{committee.chairmanName || '—'}</dd>
                                    </div>
                                    <div className={styles.detailRow}>
                                        <dt>Членов</dt>
                                        <dd>{committee.memberCount ?? 0}</dd>
                                    </div>
                                    {committee.meetingSchedule && (
                                        <div className={styles.detailRow}>
                                            <dt>Заседания</dt>
                                            <dd>{committee.meetingSchedule}</dd>
                                        </div>
                                    )}
                                </dl>
                            </div>

                            <footer className={styles.cardFooter}>
                                <span className={styles.viewDetails}>Подробнее →</span>
                            </footer>
                        </Link>
                    ))}
                </div>
            </div>
        </>
    );
};

export default CommitteesPage;