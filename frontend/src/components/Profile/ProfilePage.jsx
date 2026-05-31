import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { tokenService } from '../../../api/tokenService';
import { useUserProfile, useUpdateProfile } from "../../hooks/useUserProfile.js";
import { getUserRole } from '../../utils/jwt';
import styles from './ProfilePage.module.css';
import Navbar from "../Layout/NaVbar/NavBar.jsx";
import Footer from "../Footer/Footer.jsx";

const ProfilePage = () => {
    const { userId: routeUserId } = useParams();
    const navigate = useNavigate();

    const targetId = routeUserId || null;
    const isMyProfile = !routeUserId;

    const { profile, isLoading, isError, refetch } = useUserProfile(targetId);
    const { updateProfileAsync, isPending } = useUpdateProfile();

    const [showEditModal, setShowEditModal] = useState(false);
    const [formData, setFormData] = useState({
        homePhone: '',
        workPhone: '',
        avatarUrl: ''
    });

    const [showAllCommissions, setShowAllCommissions] = useState(false);
    const [showAllAttendance, setShowAllAttendance] = useState(false);
    const [showAllInitiatives, setShowAllInitiatives] = useState(false);

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

    const handleEditClick = () => {
        setFormData({
            homePhone: profile?.homePhone || '',
            workPhone: profile?.workPhone || '',
            avatarUrl: profile?.avatarUrl || ''
        });
        setShowEditModal(true);
    };

    const handleCloseModal = () => {
        setShowEditModal(false);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await updateProfileAsync({
                id: profile.id,
                data: {
                    userId: profile.id,
                    homePhone: formData.homePhone || null,
                    workPhone: formData.workPhone || null,
                    avatarUrl: formData.avatarUrl || null
                }
            });
            await refetch();
            setShowEditModal(false);
            alert('Профиль успешно обновлён');
        } catch (err) {
            alert('Ошибка: ' + (err.message || 'Не удалось обновить профиль'));
        }
    };

    const commissions = profile?.commissions || profile?.Commissions || [];
    const currentParty = profile?.currentParty || null;
    const sessionAttendance = profile?.sessionAttendance || profile?.SessionAttendance || [];
    const acceptedInitiatives = profile?.acceptedInitiatives || profile?.AcceptedInitiatives || [];

    const displayCommissions = showAllCommissions ? commissions : commissions.slice(0, 3);
    const displayAttendance = showAllAttendance ? sessionAttendance : sessionAttendance.slice(0, 3);
    const displayInitiatives = showAllInitiatives ? acceptedInitiatives : acceptedInitiatives.slice(0, 3);

    const canEdit = isMyProfile && getUserRole() === 'Admin';

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
                    <button onClick={() => navigate(-1)} className={styles.backButton}>
                        Назад
                    </button>
                </div>
            </div>
        );
    }

    const renderShowAllButton = (isVisible, setIsVisible, count) => (
        count > 3 ? (
            <button className={styles.showAllBtn} onClick={() => setIsVisible(!isVisible)}>
                {isVisible ? 'Свернуть' : 'Показать все'}
            </button>
        ) : null
    );

    return (
        <div className={styles.container}>
            <Navbar onLogout={handleLogout} />

            <div className={styles.pageHeader}>
                <div className={styles.pageHeaderContent}>
                    <div>
                        <h1 className={styles.pageTitle}>
                            {isMyProfile ? 'Мой профиль' : 'Профиль депутата'}
                        </h1>
                        <p className={styles.pageSubtitle}>
                            {profile.fullName} • {profile.roleName}
                        </p>
                    </div>
                </div>

                {canEdit && (
                    <button
                        className={styles.editProfileBtn}
                        onClick={handleEditClick}
                        disabled={isPending}
                    >
                        {isPending ? 'Сохранение...' : 'Редактировать профиль'}
                    </button>
                )}
            </div>

            <main className={styles.profileLayout}>
                <aside className={styles.profileCard}>
                    <div className={styles.avatar}>
                        <img
                            src={profile.avatarUrl || '/profile.png'}
                            alt={profile.fullName}
                            className={styles.avatarImage}
                        />
                    </div>
                    <h2 className={styles.profileName}>{profile.fullName}</h2>
                    <span className={styles.profileRole}>{profile.roleName}</span>
                    {profile.partyName && (
                        <span className={styles.profileParty}>{profile.partyName}</span>
                    )}

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
                            {renderShowAllButton(showAllCommissions, setShowAllCommissions, commissions.length)}
                        </div>
                        <div className={styles.list}>
                            {displayCommissions.length > 0 ? (
                                displayCommissions.map((item, index) => (
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
                        </div>
                        <div className={styles.list}>
                            {currentParty ? (
                                <div className={styles.listItem}>
                                    <div className={styles.listItemInfo}>
                                        <h3 className={styles.listItemTitle}>{currentParty.partyName}</h3>
                                        <span className={styles.listItemDate}>
                                            {currentParty.ideology || 'Идеология не указана'}
                                        </span>
                                    </div>
                                    <span className={`${styles.roleBadge} ${styles.roleMember}`}>
                                        Участник
                                    </span>
                                </div>
                            ) : (
                                <div className={styles.emptyState}>
                                    <p>Нет данных об участии в партиях</p>
                                </div>
                            )}
                        </div>
                    </section>
                </div>
            </main>

            <div className={styles.bottomGrid}>
                <section className={styles.card}>
                    <div className={styles.cardHeader}>
                        <h2 className={styles.cardTitle}>Посещения заседаний</h2>
                        {renderShowAllButton(showAllAttendance, setShowAllAttendance, sessionAttendance.length)}
                    </div>
                    <div className={styles.list}>
                        {displayAttendance.length > 0 ? (
                            displayAttendance.map(session => (
                                <div
                                    key={session.sessionId}
                                    className={styles.listItem}
                                    style={{ cursor: 'pointer' }}
                                    onClick={() => navigate(`/sessions/${session.sessionId}/protocol`)}
                                >
                                    <div className={styles.listItemInfo}>
                                        <h3 className={styles.listItemTitle}>{session.sessionTitle}</h3>
                                        <span className={styles.listItemDate}>
                                            {session.committeeName} • {formatDate(session.heldAt)}
                                        </span>
                                    </div>
                                    <span className={`${styles.roleBadge} ${session.wasAttended || session.WasAttended ? styles.badgeAttended : styles.badgeMissed}`}>
                                        {session.wasAttended || session.WasAttended ? 'Посещено' : 'Пропущено'}
                                    </span>
                                </div>
                            ))
                        ) : (
                            <div className={styles.emptyState}>
                                <p>Нет данных о заседаниях</p>
                            </div>
                        )}
                    </div>
                </section>

                <section className={styles.card}>
                    <div className={styles.cardHeader}>
                        <h2 className={styles.cardTitle}>Принятые инициативы</h2>
                        {renderShowAllButton(showAllInitiatives, setShowAllInitiatives, acceptedInitiatives.length)}
                    </div>
                    <div className={styles.list}>
                        {displayInitiatives.length > 0 ? (
                            displayInitiatives.map(init => (
                                <div
                                    key={init.id}
                                    className={styles.listItem}
                                    style={{ cursor: 'pointer' }}
                                    onClick={() => navigate(`/initiatives/${init.id}`)}
                                >
                                    <div className={styles.listItemInfo}>
                                        <h3 className={styles.listItemTitle}>{init.title}</h3>
                                        <span className={styles.listItemDate}>
                                            Принята: {formatDate(init.approvedAt)}
                                        </span>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className={styles.emptyState}>
                                <p>Пока нет принятых инициатив</p>
                            </div>
                        )}
                    </div>
                </section>
            </div>

            {showEditModal && canEdit && (
                <div className={styles.modalOverlay} onClick={handleCloseModal}>
                    <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <h2 className={styles.modalTitle}>Редактирование профиля</h2>
                            <button className={styles.modalClose} onClick={handleCloseModal}>×</button>
                        </div>
                        <form onSubmit={handleSubmit} className={styles.modalForm}>
                            <div className={styles.formGroup}>
                                <label className={styles.formLabel}>Домашний телефон</label>
                                <input
                                    type="tel"
                                    name="homePhone"
                                    value={formData.homePhone}
                                    onChange={handleInputChange}
                                    className={styles.formInput}
                                    placeholder="+7 (___) ___-__-__"
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label className={styles.formLabel}>Служебный телефон</label>
                                <input
                                    type="tel"
                                    name="workPhone"
                                    value={formData.workPhone}
                                    onChange={handleInputChange}
                                    className={styles.formInput}
                                    placeholder="+7 (___) ___-__-__"
                                />
                            </div>
                            <div className={styles.modalActions}>
                                <button
                                    type="button"
                                    className={styles.cancelBtn}
                                    onClick={handleCloseModal}
                                    disabled={isPending}
                                >
                                    Отмена
                                </button>
                                <button
                                    type="submit"
                                    className={styles.saveBtn}
                                    disabled={isPending}
                                >
                                    {isPending ? 'Сохранение...' : 'Сохранить изменения'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProfilePage;