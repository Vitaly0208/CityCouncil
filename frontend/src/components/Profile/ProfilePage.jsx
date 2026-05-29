import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { tokenService } from '../../../api/tokenService';
import { useUserProfile, useUpdateProfile } from "../../hooks/useUserProfile.js";
import { getUserRole } from '../../utils/jwt';
import styles from './ProfilePage.module.css';
import Navbar from "../Layout/NaVbar/NavBar.jsx";

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

    useEffect(() => {
        console.log('🔍 ProfilePage debug:');
        console.log('📦 routeUserId:', routeUserId);
        console.log('🎯 targetId:', targetId);
        console.log('👤 isMyProfile:', isMyProfile);
        console.log('📄 profile loaded:', profile?.id);
    }, [routeUserId, targetId, isMyProfile, profile]);

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

    // 👇 Редактирование доступно только для своего профиля и только админам
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
                            {currentParty ? (
                                <Link
                                    key={currentParty.partyId}
                                    to={`/parties/${currentParty.partyId}`}
                                    className={styles.listItem}
                                >
                                    <div className={styles.listItemInfo}>
                                        <h3 className={styles.listItemTitle}>{currentParty.partyName}</h3>
                                        <span className={styles.listItemDate}>
                                            {currentParty.ideology || 'Идеология не указана'}
                                        </span>
                                    </div>
                                    <span className={`${styles.roleBadge} ${styles.roleMember}`}>
                                        Участник
                                    </span>
                                </Link>
                            ) : (
                                <div className={styles.emptyState}>
                                    <p>Нет данных об участии в партиях</p>
                                </div>
                            )}
                        </div>
                    </section>
                </div>
            </main>

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

                            <div className={styles.formGroup}>
                                <label className={styles.formLabel}>URL аватара</label>
                                <input
                                    type="url"
                                    name="avatarUrl"
                                    value={formData.avatarUrl}
                                    onChange={handleInputChange}
                                    className={styles.formInput}
                                    placeholder="https://example.com/avatar.jpg"
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