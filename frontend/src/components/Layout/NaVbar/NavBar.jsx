import { useState, useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { getUserRole } from '../../../utils/jwt.js';
import styles from './Navbar.module.css';

const Navbar = ({ onLogout }) => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const location = useLocation();

    // ✅ ИСПРАВЛЕНИЕ: вычисляем роль напрямую (без useEffect)
    // getUserRole() — быстрая синхронная функция, можно вызывать при рендере
    const userRole = useMemo(() => getUserRole(), [location.pathname]);

    const handleLinkClick = () => {
        setIsMobileMenuOpen(false);
    };

    const handleLogout = () => {
        setIsMobileMenuOpen(false);
        onLogout?.();
    };

    const commonLinks = [
        { to: '/dashboard', label: 'Главная' },
        { to: '/initiatives', label: 'Инициативы' },
        { to: '/committees', label: 'Комиссии' },
    ];

    const adminLinks = [
        { to: '/admin', label: 'Админ-панель', icon: '🛡️' },
    ];

    const isActive = (path) => location.pathname === path;

    return (
        <nav className={styles.navbar}>
            <div className={styles.container}>
                <Link to="/dashboard" className={styles.brand} onClick={handleLinkClick}>
                    <span className={styles.brandText}>Городская Дума</span>
                </Link>

                <div className={styles.desktopMenu}>
                    <ul className={styles.navList}>
                        {commonLinks.map((link) => (
                            <li key={link.to}>
                                <Link
                                    to={link.to}
                                    className={`${styles.navLink} ${isActive(link.to) ? styles.active : ''}`}
                                    onClick={handleLinkClick}
                                >
                                    {link.label}
                                </Link>
                            </li>
                        ))}

                        {userRole === 'Admin' && adminLinks.map((link) => (
                            <li key={link.to}>
                                <Link
                                    to={link.to}
                                    className={`${styles.navLink} ${styles.adminLink} ${isActive(link.to) ? styles.active : ''}`}
                                    onClick={handleLinkClick}
                                >
                                    {link.icon} {link.label}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>

                <div className={styles.rightSection}>
                    {userRole && (
                        <span className={styles.roleBadge}>
              {userRole === 'Admin' ? 'Админ' : userRole === 'Deputy' ? 'Депутат' : 'Пользователь'}
            </span>
                    )}

                    <button
                        className={styles.logoutButton}
                        onClick={handleLogout}
                        aria-label="Выйти"
                    >
                        Выйти
                    </button>

                    <button
                        className={styles.mobileToggle}
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        aria-label={isMobileMenuOpen ? 'Закрыть меню' : 'Открыть меню'}
                        aria-expanded={isMobileMenuOpen}
                    >
            <span className={`${styles.hamburger} ${isMobileMenuOpen ? styles.open : ''}`}>
              <span className={styles.hamburgerLine}></span>
              <span className={styles.hamburgerLine}></span>
              <span className={styles.hamburgerLine}></span>
            </span>
                    </button>
                </div>
            </div>

            {isMobileMenuOpen && (
                <div className={styles.mobileMenu}>
                    <ul className={styles.mobileNavList}>
                        {commonLinks.map((link) => (
                            <li key={link.to}>
                                <Link
                                    to={link.to}
                                    className={`${styles.mobileNavLink} ${isActive(link.to) ? styles.active : ''}`}
                                    onClick={handleLinkClick}
                                >
                                    {link.label}
                                </Link>
                            </li>
                        ))}

                        {userRole === 'Admin' && adminLinks.map((link) => (
                            <li key={link.to}>
                                <Link
                                    to={link.to}
                                    className={`${styles.mobileNavLink} ${styles.adminLink} ${isActive(link.to) ? styles.active : ''}`}
                                    onClick={handleLinkClick}
                                >
                                    <span className={styles.mobileIcon}>{link.icon}</span>
                                    {link.label}
                                </Link>
                            </li>
                        ))}

                        <li className={styles.mobileDivider}></li>

                        <li>
                            <button
                                className={styles.mobileLogoutButton}
                                onClick={handleLogout}
                            >
                                🔓 Выйти из аккаунта
                            </button>
                        </li>
                    </ul>
                </div>
            )}
        </nav>
    );
};

export default Navbar;