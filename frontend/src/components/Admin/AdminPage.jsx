import { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { tokenService } from '../../../api/tokenService';
import { useInitiatives, useReviewInitiative } from "../../hooks/useInitiatives.js";
import { useCreateSessionWithQueue } from "../../hooks/useSessions.js";
import { useCommittees, useCreateCommittee, useDeleteCommittee, useAppointChairman } from "../../hooks/useCommittees.js";
import { useUsers, useUsersByCommittee, useAddUserToCommittee, useRemoveUserFromCommittee } from "../../hooks/UseUsers.js";
import { useParties, useCreateParty, useDeleteParty, useJoinParty, useLeaveParty } from "../../hooks/useParties.js";
import styles from './AdminPage.module.css';
import Navbar from "../Layout/NaVbar/NavBar.jsx";

const AdminPage = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('moderation');

    const [selectedUser, setSelectedUser] = useState(null);
    const [selectedPartyUser, setSelectedPartyUser] = useState(null);

    const [showCommissionModal, setShowCommissionModal] = useState(false);
    const [showChairmanModal, setShowChairmanModal] = useState(false);
    const [showChairmanSelectModal, setShowChairmanSelectModal] = useState(false);

    const [showPartyModal, setShowPartyModal] = useState(false);
    const [showPartyMemberModal, setShowPartyMemberModal] = useState(false);
    const [showPartyLeaderSelectModal, setShowPartyLeaderSelectModal] = useState(false);

    const [news, setNews] = useState(() => {
        try { return JSON.parse(localStorage.getItem('admin_news')) || []; }
        catch { return []; }
    });
    const [newsForm, setNewsForm] = useState({ title: '', content: '' });

    const [initSearch, setInitSearch] = useState('');
    const [sessionForm, setSessionForm] = useState({ title: '', heldAt: '', location: '', committeeId: '' });
    const [committeeForm, setCommitteeForm] = useState({ name: '', specialization: '', description: '', chairmanId: '', chairmanName: '' });
    const [partyForm, setPartyForm] = useState({ name: '', abbreviation: '', ideology: '', description: '', leaderId: '', leaderName: '' });

    const [userFilter, setUserFilter] = useState({ committeeId: '', search: '' });
    const [visibleUsers, setVisibleUsers] = useState(10);

    const { initiatives: pendingInitiatives, isLoading: loadPending } = useInitiatives({ status: 'PendingReview' });
    const { initiatives: approvedInitiatives, isLoading: loadApproved } = useInitiatives({ status: 'Accepted' });
    const { committees, isLoading: loadCommittees } = useCommittees();
    const { parties, isLoading: loadParties } = useParties();

    const { data: allUsers = [], isLoading: loadUsers } = useUsers({
        searchTerm: userFilter.search || undefined
    });

    const { data: committeeUsers = [] } = useUsersByCommittee(userFilter.committeeId || null);

    const reviewMutation = useReviewInitiative();
    const createSessionMutation = useCreateSessionWithQueue();
    const createCommitteeMutation = useCreateCommittee();
    const deleteCommitteeMutation = useDeleteCommittee();
    const addUserToCommittee = useAddUserToCommittee();
    const removeUserFromCommittee = useRemoveUserFromCommittee();
    const appointChairman = useAppointChairman();

    const createPartyMutation = useCreateParty();
    const deletePartyMutation = useDeleteParty();
    const joinParty = useJoinParty();
    const leaveParty = useLeaveParty();

    useEffect(() => {
        localStorage.setItem('admin_news', JSON.stringify(news));
    }, [news]);

    const filteredUsers = useMemo(() => {
        let users = userFilter.committeeId ? committeeUsers : allUsers;
        if (userFilter.search) {
            const q = userFilter.search.toLowerCase();
            users = users.filter(u =>
                u.firstName?.toLowerCase().includes(q) ||
                u.lastName?.toLowerCase().includes(q) ||
                u.email?.toLowerCase().includes(q)
            );
        }
        return users;
    }, [allUsers, committeeUsers, userFilter]);

    const displayedUsers = filteredUsers.slice(0, visibleUsers);

    const filteredApproved = useMemo(() => {
        if (!initSearch) return approvedInitiatives || [];
        const q = initSearch.toLowerCase();
        return (approvedInitiatives || []).filter(i =>
            i.title?.toLowerCase().includes(q) ||
            i.authorName?.toLowerCase().includes(q) ||
            i.description?.toLowerCase().includes(q)
        );
    }, [approvedInitiatives, initSearch]);

    const handleLogout = () => {
        tokenService.clearTokens();
        navigate('/login');
    };

    const handleReview = async (id, isApproved) => {
        try {
            await reviewMutation.mutateAsync({ id, isApproved });
        } catch (err) {
            console.error('Ошибка модерации:', err);
        }
    };

    const handleCreateSession = async (e) => {
        e.preventDefault();
        if (!sessionForm.committeeId) {
            alert('Выберите комиссию');
            return;
        }
        try {
            await createSessionMutation.mutateAsync({
                ...sessionForm,
                heldAt: new Date(sessionForm.heldAt).toISOString()
            });
            setSessionForm({ title: '', heldAt: '', location: '', committeeId: '' });
            alert('Заседание создано!');
        } catch (err) {
            alert('Ошибка: ' + err.message);
        }
    };

    const handleCreateCommittee = async (e) => {
        e.preventDefault();
        try {
            await createCommitteeMutation.mutateAsync({
                name: committeeForm.name,
                specialization: committeeForm.specialization,
                description: committeeForm.description,
                chairmanId: committeeForm.chairmanId || undefined
            });
            setCommitteeForm({ name: '', specialization: '', description: '', chairmanId: '', chairmanName: '' });
            alert('Комиссия создана');
        } catch (err) {
            alert('Ошибка: ' + err.message);
        }
    };

    const handleCreateParty = async (e) => {
        e.preventDefault();
        try {
            await createPartyMutation.mutateAsync({
                name: partyForm.name,
                abbreviation: partyForm.abbreviation,
                ideology: partyForm.ideology,
                description: partyForm.description,
                leaderId: partyForm.leaderId || undefined
            });
            setPartyForm({ name: '', abbreviation: '', ideology: '', description: '', leaderId: '', leaderName: '' });
            alert('Партия создана');
        } catch (err) {
            alert('Ошибка: ' + err.message);
        }
    };

    const handleDeleteCommittee = async (id, name) => {
        if (!confirm(`Удалить комиссию "${name}"?\nЭто действие необратимо.`)) return;
        try {
            await deleteCommitteeMutation.mutateAsync(id);
            alert('Комиссия удалена');
        } catch (err) {
            alert('Ошибка: ' + err.message);
        }
    };

    const handleDeleteParty = async (id, name) => {
        if (!confirm(`Удалить партию "${name}"?\nЭто действие необратимо.`)) return;
        try {
            await deletePartyMutation.mutateAsync(id);
            alert('Партия удалена');
        } catch (err) {
            alert('Ошибка: ' + err.message);
        }
    };

    const handleAddUserToCommittee = async (userId, committeeId) => {
        try {
            await addUserToCommittee.mutateAsync({ userId, committeeId });
        } catch (err) {
            alert('Ошибка: ' + (err.message || 'Не удалось добавить'));
        }
    };

    const handleRemoveUserFromCommittee = async (userId, committeeId) => {
        try {
            await removeUserFromCommittee.mutateAsync({ userId, committeeId });
        } catch (err) {
            alert('Ошибка: ' + (err.message || 'Не удалось удалить'));
        }
    };

    const handleJoinParty = async (userId, partyId) => {
        try {
            await joinParty.mutateAsync({ userId, partyId });
        } catch (err) {
            alert('Ошибка: ' + (err.message || 'Не удалось добавить'));
        }
    };

    const handleLeaveParty = async (userId, partyId) => {
        try {
            await leaveParty.mutateAsync({ userId, partyId });
        } catch (err) {
            alert('Ошибка: ' + (err.message || 'Не удалось удалить'));
        }
    };

    const handleAppointChairman = async (userId, committeeId) => {
        try {
            await appointChairman.mutateAsync({ userId, committeeId });
            setShowChairmanModal(false);
            alert('Пользователь назначен председателем');
        } catch (err) {
            alert('Ошибка: ' + (err.message || 'Не удалось назначить'));
        }
    };

    const handleAppointPartyLeader = async (userId, partyId) => {
        try {
            await joinParty.mutateAsync({ userId, partyId });
            setShowPartyMemberModal(false);
            alert('Пользователь назначен лидером партии');
        } catch (err) {
            alert('Ошибка: ' + (err.message || 'Не удалось назначить'));
        }
    };

    const handleSelectChairman = (userId, fullName) => {
        setCommitteeForm(prev => ({ ...prev, chairmanId: userId, chairmanName: fullName }));
        setShowChairmanSelectModal(false);
    };

    const handleSelectPartyLeader = (userId, fullName) => {
        setPartyForm(prev => ({ ...prev, leaderId: userId, leaderName: fullName }));
        setShowPartyLeaderSelectModal(false);
    };

    const handleAddNews = (e) => {
        e.preventDefault();
        if (!newsForm.title.trim() || !newsForm.content.trim()) return;
        const newItem = {
            id: Date.now().toString(),
            title: newsForm.title,
            content: newsForm.content,
            createdAt: new Date().toISOString()
        };
        setNews(prev => [newItem, ...prev]);
        setNewsForm({ title: '', content: '' });
    };

    const handleDeleteNews = (id) => {
        setNews(prev => prev.filter(n => n.id !== id));
    };

    const tabs = [
        { id: 'moderation', label: `Модерация (${pendingInitiatives?.length || 0})` },
        { id: 'sessions', label: 'Заседания' },
        { id: 'committees', label: 'Комиссии' },
        { id: 'parties', label: 'Партии' },
        { id: 'deputies', label: 'Пользователи' },
        { id: 'approved', label: 'Инициативы' },
        { id: 'news', label: 'Новости' },
    ];

    const getStatusBadge = (status) => {
        const map = {
            PendingReview: { text: 'На проверке', class: styles.badgePending },
            Accepted: { text: 'Принята', class: styles.badgeAccepted },
            Rejected: { text: 'Отклонена', class: styles.badgeRejected },
        };
        const s = map[status] || { text: status, class: '' };
        return <span className={`${styles.badge} ${s.class}`}>{s.text}</span>;
    };

    if (loadPending || loadCommittees || loadParties) {
        return <div className={styles.container}><div className={styles.loading}>Загрузка панели...</div></div>;
    }

    return (
        <>
            <Navbar onLogout={handleLogout} />
            <div className={styles.container}>
                <main className={styles.main}>
                    <nav className={styles.tabsContainer}>
                        <div className={styles.tabs}>
                            {tabs.map(tab => (
                                <button
                                    key={tab.id}
                                    className={`${styles.tab} ${activeTab === tab.id ? styles.tabActive : ''}`}
                                    onClick={() => setActiveTab(tab.id)}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>
                    </nav>

                    {activeTab === 'moderation' && (
                        <section className={styles.section}>
                            <h2 className={styles.sectionTitle}>Ожидают проверки</h2>
                            {pendingInitiatives?.length === 0 ? <div className={styles.empty}>Все инициативы обработаны</div> :
                                <div className={styles.list}>
                                    {pendingInitiatives?.map(init => (
                                        <div key={init.id} className={styles.reviewCard}>
                                            <div className={styles.reviewInfo}>
                                                <h3>{init.title}</h3>
                                                <p>{init.description}</p>
                                                <span className={styles.meta}>Автор: {init.authorName} • {new Date(init.createdAt).toLocaleDateString('ru-RU')}</span>
                                            </div>
                                            <div className={styles.reviewActions}>
                                                <button className={styles.approveBtn} onClick={() => handleReview(init.id, true)}>Одобрить</button>
                                                <button className={styles.rejectBtn} onClick={() => handleReview(init.id, false)}>Отклонить</button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            }
                        </section>
                    )}

                    {activeTab === 'committees' && (
                        <section className={styles.section}>
                            <h2 className={styles.sectionTitle}>Управление комиссиями</h2>
                            <form onSubmit={handleCreateCommittee} className={styles.committeeForm}>
                                <h3>Новая комиссия</h3>
                                <div className={styles.formGrid}>
                                    <input type="text" placeholder="Название комиссии" value={committeeForm.name} onChange={e => setCommitteeForm({...committeeForm, name: e.target.value})} required />
                                    <input type="text" placeholder="Специализация" value={committeeForm.specialization} onChange={e => setCommitteeForm({...committeeForm, specialization: e.target.value})} required />
                                </div>
                                <textarea placeholder="Описание" value={committeeForm.description} onChange={e => setCommitteeForm({...committeeForm, description: e.target.value})} rows={2} />
                                <div className={styles.chairmanSelectWrapper}>
                                    <label className={styles.chairmanLabel}>Председатель:</label>
                                    {committeeForm.chairmanName ? (
                                        <div className={styles.chairmanSelected}>
                                            <span>{committeeForm.chairmanName}</span>
                                            <button type="button" className={styles.chairmanChangeBtn} onClick={() => setShowChairmanSelectModal(true)}>Изменить</button>
                                        </div>
                                    ) : (
                                        <button type="button" className={styles.chairmanSelectBtn} onClick={() => setShowChairmanSelectModal(true)}>
                                            Выбрать председателя
                                        </button>
                                    )}
                                </div>
                                <button type="submit" className={styles.primaryBtn} disabled={createCommitteeMutation.isPending}>
                                    {createCommitteeMutation.isPending ? 'Создание...' : 'Создать комиссию'}
                                </button>
                            </form>

                            {showChairmanSelectModal && (
                                <div className={styles.modalOverlay}>
                                    <div className={styles.modal}>
                                        <h3 className={styles.modalTitle}>Выберите председателя</h3>
                                        <input
                                            type="text"
                                            placeholder="Поиск пользователя..."
                                            className={styles.modalSearch}
                                            value={userFilter.search}
                                            onChange={e => setUserFilter({...userFilter, search: e.target.value})}
                                        />
                                        <div className={styles.userSelectList}>
                                            {loadUsers ? (
                                                <div className={styles.loadingSmall}>Загрузка...</div>
                                            ) : (
                                                filteredUsers.slice(0, 20).map(user => (
                                                    <button
                                                        key={user.id}
                                                        className={styles.userSelectItem}
                                                        onClick={() => handleSelectChairman(user.id, `${user.lastName} ${user.firstName} ${user.middleName || ''}`.trim())}
                                                    >
                                                        <span className={styles.userSelectName}>
                                                            {user.lastName} {user.firstName} {user.middleName}
                                                        </span>
                                                        <span className={styles.userSelectEmail}>{user.email}</span>
                                                    </button>
                                                ))
                                            )}
                                        </div>
                                        <div className={styles.modalActions}>
                                            <button className={styles.modalCloseBtn} onClick={() => setShowChairmanSelectModal(false)}>
                                                Отмена
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {committees?.length === 0 ? <div className={styles.empty}>Комиссии не найдены</div> :
                                <div className={styles.committeesList}>
                                    {committees?.map(c => (
                                        <div key={c.id} className={styles.committeeRow}>
                                            <div className={styles.committeeInfo}>
                                                <h4>{c.name}</h4>
                                                <span className={styles.meta}>{c.specialization}</span>
                                                {c.description && <p className={styles.desc}>{c.description}</p>}
                                            </div>
                                            <div className={styles.committeeActions}>
                                                <Link to={`/committees/${c.id}`} className={styles.linkBtn}>Просмотр</Link>
                                                <button className={styles.deleteBtn} onClick={() => handleDeleteCommittee(c.id, c.name)} disabled={deleteCommitteeMutation.isPending}>Удалить</button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            }
                        </section>
                    )}

                    {activeTab === 'parties' && (
                        <section className={styles.section}>
                            <h2 className={styles.sectionTitle}>Управление партиями</h2>
                            <form onSubmit={handleCreateParty} className={styles.partyForm}>
                                <h3>Новая партия</h3>
                                <div className={styles.formGrid}>
                                    <input type="text" placeholder="Название партии" value={partyForm.name} onChange={e => setPartyForm({...partyForm, name: e.target.value})} required />
                                    <input type="text" placeholder="Аббревиатура" value={partyForm.abbreviation} onChange={e => setPartyForm({...partyForm, abbreviation: e.target.value})} />
                                </div>
                                <input type="text" placeholder="Идеология" value={partyForm.ideology} onChange={e => setPartyForm({...partyForm, ideology: e.target.value})} />
                                <textarea placeholder="Описание" value={partyForm.description} onChange={e => setPartyForm({...partyForm, description: e.target.value})} rows={2} />
                                <div className={styles.chairmanSelectWrapper}>
                                    <label className={styles.chairmanLabel}>Лидер партии:</label>
                                    {partyForm.leaderName ? (
                                        <div className={styles.chairmanSelected}>
                                            <span>{partyForm.leaderName}</span>
                                            <button type="button" className={styles.chairmanChangeBtn} onClick={() => setShowPartyLeaderSelectModal(true)}>Изменить</button>
                                        </div>
                                    ) : (
                                        <button type="button" className={styles.chairmanSelectBtn} onClick={() => setShowPartyLeaderSelectModal(true)}>
                                            Выбрать лидера
                                        </button>
                                    )}
                                </div>
                                <button type="submit" className={styles.primaryBtn} disabled={createPartyMutation.isPending}>
                                    {createPartyMutation.isPending ? 'Создание...' : 'Создать партию'}
                                </button>
                            </form>

                            {showPartyLeaderSelectModal && (
                                <div className={styles.modalOverlay}>
                                    <div className={styles.modal}>
                                        <h3 className={styles.modalTitle}>Выберите лидера партии</h3>
                                        <input
                                            type="text"
                                            placeholder="Поиск пользователя..."
                                            className={styles.modalSearch}
                                            value={userFilter.search}
                                            onChange={e => setUserFilter({...userFilter, search: e.target.value})}
                                        />
                                        <div className={styles.userSelectList}>
                                            {loadUsers ? (
                                                <div className={styles.loadingSmall}>Загрузка...</div>
                                            ) : (
                                                filteredUsers.slice(0, 20).map(user => (
                                                    <button
                                                        key={user.id}
                                                        className={styles.userSelectItem}
                                                        onClick={() => handleSelectPartyLeader(user.id, `${user.lastName} ${user.firstName} ${user.middleName || ''}`.trim())}
                                                    >
                                                        <span className={styles.userSelectName}>
                                                            {user.lastName} {user.firstName} {user.middleName}
                                                        </span>
                                                        <span className={styles.userSelectEmail}>{user.email}</span>
                                                    </button>
                                                ))
                                            )}
                                        </div>
                                        <div className={styles.modalActions}>
                                            <button className={styles.modalCloseBtn} onClick={() => setShowPartyLeaderSelectModal(false)}>
                                                Отмена
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {parties?.length === 0 ? <div className={styles.empty}>Партии не найдены</div> :
                                <div className={styles.committeesList}>
                                    {parties?.map(p => (
                                        <div key={p.id} className={styles.committeeRow}>
                                            <div className={styles.committeeInfo}>
                                                <h4>{p.name} {p.abbreviation && `(${p.abbreviation})`}</h4>
                                                <span className={styles.meta}>{p.ideology || 'Идеология не указана'}</span>
                                                {p.description && <p className={styles.desc}>{p.description}</p>}
                                            </div>
                                            <div className={styles.committeeActions}>
                                                <Link to={`/parties/${p.id}`} className={styles.linkBtn}>Просмотр</Link>
                                                <button className={styles.deleteBtn} onClick={() => handleDeleteParty(p.id, p.name)} disabled={deletePartyMutation.isPending}>Удалить</button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            }
                        </section>
                    )}

                    {activeTab === 'deputies' && (
                        <section className={styles.section}>
                            <h2 className={styles.sectionTitle}>Пользователи</h2>

                            <div className={styles.filters}>
                                <select
                                    value={userFilter.committeeId}
                                    onChange={e => setUserFilter({...userFilter, committeeId: e.target.value})}
                                    className={styles.selectInput}
                                >
                                    <option value="">Все пользователи</option>
                                    {committees?.map(c => (
                                        <option key={c.id} value={c.id}>{c.name}</option>
                                    ))}
                                </select>
                                <input
                                    type="text"
                                    placeholder="Поиск..."
                                    value={userFilter.search}
                                    onChange={e => setUserFilter({...userFilter, search: e.target.value})}
                                    className={styles.searchInput}
                                />
                            </div>

                            <div className={styles.usersLayout}>
                                <aside className={styles.usersListPanel}>
                                    {loadUsers ? (
                                        <div className={styles.loading}>Загрузка...</div>
                                    ) : displayedUsers.length === 0 ? (
                                        <div className={styles.empty}>Пользователи не найдены</div>
                                    ) : (
                                        <>
                                            <div className={styles.usersList}>
                                                {displayedUsers.map(u => {
                                                    const isSelected = selectedUser?.id === u.id;
                                                    const isInCommittee = userFilter.committeeId &&
                                                        (u.committeesMemberships?.some(m =>
                                                            m.committeeId === userFilter.committeeId && !m.dismissedAt
                                                        ) || committeeUsers?.some(cu => cu.id === u.id));

                                                    return (
                                                        <button
                                                            key={u.id}
                                                            className={`${styles.userListItem} ${isSelected ? styles.selected : ''}`}
                                                            onClick={() => setSelectedUser(u)}
                                                        >
                                                            <div className={styles.userListItemContent}>
                                                                <span className={styles.userName}>
                                                                    {u.firstName} {u.lastName}
                                                                </span>
                                                                <span className={styles.userEmail}>{u.email}</span>
                                                            </div>
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                            {filteredUsers.length > visibleUsers && (
                                                <button
                                                    className={styles.loadMoreBtn}
                                                    onClick={() => setVisibleUsers(prev => prev + 10)}
                                                >
                                                    Показать ещё
                                                </button>
                                            )}
                                        </>
                                    )}
                                </aside>

                                <aside className={styles.userDetailPanel}>
                                    {!selectedUser ? (
                                        <div className={styles.placeholder}>
                                            <p>Выберите пользователя из списка</p>
                                            <p className={styles.placeholderHint}>для просмотра информации и управления</p>
                                        </div>
                                    ) : (
                                        <div className={styles.userDetail}>
                                            <div className={styles.userDetailHeader}>
                                                <div>
                                                    <h3>{selectedUser.firstName} {selectedUser.lastName}</h3>
                                                    {selectedUser.middleName && (
                                                        <span className={styles.userMiddleName}>{selectedUser.middleName}</span>
                                                    )}
                                                </div>
                                                <span className={styles.roleBadge}>{selectedUser.role?.name || 'Пользователь'}</span>
                                            </div>

                                            <dl className={styles.userDetailInfo}>
                                                <dt>Email</dt>
                                                <dd>{selectedUser.email}</dd>

                                                {(selectedUser.homePhone || selectedUser.workPhone) && (
                                                    <>
                                                        <dt>Телефоны</dt>
                                                        <dd className={styles.phoneList}>
                                                            {selectedUser.homePhone && (
                                                                <span className={styles.phoneItem}>Home: {selectedUser.homePhone}</span>
                                                            )}
                                                            {selectedUser.workPhone && (
                                                                <span className={styles.phoneItem}>Work: {selectedUser.workPhone}</span>
                                                            )}
                                                        </dd>
                                                    </>
                                                )}

                                                {selectedUser.committeesMemberships?.length > 0 && (
                                                    <>
                                                        <dt>Комиссии</dt>
                                                        <dd className={styles.commissionList}>
                                                            {selectedUser.committeesMemberships
                                                                .filter(m => !m.dismissedAt)
                                                                .map(m => (
                                                                    <span
                                                                        key={m.committeeId}
                                                                        className={`${styles.commissionTag} ${m.isChairman ? styles.chairmanTag : ''}`}
                                                                    >
                                                                        {m.committee?.name}
                                                                        {m.isChairman && ' (пред.)'}
                                                                    </span>
                                                                ))}
                                                        </dd>
                                                    </>
                                                )}

                                                {selectedUser.partyMemberships?.length > 0 && (
                                                    <>
                                                        <dt>Партии</dt>
                                                        <dd className={styles.commissionList}>
                                                            {selectedUser.partyMemberships
                                                                .filter(m => !m.dismissedAt)
                                                                .map(m => (
                                                                    <span key={m.partyId} className={styles.commissionTag}>
                                                                        {m.party?.name}
                                                                    </span>
                                                                ))}
                                                        </dd>
                                                    </>
                                                )}

                                                {selectedUser.initiatives?.filter(i => i.status === 'Accepted')?.length > 0 && (
                                                    <>
                                                        <dt>Принятые инициативы</dt>
                                                        <dd className={styles.initiativeList}>
                                                            {selectedUser.initiatives
                                                                .filter(i => i.status === 'Accepted')
                                                                .slice(0, 5)
                                                                .map(i => (
                                                                    <Link
                                                                        key={i.id}
                                                                        to={`/initiatives/${i.id}`}
                                                                        className={styles.initiativeLink}
                                                                    >
                                                                        {i.title}
                                                                    </Link>
                                                                ))}
                                                        </dd>
                                                    </>
                                                )}
                                            </dl>

                                            <div className={styles.userDetailActions}>
                                                <button
                                                    className={styles.manageCommitteesBtn}
                                                    onClick={() => setShowCommissionModal(true)}
                                                >
                                                    Управление комиссиями
                                                </button>
                                                <button
                                                    className={styles.manageCommitteesBtn}
                                                    onClick={() => setShowPartyModal(true)}
                                                >
                                                    Управление партиями
                                                </button>

                                                {selectedUser.committeesMemberships?.some(m => !m.dismissedAt) && (
                                                    <button
                                                        className={styles.chairmanBtn}
                                                        onClick={() => setShowChairmanModal(true)}
                                                        disabled={!selectedUser.committeesMemberships?.some(m => !m.dismissedAt && !m.isChairman)}
                                                    >
                                                        Сделать председателем
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </aside>
                            </div>

                            {showCommissionModal && selectedUser && (
                                <div className={styles.modalOverlay}>
                                    <div className={styles.modal}>
                                        <h3 className={styles.modalTitle}>Комиссии: {selectedUser.firstName} {selectedUser.lastName}</h3>

                                        <div className={styles.modalCommissionList}>
                                            {committees?.map(c => {
                                                const membership = selectedUser.committeesMemberships?.find(
                                                    m => m.committeeId === c.id && !m.dismissedAt
                                                );
                                                const isChairman = membership?.isChairman;

                                                return (
                                                    <div key={c.id} className={styles.modalCommissionItem}>
                                                        <span className={styles.modalCommissionName}>{c.name}</span>
                                                        <div className={styles.modalCommissionActions}>
                                                            {membership ? (
                                                                <>
                                                                    <span className={styles.memberBadge}>
                                                                        {isChairman ? 'Председатель' : 'Участник'}
                                                                    </span>
                                                                    <button
                                                                        className={styles.removeSmallBtn}
                                                                        onClick={() => handleRemoveUserFromCommittee(selectedUser.id, c.id)}
                                                                        disabled={removeUserFromCommittee.isPending}
                                                                    >
                                                                        ✕
                                                                    </button>
                                                                </>
                                                            ) : (
                                                                <button
                                                                    className={styles.addSmallBtn}
                                                                    onClick={() => handleAddUserToCommittee(selectedUser.id, c.id)}
                                                                    disabled={addUserToCommittee.isPending}
                                                                >
                                                                    + Добавить
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>

                                        <div className={styles.modalActions}>
                                            <button
                                                className={styles.modalCloseBtn}
                                                onClick={() => setShowCommissionModal(false)}
                                            >
                                                Закрыть
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {showPartyModal && selectedUser && (
                                <div className={styles.modalOverlay}>
                                    <div className={styles.modal}>
                                        <h3 className={styles.modalTitle}>Партии: {selectedUser.firstName} {selectedUser.lastName}</h3>

                                        <div className={styles.modalCommissionList}>
                                            {parties?.map(p => {
                                                const membership = selectedUser.partyMemberships?.find(
                                                    m => m.partyId === p.id && !m.dismissedAt
                                                );

                                                return (
                                                    <div key={p.id} className={styles.modalCommissionItem}>
                                                        <span className={styles.modalCommissionName}>{p.name}</span>
                                                        <div className={styles.modalCommissionActions}>
                                                            {membership ? (
                                                                <>
                                                                    <span className={styles.memberBadge}>Участник</span>
                                                                    <button
                                                                        className={styles.removeSmallBtn}
                                                                        onClick={() => handleLeaveParty(selectedUser.id, p.id)}
                                                                        disabled={leaveParty.isPending}
                                                                    >
                                                                        ✕
                                                                    </button>
                                                                </>
                                                            ) : (
                                                                <button
                                                                    className={styles.addSmallBtn}
                                                                    onClick={() => handleJoinParty(selectedUser.id, p.id)}
                                                                    disabled={joinParty.isPending}
                                                                >
                                                                    + Вступить
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>

                                        <div className={styles.modalActions}>
                                            <button
                                                className={styles.modalCloseBtn}
                                                onClick={() => setShowPartyModal(false)}
                                            >
                                                Закрыть
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {showChairmanModal && selectedUser && (
                                <div className={styles.modalOverlay}>
                                    <div className={styles.modal}>
                                        <h3 className={styles.modalTitle}>Назначение председателя</h3>
                                        <p className={styles.modalText}>
                                            Выберите комиссию, в которой {selectedUser.firstName} {selectedUser.lastName} станет председателем:
                                        </p>

                                        <div className={styles.chairmanSelectList}>
                                            {selectedUser.committeesMemberships
                                                ?.filter(m => !m.dismissedAt && !m.isChairman)
                                                .map(m => (
                                                    <button
                                                        key={m.committeeId}
                                                        className={styles.chairmanSelectItem}
                                                        onClick={() => handleAppointChairman(selectedUser.id, m.committeeId)}
                                                        disabled={appointChairman.isPending}
                                                    >
                                                        {m.committee?.name}
                                                    </button>
                                                ))}
                                        </div>

                                        <div className={styles.modalActions}>
                                            <button
                                                className={styles.modalCloseBtn}
                                                onClick={() => setShowChairmanModal(false)}
                                            >
                                                Отмена
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </section>
                    )}

                    {activeTab === 'sessions' && (
                        <section className={styles.section}>
                            <h2 className={styles.sectionTitle}>Новое заседание</h2>
                            <form onSubmit={handleCreateSession} className={styles.sessionForm}>
                                <div className={styles.formGrid}>
                                    <input type="text" placeholder="Название" value={sessionForm.title} onChange={e => setSessionForm({...sessionForm, title: e.target.value})} required />
                                    <input type="datetime-local" value={sessionForm.heldAt} onChange={e => setSessionForm({...sessionForm, heldAt: e.target.value})} required />
                                    <input type="text" placeholder="Место" value={sessionForm.location} onChange={e => setSessionForm({...sessionForm, location: e.target.value})} />

                                    <select
                                        value={sessionForm.committeeId}
                                        onChange={e => setSessionForm({...sessionForm, committeeId: e.target.value})}
                                        className={styles.selectInput}
                                        required
                                    >
                                        <option value="">Выберите комиссию</option>
                                        {committees?.map(c => (
                                            <option key={c.id} value={c.id}>{c.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <button type="submit" className={styles.primaryBtn} disabled={createSessionMutation.isPending}>
                                    {createSessionMutation.isPending ? 'Создание...' : 'Создать заседание'}
                                </button>
                            </form>
                        </section>
                    )}

                    {activeTab === 'approved' && (
                        <section className={styles.section}>
                            <h2 className={styles.sectionTitle}>Утверждённые инициативы</h2>
                            <input type="text" placeholder="Поиск..." value={initSearch} onChange={e => setInitSearch(e.target.value)} className={styles.searchInput} />
                            {filteredApproved.length === 0 ? <div className={styles.empty}>Инициативы не найдены</div> :
                                <div className={styles.initiativesList}>
                                    {filteredApproved.map(init => (
                                        <div key={init.id} className={styles.initiativeRow}>
                                            <div className={styles.initiativeInfo}>
                                                <h4>{init.title}</h4>
                                                <span className={styles.meta}>Автор: {init.authorName}</span>
                                            </div>
                                            {getStatusBadge(init.status)}
                                        </div>
                                    ))}
                                </div>
                            }
                        </section>
                    )}

                    {activeTab === 'news' && (
                        <section className={styles.section}>
                            <h2 className={styles.sectionTitle}>Управление новостями</h2>
                            <form onSubmit={handleAddNews} className={styles.newsForm}>
                                <input type="text" placeholder="Заголовок" value={newsForm.title} onChange={e => setNewsForm({...newsForm, title: e.target.value})} required />
                                <textarea placeholder="Содержание" value={newsForm.content} onChange={e => setNewsForm({...newsForm, content: e.target.value})} rows={3} required />
                                <button type="submit" className={styles.primaryBtn}>Опубликовать</button>
                            </form>
                            <div className={styles.newsList}>
                                {news.length === 0 ? <div className={styles.empty}>Новостей нет</div> :
                                    news.map(item => (
                                        <div key={item.id} className={styles.newsCard}>
                                            <div className={styles.newsContent}>
                                                <h4>{item.title}</h4>
                                                <p>{item.content}</p>
                                                <time>{new Date(item.createdAt).toLocaleString('ru-RU')}</time>
                                            </div>
                                            <button className={styles.deleteBtn} onClick={() => handleDeleteNews(item.id)}>Удалить</button>
                                        </div>
                                    ))
                                }
                            </div>
                        </section>
                    )}
                </main>
            </div>
        </>
    );
};

export default AdminPage;