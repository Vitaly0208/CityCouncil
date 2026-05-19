
import {Link, useNavigate} from 'react-router-dom';
import { tokenService } from '../../../api/tokenService';
import { useUserProfile} from "../../hooks/useUserProfile.js";
import { getUserRole } from '../../utils/jwt';
import styles from './ProfilePage.module.css';

const ProfilePage = () => {
    const navigate = useNavigate();
    const isAdmin = getUserRole() === 'Admin';
    const { profile, isLoading, isError, refetch } = useUserProfile();

    const handleLogout = () => {
        tokenService.clearTokens();
        navigate('/login');
    };

    const getRoleLabel = (isChairman, status) => {
        if (status === 'Архив') return 'Член (архив)';
        if (isChairman) return 'Председатель';
        return 'Член';
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

    const getInitials = (fullName) => {
        if (!fullName) return '??';
        const parts = fullName.split(' ');
        if (parts.length >= 2) {
            return `${parts[1][0]}${parts[0][0]}`.toUpperCase();
        }
        return fullName.slice(0, 2).toUpperCase();
    };

    const commissions = profile?.commissions || profile?.Commissions || [];

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
            {/* Шапка */}
            <header className={styles.header}>
                <div className={styles.headerLeft}>
                    <div className={styles.logo}>★</div>
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
                    <span className={styles.userRole}>{profile.roleName}</span>
                    {isAdmin && (
                        <button
                            onClick={() => navigate('/admin')}
                            className={styles.adminButton}
                        >
                            Панель администратора
                        </button>
                    )}
                    <button className={styles.logoutBtn} onClick={handleLogout}>Выйти</button>
                </div>
            </header>

            {/* Заголовок профиля */}
            <div className={styles.pageHeader}>
                <h1 className={styles.pageTitle}>Профиль депутата</h1>
                <p className={styles.pageSubtitle}>Личная информация, участие в комиссиях и активность</p>
            </div>

            {/* Основной контент */}
            <main className={styles.profileLayout}>
                {/* Левая колонка: карточка депутата */}
                <aside className={styles.profileCard}>
                    <div className={styles.avatar}>
                        <span className={styles.avatarInitials}>{getInitials(profile.fullName)}</span>
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

                {/* Правая колонка: комиссии и партийная деятельность */}
                <div className={styles.profileContent}>
                    {/* Участие в комиссиях */}
                    <section className={styles.card}>
                        <div className={styles.cardHeader}>
                            <h2 className={styles.cardTitle}>Участие в комиссиях</h2>
                            <Link to="/committees" className={styles.profileLink}>Все комиссии</Link>
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
                </div>
            </main>
        </div>
    );
};

export default ProfilePage;