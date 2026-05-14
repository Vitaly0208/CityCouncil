
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { tokenService } from "../../../api/tokenService.js";
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

const INITIATIVES = [
    { id: 1, status: 'approved', title: 'О внесении изменений в программу благоустройства парков', author: 'Петрова А. В.', date: '27.04.2026' },
    { id: 2, status: 'approved', title: 'О создании единой цифровой платформы для обращений граждан', author: 'Сидоров К. П.', date: '24.04.2026' },
    { id: 3, status: 'review', title: 'О расширении сети велодорожек в центральной части', author: 'Козлова М. И.', date: '20.04.2026' },
    { id: 4, status: 'approved', title: 'О повышении доступности образовательных услуг для детей с ОВЗ', author: 'Николаев Д. А.', date: '18.04.2026' },
    { id: 5, status: 'draft', title: 'О модернизации системы общественного транспорта', author: 'Иванов И. И.', date: '15.04.2026' },
    { id: 6, status: 'approved', title: 'О введении льготного проезда для пенсионеров', author: 'Белова Е. С.', date: '12.04.2026' },
];

const DashboardPage = () => {
    const navigate = useNavigate();

    const handleLogout = () => {
        tokenService.clearTokens();
        navigate('/login');
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

                <Link to="/profile" className={styles.profileLink}>Профиль</Link>

                <div className={styles.headerRight}>
                    <span className={styles.userName}>Иванов И. И.</span>
                    <span className={styles.userRole}>Комиссия по образованию</span>
                    <button className={styles.logoutBtn} onClick={handleLogout}>Выйти</button>
                </div>
            </header>

            {/* Основная сетка */}
            <main className={styles.gridLayout}>
                {/*  НАВИГАЦИОННАЯ ПАНЕЛЬ (перенесена в main) */}
                <nav className={`${styles.card} ${styles.subNavCard}`}>
                    <NavLink
                        to="/news"
                        className={({ isActive }) => `${styles.navItem} ${isActive ? styles.navItemActive : ''}`}
                    >
                        Новости
                    </NavLink>
                    <NavLink
                        to="/committees"
                        className={({ isActive }) => `${styles.navItem} ${isActive ? styles.navItemActive : ''}`}
                    >
                        Комиссии
                    </NavLink>
                    <NavLink
                        to="/parties"
                        className={({ isActive }) => `${styles.navItem} ${isActive ? styles.navItemActive : ''}`}
                    >
                        Партии
                    </NavLink>
                    <NavLink
                        to="/deputies"
                        className={({ isActive }) => `${styles.navItem} ${isActive ? styles.navItemActive : ''}`}
                    >
                        Депутаты
                    </NavLink>
                    <NavLink
                        to="/elections"
                        className={({ isActive }) => `${styles.navItem} ${isActive ? styles.navItemActive : ''}`}
                    >
                        Выборы
                    </NavLink>
                </nav>

                {/* Полноширинная карточка приветствия */}
                <section className={`${styles.card} ${styles.welcomeCard}`}>
                    <div className={styles.cardHeader}>
                        <h2 className={styles.cardTitle}> Добро пожаловать</h2>
                    </div>
                    <div className={styles.welcomeContent}>
                        <p className={styles.welcomeText}>
                            Вы вошли в систему Городской Думы. Здесь вы можете отслеживать работу комиссий,
                            участвовать в голосованиях, просматривать протоколы заседаний и знакомиться с принятыми инициативами.
                            Используйте навигацию или поиск для быстрого доступа к нужным разделам.
                        </p>
                    </div>
                </section>

                {/* Колонка 1: Новости */}
                <section className={styles.card}>
                    <div className={styles.cardHeader}>
                        <h2 className={styles.cardTitle}> Новости</h2>
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

                {/* Колонка 2: Заседания */}
                <section className={styles.card}>
                    <div className={styles.cardHeader}>
                        <h2 className={styles.cardTitle}> Ближайшие заседания</h2>
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
                                    {item.isNext && <span className={styles.sessionTag}>Ближайшее</span>}
                                    <span className={`${styles.sessionTime} ${item.isNext ? styles.sessionTimeFeatured : ''}`}>{item.time}</span>
                                    <h3 className={`${styles.sessionTitle} ${item.isNext ? styles.sessionTitleFeatured : ''}`}>{item.title}</h3>
                                    <a href="#" className={styles.sessionLink}>Повестка →</a>
                                </div>
                            </article>
                        ))}
                    </div>
                </section>

                {/* Колонка 3: Календарь */}
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

            {/* Нижний блок: Инициативы */}
            <section className={styles.initiativesSection}>
                <h2 className={styles.sectionTitle}>Последние принятые инициативы</h2>
                <div className={styles.initiativesGrid}>
                    {INITIATIVES.map((item) => (
                        <article key={item.id} className={styles.initiativeCard}>
              <span className={`${styles.badge} ${styles[`badge${item.status.charAt(0).toUpperCase() + item.status.slice(1)}`]}`}>
                {item.status === 'approved' ? 'ПРИНЯТА' : item.status === 'review' ? 'НА РАССМОТРЕНИИ' : 'ЧЕРНОВИК'}
              </span>
                            <h3 className={styles.initiativeTitle}>{item.title}</h3>
                            <div className={styles.initiativeMeta}>
                                <span>👤 {item.author}</span>
                                <span> {item.date}</span>
                            </div>
                        </article>
                    ))}
                </div>
            </section>
        </div>
    );
};

export default DashboardPage;