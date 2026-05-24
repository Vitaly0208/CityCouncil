import { Link, useNavigate } from 'react-router-dom';
import { useSessions } from '../../../hooks/useSessions';
import { tokenService } from "../../../../api/tokenService.js";
import Navbar from "../../Layout/NaVbar/NavBar.jsx";
import styles from './SessionsPage.module.css';

const SESSION_IMAGE_URL = '/session2.png';

const SessionsPage = () => {
    const navigate = useNavigate();
    const { data: sessions, isLoading, isError, error } = useSessions();

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
                    <h1 className={styles.pageTitle}>Заседания</h1>
                    <p className={styles.pageSubtitle}>Расписание и протоколы заседаний городских комиссий</p>
                </header>

                <div className={styles.grid}>
                    {sessions?.length > 0 ? (
                        sessions.map(s => {
                            const dt = formatDateTime(s.heldAt);
                            return (
                                <Link key={s.id} to={`/sessions/${s.id}`} className={styles.card}>
                                    <div className={styles.cardTop}>
                                        <div className={styles.dateBlock}>
                                            <span className={styles.day}>{dt?.date}</span>
                                            <span className={styles.time}>{dt?.time}</span>
                                        </div>
                                        <span className={`${styles.status} ${s.isCompleted ? styles.completed : styles.active}`}>
                                            {s.isCompleted ? 'Завершено' : 'Активно'}
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
                                        <span className={styles.agendaBtn}>ПОВЕСТКА</span>
                                    </div>
                                </Link>
                            );
                        })
                    ) : (
                        <div className={styles.empty}>Заседаний пока нет</div>
                    )}
                </div>
            </div>
        </>
    );
};

export default SessionsPage;