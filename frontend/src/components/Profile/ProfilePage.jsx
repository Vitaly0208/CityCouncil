import { Link, useNavigate } from 'react-router-dom';
import { tokenService } from '../../../api/tokenService';
import { useUserProfile } from "../../hooks/useUserProfile.js";
import styles from './ProfilePage.module.css';
import Navbar from "../Layout/NaVbar/NavBar.jsx";

const ProfilePage = () => {
    const navigate = useNavigate();
    const { profile, isLoading, isError, refetch } = useUserProfile();

    const handleLogout = () => {
        tokenService.clearTokens();
        navigate('/login');
    };

    const getRoleLabel = (isChairman, status) => {
        if (status === 'Архив') return 'Участник (архив)';
        if (isChairman) return 'Председатель';
        return 'Участник';
    };

    const getRoleClass = (isChairman, status) => {
        if (status === 'Архив') return styles.roleArchived;
        if (isChairman) return styles.roleChairman;
        return styles.roleMember;
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('ru-RU', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    };

    const commissions = profile?.commissions || profile?.Commissions || [];
    const parties = profile?.parties || profile?.Parties || [];

    if (isLoading) {
        return (
            <div className={styles.container}>
                <div className={styles.loadingContainer}>
                    <div className={styles.loadingSpinner}></div>
                    <p>Загрузка профиля...</p>
                </div>
            </div>
        );
    }

    if (isError || !profile) {
        return (
            <div className={styles.container}>
                <div className={styles.errorContainer}>
                    <p className={styles.errorMessage}>Не удалось загрузить профиль</p>
                    <button onClick={() => refetch()} className={styles.backButton}>
                        Повторить
                    </button>
                    <button onClick={() => navigate('/dashboard')} className={styles.backButton}>
                        На главную
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <Navbar onLogout={handleLogout} />

            <div className={styles.pageHeader}>
                <h1 className={styles.pageTitle}>Профиль депутата</h1>
                <p className={styles.pageSubtitle}>Личная информация, участие в комиссиях и активность</p>
            </div>

            <main className={styles.profileLayout}>
                <aside className={styles.profileCard}>
                    <div className={styles.avatar}>
                        <img
                            src={profile.avatarUrl || '/profile.png'}
                            alt={`Аватар ${profile.fullName || 'пользователя'}`}
                            className={styles.avatarImage}
                        />
                    </div>
                    <h2 className={styles.profileName}>{profile.fullName}</h2>
                    <span className={styles.profileRole}>{profile.roleName}</span>
                    <span className={styles.profileParty}>{profile.partyName}</span>

                    <div className={styles.profileDivider}></div>

                    <div className={styles.contactList}>
                        <div className={styles.contactItem}>
                            <span className={styles.contactLabel}>Дата начала полномочий</span>
                            <span className={styles.contactValue}>{formatDate(profile.memberSince)}</span>
                        </div>
                        <div className={styles.contactItem}>
                            <span className={styles.contactLabel}>Email</span>
                            <span className={styles.contactValue}>{profile.email}</span>
                        </div>
                        {profile.homePhone && (
                            <div className={styles.contactItem}>
                                <span className={styles.contactLabel}>Домашний телефон</span>
                                <span className={styles.contactValue}>{profile.homePhone}</span>
                            </div>
                        )}
                        {profile.workPhone && (
                            <div className={styles.contactItem}>
                                <span className={styles.contactLabel}>Служебный телефон</span>
                                <span className={styles.contactValue}>{profile.workPhone}</span>
                            </div>
                        )}
                    </div>
                </aside>

                <div className={styles.profileContent}>
                    <section className={styles.card}>
                        <div className={styles.cardHeader}>
                            <h2 className={styles.cardTitle}>Участие в комиссиях</h2>
                            <Link to="/committees" className={styles.cardLink}>Все комиссии</Link>
                        </div>
                        <div className={styles.list}>
                            {commissions.length > 0 ? (
                                commissions.map((item, index) => (
                                    <div key={index} className={styles.listItem}>
                                        <div className={styles.listItemInfo}>
                                            <h3 className={styles.listItemTitle}>{item.committeeName}</h3>
                                            <span className={styles.listItemDate}>
                                                {formatDate(item.appointedAt)}
                                                {item.dismissedAt ? ` — ${formatDate(item.dismissedAt)}` : ''}
                                            </span>
                                        </div>
                                        <span className={`${styles.roleBadge} ${getRoleClass(item.isChairman, item.status)}`}>
                                            {getRoleLabel(item.isChairman, item.status)}
                                        </span>
                                    </div>
                                ))
                            ) : (
                                <div className={styles.emptyState}>
                                    <p>Нет данных об участии в комиссиях</p>
                                </div>
                            )}
                        </div>
                    </section>

                    <section className={styles.card}>
                        <div className={styles.cardHeader}>
                            <h2 className={styles.cardTitle}>Участие в партиях</h2>
                            <Link to="/parties" className={styles.cardLink}>Все партии</Link>
                        </div>
                        <div className={styles.list}>
                            {parties.length > 0 ? (
                                parties.map((party) => (
                                    <Link key={party.id} to={`/parties/${party.id}`} className={styles.listItem}>
                                        <div className={styles.listItemInfo}>
                                            <h3 className={styles.listItemTitle}>{party.name}</h3>
                                            <span className={styles.listItemDate}>
                                                {party.abbreviation && `${party.abbreviation} • `}
                                                {party.ideology || 'Идеология не указана'}
                                            </span>
                                        </div>
                                        <span className={`${styles.roleBadge} ${styles.roleMember}`}>
                                            Участник
                                        </span>
                                    </Link>
                                ))
                            ) : (
                                <div className={styles.emptyState}>
                                    <p>Нет данных об участии в партиях</p>
                                </div>
                            )}
                        </div>
                    </section>
                </div>
            </main>
        </div>
    );
};

export default ProfilePage;