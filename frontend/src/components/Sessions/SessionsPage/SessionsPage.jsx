import { Link, useNavigate } from 'react-router-dom';
import { useSessions } from '../../../hooks/useSessions';
import { tokenService } from "../../../../api/tokenService.js";
import Navbar from "../../Layout/NaVbar/NavBar.jsx";
import styles from './SessionsPage.module.css';

const SessionsPage = () => {
    const navigate = useNavigate();

    const { data: sessions, isLoading, isError, error } = useSessions();

    const handleLogout = () => {
        tokenService.clearTokens();
        navigate('/login');
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return 'Дата не указана';
        return new Date(dateStr).toLocaleDateString('ru-RU', {
            day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
        });
    };
    if (isLoading) {
        return (
            <>
                <Navbar onLogout={handleLogout} />
                <div className={styles.loading}>Загрузка расписания...</div>
            </>
        );
    }

    if (isError) {
        return (
            <>
                <Navbar onLogout={handleLogout} />
                <div className={styles.error}>
                    Не удалось загрузить заседания: {error?.message || 'Проверьте подключение к API'}
                </div>
            </>
        );
    }

    return (
        <>
            <Navbar onLogout={handleLogout} />
            <div className={styles.container}>
                <header className={styles.pageHeader}>
                    <h1 className={styles.pageTitle}>Заседания</h1>
                    <p className={styles.pageSubtitle}>Расписание и протоколы заседаний городских комиссий</p>
                </header>

                <div className={styles.grid}>
                    {sessions && sessions.length > 0 ? (
                        sessions.map(s => (
                            <Link key={s.id} to={`/sessions/${s.id}`} className={styles.card}>
                                <div className={styles.cardHeader}>
                                    <span className={styles.committeeBadge}>{s.committeeName || 'Комиссия'}</span>
                                    <span className={`${styles.statusBadge} ${s.isCompleted ? styles.statusClosed : styles.statusOpen}`}>
                                        {s.isCompleted ? 'Завершено' : 'Активно'}
                                    </span>
                                </div>
                                <h2 className={styles.cardTitle}>{s.title}</h2>
                                <div className={styles.cardMeta}>
                                    <span>📅 {formatDate(s.heldAt)}</span>
                                    <span>📍 {s.location || 'Не указано'}</span>
                                </div>
                                <div className={styles.cardFooter}>
                                    <span>Инициатив: {s.initiativesCount || 0}</span>
                                    <span className={styles.arrow}>→</span>
                                </div>
                            </Link>
                        ))
                    ) : (
                        <div className={styles.empty}>Заседаний пока нет</div>
                    )}
                </div>
            </div>
        </>
    );
};

export default SessionsPage;