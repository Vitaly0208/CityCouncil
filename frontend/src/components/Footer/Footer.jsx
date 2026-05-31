import { Link } from 'react-router-dom';
import styles from './Footer.module.css';

const Footer = () => {
    const year = new Date().getFullYear();

    return (
        <footer className={styles.footer}>
            <div className={styles.container}>
                <nav className={styles.nav}>
                    <Link to="/dashboard" className={styles.link}>Главная</Link>
                    <Link to="/sessions" className={styles.link}>Заседания</Link>
                    <Link to="/initiatives" className={styles.link}>Инициативы</Link>
                    <Link to="/committees" className={styles.link}>Комиссии</Link>
                    <Link to="/parties" className={styles.link}>Партии</Link>
                </nav>

                <div className={styles.copyright}>
                    <span>© {year} Городской Совет</span>
                </div>
            </div>
        </footer>
    );
};

export default Footer;