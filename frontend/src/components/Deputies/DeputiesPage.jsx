import { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useUsers } from '../../hooks/UseUsers';
import { useCommittees } from '../../hooks/useCommittees';
import { tokenService } from '../../../api/tokenService';
import Navbar from '../Layout/NaVbar/NavBar.jsx';
import styles from './DeputiesPage.module.css';

const DeputiesPage = () => {
    const navigate = useNavigate();
    const [filters, setFilters] = useState({
        committeeId: '',
        party: '',
        search: ''
    });

    const { data: users = [], isLoading } = useUsers({
        searchTerm: filters.search || undefined
    });

    const { committees = [] } = useCommittees();

    const handleLogout = () => {
        tokenService.clearTokens();
        navigate('/login');
    };

    const filteredUsers = useMemo(() => {
        return users.filter(user => {
            const matchesCommittee = !filters.committeeId || (() => {
                const selectedCommittee = committees.find(c => c.id === filters.committeeId);
                if (!selectedCommittee) return false;
                return user.activeCommitteeNames?.includes(selectedCommittee.name);
            })();

            const matchesParty = !filters.party || user.currentPartyName === filters.party;

            return matchesCommittee && matchesParty;
        });
    }, [users, filters, committees]);

    const parties = useMemo(() => {
        const partySet = new Set(
            users.map(u => u.currentPartyName).filter(Boolean)
        );
        return Array.from(partySet).sort();
    }, [users]);

    return (
        <>
            <Navbar onLogout={handleLogout} />
            <div className={styles.container}>
                <header className={styles.pageHeader}>
                    <h1 className={styles.pageTitle}>Депутаты</h1>
                    <p className={styles.pageSubtitle}>
                        Список депутатов городского совета
                    </p>
                </header>

                <div className={styles.filters}>
                    <select
                        value={filters.committeeId}
                        onChange={e => setFilters({...filters, committeeId: e.target.value})}
                        className={styles.filterSelect}
                    >
                        <option value="">Все комиссии</option>
                        {committees.map(c => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                    </select>

                    <select
                        value={filters.party}
                        onChange={e => setFilters({...filters, party: e.target.value})}
                        className={styles.filterSelect}
                    >
                        <option value="">Все партии</option>
                        {parties.map(party => (
                            <option key={party} value={party}>{party}</option>
                        ))}
                    </select>

                    <input
                        type="text"
                        placeholder="Поиск по имени или email..."
                        value={filters.search}
                        onChange={e => setFilters({...filters, search: e.target.value})}
                        className={styles.searchInput}
                    />
                </div>

                {isLoading ? (
                    <div className={styles.loading}>Загрузка...</div>
                ) : filteredUsers.length === 0 ? (
                    <div className={styles.empty}>Депутаты не найдены</div>
                ) : (
                    <div className={styles.grid}>
                        {filteredUsers.map(user => {
                            const activeCommitteesCount = user.activeCommitteeNames?.length || 0;
                            const userParty = user.currentPartyName;

                            return (
                                <Link
                                    key={user.id}
                                    to={`/profile/${user.id}`}
                                    className={styles.card}
                                >
                                    <div className={styles.cardImageWrapper}>
                                        <img
                                            src="/deputy3.png"
                                            alt=""
                                            className={styles.cardImage}
                                        />
                                    </div>

                                    <div className={styles.cardBody}>
                                        <h2 className={styles.fullName}>
                                            {user.lastName} {user.firstName} {user.middleName}
                                        </h2>

                                        {userParty && (
                                            <span className={styles.partyBadge}>{userParty}</span>
                                        )}

                                        <div className={styles.userEmail}>{user.email}</div>

                                        {activeCommitteesCount > 0 && (
                                            <div className={styles.committeesCount}>
                                                {activeCommitteesCount} комиссий
                                            </div>
                                        )}
                                    </div>

                                    <div className={styles.cardFooter}>
                                        <span className={styles.moreDetails}>Подробнее →</span>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                )}
            </div>
        </>
    );
};

export default DeputiesPage;