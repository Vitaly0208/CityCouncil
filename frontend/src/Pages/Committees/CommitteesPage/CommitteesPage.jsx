import { Link, useNavigate } from 'react-router-dom';
import { useCommittees } from "../../../hooks/useCommittees.js";
import { tokenService } from "../../../../api/tokenService.js";
import Navbar from '../../../components/Layout/NaVbar/NavBar.jsx';
import styles from './CommitteesPage.module.css';

const COMMITTEE_ICON = '/committee.png';

const CommitteesPage = () => {
    const navigate = useNavigate();
    const { committees, isLoading, isError, error } = useCommittees();

    const handleLogout = () => {
        tokenService.clearTokens();
        navigate('/login');
    };

    const safeCommittees = Array.isArray(committees) ? committees : [];

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
                    <div className={styles.error}>
                        Не удалось загрузить комиссии: {error?.message || 'Проверьте консоль'}
                    </div>
                </div>
            </>
        );
    }

    if (safeCommittees.length === 0) {
        return (
            <>
                <Navbar onLogout={handleLogout} />
                <div className={styles.container}>
                    <header className={styles.pageHeader}>
                        <h1 className={styles.pageTitle}>Комиссии</h1>
                        <p className={styles.pageSubtitle}>Список пуст</p>
                    </header>
                    <div className={styles.empty}>Комиссии пока не созданы</div>
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
                    {safeCommittees.map((committee) => (
                        <Link
                            key={committee.id}
                            to={`/committees/${committee.id}`}
                            className={styles.card}
                        >
                            <div className={styles.cardImageWrapper}>
                                <img
                                    src={COMMITTEE_ICON}
                                    alt=""
                                    className={styles.cardImage}
                                />
                            </div>

                            <div className={styles.cardBody}>
                                <h2 className={styles.cardTitle}>{committee.name || 'Без названия'}</h2>
                                <p className={styles.specialization}>
                                    {committee.specialization || 'Специализация не указана'}
                                </p>
                            </div>

                            <div className={styles.cardFooter}>
                                <span className={styles.viewDetails}>Подробнее →</span>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </>
    );
};

export default CommitteesPage;