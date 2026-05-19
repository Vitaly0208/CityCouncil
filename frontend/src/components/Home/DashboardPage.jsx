// src/pages/Dashboard/DashboardPage.jsx
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { tokenService } from "../../../api/tokenService.js";
import { useInitiatives } from "../../hooks/useInitiatives.js";
import styles from './DashboardPage.module.css';

const NEWS = [
    { id: 1, date: '28 апреля 2026', title: 'Утверждён новый бюджет на 2027 год', text: 'Депутаты большинством голосов поддержали проект бюджета...' },
    { id: 2, date: '25 апреля 2026', title: 'Программа капитального ремонта ЖКХ', text: 'На заседании комиссии заслушаны доклады о ходе реализации...' },
    { id: 3, date: '22 апреля 2026', title: 'Завершены выборы председателя Комиссии по транспорту', text: 'Новый руководитель вступит в должность с 1 мая...' },
];

const SESSIONS = [
    { id: 1, day: '30', month: 'апр', time: '10:00', title: 'Заседание Комиссии по образованию', isNext: true },
    { id: 2, day: '02', month: 'мая', time: '11:00', title: 'Заседание Комиссии по ЖКХ', isNext: false },
    { id: 3, day: '05', month: 'мая', time: '14:00', title: 'Пленарное заседание Городской Думы', isNext: false },
    { id: 4, day: '07', month: 'мая', time: '09:30', title: 'Выборы главы партии «Прогресс»', isNext: false },
];

const CALENDAR_DAYS = Array.from({ length: 30 }, (_, i) => i + 1);
const EVENT_DAYS = [8, 15, 20, 28, 30];

