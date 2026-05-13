import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { tokenService } from '../../../api/tokenService';
import { useCommittees} from "../../hooks/useCommittees.js";
import styles from './CommitteesPage.module.css';

const CommitteesPage = () => {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const { committees, isLoading, isError } = useCommittees({ search: searchQuery });

    const handleLogout = () => {
        tokenService.clearTokens();
        navigate('/login');
    };

    const handleSearch = (e) => {
        setSearchQuery(e.target.value);
    };

    if (isLoading) {
        return (
            <div className={styles.container}>
                <div className={styles.loadingContainer}>
                    <div className={styles.loadingSpinner}></div>
                    <p>Загрузка комиссий...</p>
                </div>
            </div>
        );
    }

    if (isError) {
        return (
            <div className={styles.container}>
                <div className={styles.errorContainer}>
                    <p className={styles.errorMessage}>Не удалось загрузить список комиссий</p>
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
                    <input
                        type="text"
                        placeholder="Поиск комиссий..."
                        value={searchQuery}
                        onChange={handleSearch}
                    />
                </div>

                <div className={styles.headerRight}>
                    <Link to="/profile" className={styles.profileLink}>Профиль</Link>
                    <button className={styles.logoutBtn} onClick={handleLogout}>Выйти</button>
                </div>
            </header>

            {/* Заголовок страницы */}
            <div className={styles.pageHeader}>
                <h1 className={styles.pageTitle}>Комиссии</h1>
                <p className={styles.pageSubtitle}>
                    {committees.length} комиссий найдено
                </p>
            </div>

            {/* Сетка карточек комиссий */}
            <main className={styles.grid}>
                {committees.length > 0 ? (
                    committees.map((committee) => (
                        <Link
                            key={committee.id}
                            to={`/committees/${committee.id}`}
                            className={styles.card}
                        >
                            <div className={styles.cardHeader}>
                                <h3 className={styles.cardTitle}>{committee.name}</h3>
                                <span className={styles.specialization}>{committee.specialization}</span>
                            </div>

                            <p className={styles.description}>
                                {committee.description?.slice(0, 120)}
                                {committee.description?.length > 120 ? '...' : ''}
                            </p>

                            <div className={styles.cardFooter}>
                <span className={styles.memberCount}>
                  👥 {committee.memberCount || 0} членов
                </span>
                                {committee.chairmanName && (
                                    <span className={styles.chairman}>
                    Пред: {committee.chairmanName}
                  </span>
                                )}
                            </div>
                        </Link>
                    ))
                ) : (
                    <div className={styles.emptyState}>
                        <p>Комиссии не найдены</p>
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery('')}
                                className={styles.clearButton}
                            >
                                Сбросить поиск
                            </button>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
};

export default CommitteesPage;