import { useState, useMemo } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { tokenService } from "../../../api/tokenService.js";
import { useInitiatives } from "../../hooks/useInitiatives.js";
import { useSessions } from "../../hooks/useSessions.js";
import styles from './DashboardPage.module.css';

const NEWS = [
    { id: 1, date: '28 апреля 2026', title: 'Утверждён новый бюджет на 2027 год', text: 'Депутаты большинством голосов поддержали проект бюджета...' },
    { id: 2, date: '25 апреля 2026', title: 'Программа капитального ремонта ЖКХ', text: 'На заседании комиссии заслушаны доклады о ходе реализации...' },
    { id: 3, date: '22 апреля 2026', title: 'Завершены выборы председателя Комиссии по транспорту', text: 'Новый руководитель вступит в должность с 1 мая...' },
];

const DashboardPage = () => {
    const navigate = useNavigate();
    const { initiatives, isLoading, isError } = useInitiatives({ status: 'Accepted' });
    const { data: sessions, isLoading: loadSessions, isError: sessionsError } = useSessions();

    const now = new Date();
    const [viewDate, setViewDate] = useState({ month: now.getMonth(), year: now.getFullYear() });

    const handleLogout = () => {
        tokenService.clearTokens();
        navigate('/login');
    };

    const formatDate = (isoString) => {
        if (!isoString) return '';
        return new Date(isoString).toLocaleDateString('ru-RU', {
            day: '2-digit', month: '2-digit', year: 'numeric'
        });
    };

    const handlePrevMonth = () => {
        setViewDate(prev => {
            const d = new Date(prev.year, prev.month - 1, 1);
            return { month: d.getMonth(), year: d.getFullYear() };
        });
    };

    const handleNextMonth = () => {
        setViewDate(prev => {
            const d = new Date(prev.year, prev.month + 1, 1);
            return { month: d.getMonth(), year: d.getFullYear() };
        });
    };

    const calendarData = useMemo(() => {
        const { month, year } = viewDate;
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const firstDay = new Date(year, month, 1).getDay();
        const offset = firstDay === 0 ? 6 : firstDay - 1;
        const monthLabel = new Date(year, month).toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' });

        const eventDays = new Set();
        sessions?.forEach(s => {
            const d = new Date(s.heldAt);
            if (d.getMonth() === month && d.getFullYear() === year && !s.isCompleted) {
                eventDays.add(d.getDate());
            }
        });

        return { daysInMonth, offset, monthLabel, eventDays };
    }, [viewDate, sessions]);

    const upcomingSessions = useMemo(() => {
        return sessions
            ?.filter(s => !s.isCompleted && new Date(s.heldAt) > now)
            .sort((a, b) => new Date(a.heldAt) - new Date(b.heldAt))
            .slice(0, 4);
    }, [sessions, now]);

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <div className={styles.headerLeft}>
                    <div>
                        <h1 className={styles.headerTitle}>Городская Дума</h1>
                        <span className={styles.headerSubtitle}>Система обеспечения законодательной деятельности</span>
                    </div>
                </div>

                <div className={styles.searchBar}>
                    <input type="text" placeholder="Поиск инициатив, депутатов..." />
                </div>

                <div className={styles.headerRight}>
                    <span className={styles.userName}>Иванов И. И.</span>
                    <span className={styles.userRole}>Комиссия по образованию</span>
                    <Link to="/profile" className={styles.logoutBtn}>Профиль</Link>
                    <button className={styles.logoutBtn} onClick={handleLogout}>Выйти</button>
                </div>
            </header>

            <main className={styles.gridLayout}>
                <nav className={`${styles.card} ${styles.subNavCard}`}>
                    <NavLink to="/news" className={({ isActive }) => `${styles.navItem} ${isActive ? styles.navItemActive : ''}`}>Новости</NavLink>
                    <NavLink to="/committees" className={({ isActive }) => `${styles.navItem} ${isActive ? styles.navItemActive : ''}`}>Комиссии</NavLink>
                    <NavLink to="/sessions" className={({ isActive }) => `${styles.navItem} ${isActive ? styles.navItemActive : ''}`}>Заседания</NavLink>
                    <NavLink to="/initiatives" className={({ isActive }) => `${styles.navItem} ${isActive ? styles.navItemActive : ''}`}>Инициативы</NavLink>
                    <NavLink to="/parties" className={({ isActive }) => `${styles.navItem} ${isActive ? styles.navItemActive : ''}`}>Партии</NavLink>
                    <NavLink to="/deputies" className={({ isActive }) => `${styles.navItem} ${isActive ? styles.navItemActive : ''}`}>Депутаты</NavLink>
                </nav>

                <section className={`${styles.card} ${styles.welcomeCard}`}>
                    <div className={styles.cardHeader}>
                        <h2 className={styles.cardTitle}>Добро пожаловать</h2>
                    </div>
                    <div className={styles.welcomeContent}>
                        <p className={styles.welcomeText}>
                            Вы вошли в систему Городской Думы. Вы можете отслеживать работу комиссий, просматривать протоколы заседаний и знакомиться с принятыми инициативами.
                            Используйте навигацию или поиск для быстрого доступа к нужным разделам.
                        </p>
                    </div>
                </section>

                <section className={styles.card}>
                    <div className={styles.cardHeader}>
                        <h2 className={styles.sectionTitle}>Новости</h2>
                    </div>
                    <div className={styles.list}>
                        {NEWS.map((item) => (
                            <article key={item.id} className={styles.listItem}>
                                <time className={styles.listDate}>{item.date}</time>
                                <h3 className={styles.listTitle}>{item.title}</h3>
                                <p className={styles.listText}>{item.text}</p>
                                <a href="#" className={styles.listLink}>Подробнее</a>
                            </article>
                        ))}
                    </div>
                </section>

                <section className={styles.card}>
                    <div className={styles.cardHeader}>
                        <h2 className={styles.sectionTitle}>Ближайшие заседания</h2>
                        <Link to="/sessions" className={styles.cardLink}>Расписание</Link>
                    </div>
                    <div className={styles.list}>
                        {loadSessions ? (
                            <div className={styles.loadingSmall}>Загрузка...</div>
                        ) : sessionsError || upcomingSessions?.length === 0 ? (
                            <div className={styles.emptySmall}>Предстоящих заседаний нет</div>
                        ) : (
                            upcomingSessions.map((s, idx) => {
                                const date = new Date(s.heldAt);
                                const isNext = idx === 0;
                                return (
                                    <article key={s.id} className={`${styles.sessionItem} ${isNext ? styles.sessionItemFeatured : ''}`}>
                                        <div className={`${styles.dateBadge} ${isNext ? styles.dateBadgeFeatured : ''}`}>
                                            <span className={styles.dateDay}>{date.getDate().toString().padStart(2, '0')}</span>
                                            <span className={styles.dateMonth}>{date.toLocaleDateString('ru-RU', { month: 'short' })}</span>
                                        </div>
                                        <div className={styles.sessionInfo}>
                                            <span className={`${styles.sessionTime} ${isNext ? styles.sessionTimeFeatured : ''}`}>
                                                {date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                            <h3 className={`${styles.sessionTitle} ${isNext ? styles.sessionTitleFeatured : ''}`}>{s.title}</h3>
                                            <Link to={`/sessions/${s.id}`} className={styles.sessionLink}>Повестка</Link>
                                        </div>
                                    </article>
                                );
                            })
                        )}
                    </div>
                </section>

                <section className={`${styles.card} ${styles.calendarCard}`}>
                    <div className={styles.calendarHeader}>
                        <button className={styles.calendarNav} onClick={handlePrevMonth}>‹</button>
                        <span className={styles.calendarMonth}>{calendarData.monthLabel}</span>
                        <button className={styles.calendarNav} onClick={handleNextMonth}>›</button>
                    </div>
                    <div className={styles.calendarGrid}>
                        {['Пн','Вт','Ср','Чт','Пт','Сб','Вс'].map(d =>
                            <div key={d} className={styles.calendarWeekday}>{d}</div>
                        )}
                        {Array.from({ length: calendarData.offset }).map((_, i) =>
                            <div key={`empty-${i}`} className={styles.calendarEmpty}></div>
                        )}
                        {Array.from({ length: calendarData.daysInMonth }, (_, i) => i + 1).map(day => (
                            <div key={day} className={styles.calendarDay}>
                                {day}
                                {calendarData.eventDays.has(day) && <span className={styles.calendarDot}></span>}
                            </div>
                        ))}
                    </div>
                    <div className={styles.calendarLegend}>
                        <span className={styles.legendItem}>
                            <span className={`${styles.dot} ${styles.dotRed}`}></span> Заседание комиссии
                        </span>
                    </div>
                </section>
            </main>

            <section className={styles.initiativesSection}>
                <header className={styles.initiativesHeader}>
                    <div>
                        <h2 className={styles.sectionTitle}>Последние принятые инициативы</h2>
                        <p className={styles.sectionSubtitle}>Инициативы, утверждённые городской думой</p>
                    </div>
                    <Link to="/initiatives" className={styles.viewAllLink}>Все инициативы →</Link>
                </header>

                <div className={styles.initiativesList}>
                    {/* Состояние загрузки */}
                    {isLoading && (
                        <div className={styles.card}>
                            <div className={styles.cardContent}>
                                <p className={styles.cardDesc}>Загрузка инициатив...</p>
                            </div>
                        </div>
                    )}

                    {/* Состояние ошибки */}
                    {isError && (
                        <div className={styles.card}>
                            <div className={styles.cardContent}>
                                <p className={styles.cardDesc}>Не удалось загрузить инициативы</p>
                            </div>
                        </div>
                    )}

                    {/* Пустой список */}
                    {!isLoading && !isError && initiatives.length === 0 && (
                        <div className={styles.card}>
                            <div className={styles.cardContent}>
                                <p className={styles.cardDesc}>Принятых инициатив пока нет</p>
                            </div>
                        </div>
                    )}

                    {/* Основной список карточек */}
                    {!isLoading && !isError && initiatives.map((item) => (
                        <Link
                            key={item.id}
                            to={`/initiatives/${item.id}`}
                            className={styles.cardInit}
                        >
                            <div className={styles.cardImageWrapper}>
                                <img
                                    src={item.imageUrl || '/initiative.png'}
                                    alt={item.title}
                                    className={styles.cardImage}
                                    loading="lazy"
                                />
                            </div>
                            <div className={styles.cardContentInit}>
                                <div className={styles.cardHeaderInit}>
                                    <h3 className={styles.cardTitleInit}>{item.title}</h3>
                                </div>
                                {item.description && (
                                    <p className={styles.cardDescInit}>{item.description}</p>
                                )}
                            </div>
                            <div className={styles.cardMetaInit}>
                                <span className={styles.author}>{item.authorName || 'Неизвестный автор'}</span>
                                <span className={styles.metaDivider}>•</span>
                                <time className={styles.date}>{formatDate(item.createdAt)}</time>
                            </div>
                        </Link>
                    ))}
                </div>
            </section>
        </div>
    );
};

export default DashboardPage;