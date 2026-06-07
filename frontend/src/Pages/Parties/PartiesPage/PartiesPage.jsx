import { Link, useNavigate } from 'react-router-dom';
import { useParties} from "../../../hooks/useParties.js";
import { tokenService} from "../../../../api/tokenService.js";
import Navbar from "../../../components/Layout/NaVbar/NavBar.jsx";
import styles from './PartiesPage.module.css';

const PARTY_ICON = '/party.png';
const PartiesPage = () => {
    const navigate = useNavigate();
    const { data: parties = [], isLoading, isError, error } = useParties();
    console.log('Parties data:', parties);
    const handleLogout = () => {
        tokenService.clearTokens();
        navigate('/login');
    };

    if (isLoading) {
        return (
            <>
                <Navbar onLogout={handleLogout} />
                <div className={styles.container}>
                    <div className={styles.loading}>Загрузка партий...</div>
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
                        Не удалось загрузить партии: {error?.message || 'Проверьте консоль'}
                    </div>
                </div>
            </>
        );
    }

    if (parties.length === 0) {
        return (
            <>
                <Navbar onLogout={handleLogout} />
                <div className={styles.container}>
                    <header className={styles.pageHeader}>
                        <h1 className={styles.pageTitle}>Партии</h1>
                        <p className={styles.pageSubtitle}>Список пуст</p>
                    </header>
                    <div className={styles.empty}>Партии пока не созданы</div>
                </div>
            </>
        );
    }

    return (
        <>
            <Navbar onLogout={handleLogout} />
            <div className={styles.container}>
                <header className={styles.pageHeader}>
                    <h1 className={styles.pageTitle}>Партии</h1>
                    <p className={styles.pageSubtitle}>
                        Политические объединения и фракции городского совета
                    </p>
                </header>

                <div className={styles.grid}>
                    {parties.map((party) => (
                        <Link
                            key={party.id}
                            to={`/parties/${party.id}`}
                            className={styles.card}
                        >
                            <div className={styles.cardImageWrapper}>
                                <img
                                    src={PARTY_ICON}
                                    alt=""
                                    className={styles.cardImage}
                                />
                            </div>

                            <div className={styles.cardBody}>
                                <h2 className={styles.cardTitle}>{party.name || 'Без названия'}</h2>
                                <p className={styles.ideology}>
                                    {party.abbreviation || 'Идеология не указана'}
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

export default PartiesPage;