const DashboardPage = () => {
    const navigate = useNavigate();

    // ✅ 1. Правильно деструктурируем хук + фильтруем только принятые на бэке
    const { initiatives, isLoading , isError, error} = useInitiatives({ status: 'Accepted' });

    const handleLogout = () => {
        tokenService.clearTokens();
        navigate('/login');
    };

    // ✅ 2. Форматирование даты из ISO-строки
    const formatDate = (isoString) => {
        if (!isoString) return '';
        return new Date(isoString).toLocaleDateString('ru-RU', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    return (
        <div className={styles.container}>
            {/* Шапка */}
            <header className={styles.header}>
                <div className={styles.headerLeft}>
                    <div>
                        <h1 className={styles.headerTitle}>Городская Дума</h1>
                        <span className={styles.headerSubtitle}>Система обеспечения законодательной деятельности</span>
                    </div>
                </div>

                <div className={styles.searchBar}>
                    <span>🔍</span>
                    <input type="text" placeholder="Поиск инициатив, депутатов..." />
                </div>

                <div className={styles.headerRight}>
                    <span className={styles.userName}>Иванов И. И.</span>
                    <span className={styles.userRole}>Комиссия по образованию</span>
                    <Link to="/profile" className={styles.logoutBtn}>Профиль</Link>
                    <button className={styles.logoutBtn} onClick={handleLogout}>Выйти</button>
                </div>
            </header>

            {/* Основная сетка */}
            <main className={styles.gridLayout}>
                {/* НАВИГАЦИОННАЯ ПАНЕЛЬ */}
                <nav className={`${styles.card} ${styles.subNavCard}`}>
                    <NavLink to="/news" className={({ isActive }) => `${styles.navItem} ${isActive ? styles.navItemActive : ''}`}>Новости</NavLink>
                    <NavLink to="/committees" className={({ isActive }) => `${styles.navItem} ${isActive ? styles.navItemActive : ''}`}>Комиссии</NavLink>
                    <NavLink to="/sessions" className={({ isActive }) => `${styles.navItem} ${isActive ? styles.navItemActive : ''}`}>Заседания</NavLink>
                    <NavLink to="/initiatives" className={({ isActive }) => `${styles.navItem} ${isActive ? styles.navItemActive : ''}`}>Инициативы</NavLink>
                    <NavLink to="/parties" className={({ isActive }) => `${styles.navItem} ${isActive ? styles.navItemActive : ''}`}>Партии</NavLink>
                    <NavLink to="/deputies" className={({ isActive }) => `${styles.navItem} ${isActive ? styles.navItemActive : ''}`}>Депутаты</NavLink>
                    <NavLink to="/elections" className={({ isActive }) => `${styles.navItem} ${isActive ? styles.navItemActive : ''}`}>Выборы</NavLink>
                </nav>

                {/* Приветствие */}
                <section className={`${styles.card} ${styles.welcomeCard}`}>
                    <div className={styles.cardHeader}>
                        <h2 className={styles.cardTitle}>Добро пожаловать</h2>
                    </div>
                    <div className={styles.welcomeContent}>
                        <p className={styles.welcomeText}>
                            Вы вошли в систему Городской Думы. Здесь вы можете отслеживать работу комиссий,
                            участвовать в голосованиях, просматривать протоколы заседаний и знакомиться с принятыми инициативами.
                            Используйте навигацию или поиск для быстрого доступа к нужным разделам.
                        </p>
                    </div>
                </section>

                {/* Новости */}
                <section className={styles.card}>
                    <div className={styles.cardHeader}>
                        <h2 className={styles.cardTitle}>Новости</h2>
                        <a href="#" className={styles.cardLink}>Все новости →</a>
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

                {/* Заседания */}
                <section className={styles.card}>
                    <div className={styles.cardHeader}>
                        <h2 className={styles.cardTitle}>Ближайшие заседания</h2>
                        <a href="#" className={styles.cardLink}>Расписание →</a>
                    </div>
                    <div className={styles.list}>
                        {SESSIONS.map((item) => (
                            <article key={item.id} className={`${styles.sessionItem} ${item.isNext ? styles.sessionItemFeatured : ''}`}>
                                <div className={`${styles.dateBadge} ${item.isNext ? styles.dateBadgeFeatured : ''}`}>
                                    <span className={styles.dateDay}>{item.day}</span>
                                    <span className={styles.dateMonth}>{item.month}</span>
                                </div>
                                <div className={styles.sessionInfo}>
                                    <span className={`${styles.sessionTime} ${item.isNext ? styles.sessionTimeFeatured : ''}`}>{item.time}</span>
                                    <h3 className={`${styles.sessionTitle} ${item.isNext ? styles.sessionTitleFeatured : ''}`}>{item.title}</h3>
                                    <a href="#" className={styles.sessionLink}>Повестка →</a>
                                </div>
                            </article>
                        ))}
                    </div>
                </section>

                {/* Календарь */}
                <section className={`${styles.card} ${styles.calendarCard}`}>
                    <div className={styles.calendarHeader}>
                        <button className={styles.calendarNav}>‹</button>
                        <span className={styles.calendarMonth}>Апрель 2026</span>
                        <button className={styles.calendarNav}>›</button>
                    </div>
                    <div className={styles.calendarGrid}>
                        {['Пн','Вт','Ср','Чт','Пт','Сб','Вс'].map(d => <div key={d} className={styles.calendarWeekday}>{d}</div>)}
                        <div className={styles.calendarEmpty}></div>
                        {CALENDAR_DAYS.map(day => (
                            <div key={day} className={styles.calendarDay}>
                                {day}
                                {EVENT_DAYS.includes(day) && <span className={styles.calendarDot}></span>}
                            </div>
                        ))}
                    </div>
                    <div className={styles.calendarLegend}>
                        <span className={styles.legendItem}><span className={`${styles.dot} ${styles.dotRed}`}></span> Заседание комиссии</span>
                        <span className={styles.legendItem}><span className={`${styles.dot} ${styles.dotOrange}`}></span> Пленарное заседание</span>
                        <span className={styles.legendItem}><span className={`${styles.dot} ${styles.dotGreen}`}></span> Внутрипартийные выборы</span>
                    </div>
                </section>
            </main>

            {/* ✅ 4. Нижний блок: Инициативы — ИСПРАВЛЕННЫЙ */}
            <section className={styles.initiativesSection}>
                <header className={styles.initiativesHeader}>
                    <div>
                        <h2 className={styles.sectionTitle}>Последние принятые инициативы</h2>
                        <p className={styles.sectionSubtitle}>Инициативы, утверждённые городской думой</p>
                    </div>
                    <Link to="/initiatives" className={styles.viewAllLink}>Все инициативы →</Link>
                </header>

                <div className={styles.initiativesList}>
                    {/* Загрузка */}
                    {isLoading && (
                        <div className={styles.initiativeRow}>
                            <span className={styles.initiativeTitle}>Загрузка инициатив...</span>
                        </div>
                    )}

                    {/* Ошибка */}
                    {isError && (
                        <div className={styles.initiativeRow}>
                            <span className={styles.initiativeTitle}>Не удалось загрузить инициативы</span>
                        </div>
                    )}

                    {/* Пустой список */}
                    {!isLoading && !isError && initiatives.length === 0 && (
                        <div className={styles.initiativeRow}>
                            <span className={styles.initiativeTitle}>Принятых инициатив пока нет</span>
                        </div>
                    )}

                    {/* ✅ Список инициатив с правильными полями */}
                    {!isLoading && !isError && initiatives.map((item, index) => (
                        <Link
                            key={item.id}
                            to={`/initiatives/${item.id}`}
                            className={`${styles.initiativeRow} ${index % 2 === 0 ? styles.even : styles.odd}`}
                        >
                            <div className={styles.initiativeContent}>
                                <h3 className={styles.initiativeTitle}>{item.title}</h3>
                                <div className={styles.initiativeMeta}>
                                    <span className={styles.metaItem}>
                                        <span className={styles.metaIcon}>👤</span>
                                        {item.authorName || 'Неизвестный автор'}  {/* ✅ Правильное поле */}
                                    </span>
                                    <span className={styles.metaDivider}>•</span>
                                    <span className={styles.metaItem}>
                                        <span className={styles.metaIcon}>📅</span>
                                        {formatDate(item.createdAt)}  {/* ✅ Форматируем ISO-дату */}
                                    </span>
                                </div>
                            </div>
                            <span className={styles.arrow}>→</span>
                        </Link>
                    ))}
                </div>
            </section>
        </div>
    );
};

export default DashboardPage;