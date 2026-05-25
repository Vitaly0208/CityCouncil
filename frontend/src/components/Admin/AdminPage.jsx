import { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { tokenService } from '../../../api/tokenService';
import { useInitiatives, useReviewInitiative } from "../../hooks/useInitiatives.js";
import { useCreateSessionWithQueue } from "../../hooks/useSessions.js";
import { useCommittees, useCreateCommittee, useDeleteCommittee, useAppointChairman } from "../../hooks/useCommittees.js";
import { useUsers, useUsersByCommittee, useAddUserToCommittee, useRemoveUserFromCommittee } from "../../hooks/UseUsers.js";
import styles from './AdminPage.module.css';
import Navbar from "../Layout/NaVbar/NavBar.jsx";

const AdminPage = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('moderation');

    const [selectedUser, setSelectedUser] = useState(null);
    const [showCommissionModal, setShowCommissionModal] = useState(false);
    const [showChairmanModal, setShowChairmanModal] = useState(false);

    const [news, setNews] = useState(() => {
        try { return JSON.parse(localStorage.getItem('admin_news')) || []; }
        catch { return []; }
    });
    const [newsForm, setNewsForm] = useState({ title: '', content: '' });

    const [initSearch, setInitSearch] = useState('');
    const [sessionForm, setSessionForm] = useState({ title: '', heldAt: '', location: '', committeeId: '' });
    const [committeeForm, setCommitteeForm] = useState({ name: '', specialization: '', description: '' });

    const [userFilter, setUserFilter] = useState({ committeeId: '', search: '' });
    const [visibleUsers, setVisibleUsers] = useState(10);

    const { initiatives: pendingInitiatives, isLoading: loadPending } = useInitiatives({ status: 'PendingReview' });
    const { initiatives: approvedInitiatives, isLoading: loadApproved } = useInitiatives({ status: 'Accepted' });
    const { committees, isLoading: loadCommittees } = useCommittees();

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
        try {
            await createSessionMutation.mutateAsync({
                ...sessionForm,
                heldAt: new Date(sessionForm.heldAt).toISOString()
            });
            setSessionForm({ title: '', heldAt: '', location: '', committeeId: '' });
            alert('✅ Заседание создано!');
        } catch (err) {
            alert('❌ Ошибка: ' + err.message);
        }
    };

    const handleCreateCommittee = async (e) => {
        e.preventDefault();
        try {
            await createCommitteeMutation.mutateAsync(committeeForm);
            setCommitteeForm({ name: '', specialization: '', description: '' });
            alert('✅ Комиссия создана');
        } catch (err) {
            alert('❌ Ошибка: ' + err.message);
        }
    };

    const handleDeleteCommittee = async (id, name) => {
        if (!confirm(`Удалить комиссию "${name}"?\nЭто действие необратимо.`)) return;
        try {
            await deleteCommitteeMutation.mutateAsync(id);
            alert('✅ Комиссия удалена');
        } catch (err) {
            alert('❌ Ошибка: ' + err.message);
        }
    };

    const handleAddUserToCommittee = async (userId, committeeId) => {
        try {
            await addUserToCommittee.mutateAsync({ userId, committeeId });
        } catch (err) {
            alert('❌ Ошибка: ' + (err.message || 'Не удалось добавить'));
        }
    };

    const handleRemoveUserFromCommittee = async (userId, committeeId) => {
        try {
            await removeUserFromCommittee.mutateAsync({ userId, committeeId });
        } catch (err) {
            alert('❌ Ошибка: ' + (err.message || 'Не удалось удалить'));
        }
    };

    const handleAppointChairman = async (userId, committeeId) => {
        try {
            await appointChairman.mutateAsync({ userId, committeeId });
            setShowChairmanModal(false);
            alert('✅ Пользователь назначен председателем');
        } catch (err) {
            alert('❌ Ошибка: ' + (err.message || 'Не удалось назначить'));
        }
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
        { id: 'deputies', label: 'Пользователи' },
        { id: 'Initiatives', label: 'Инициативы' },
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

    if (loadPending || loadCommittees) {
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

                    {/* Модерация */}
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

                    {/* Комиссии */}
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
                                <button type="submit" className={styles.primaryBtn} disabled={createCommitteeMutation.isPending}>
                                    {createCommitteeMutation.isPending ? 'Создание...' : 'Создать комиссию'}
                                </button>
                            </form>
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

                    {/* Пользователи */}
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
                                                    <h3>{selectedUser.middleName} {selectedUser.firstName} {selectedUser.lastName}</h3>
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

                            {/* Модалка управления комиссиями */}
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

                            {/* Модалка назначения председателя */}
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
                                                        disabled={appointChairman.isPending} // ✅ ИСПРАВЛЕНО
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

                    {/* Заседания */}
                    {activeTab === 'sessions' && (
                        <section className={styles.section}>
                            <h2 className={styles.sectionTitle}>Новое заседание</h2>
                            <form onSubmit={handleCreateSession} className={styles.sessionForm}>
                                <div className={styles.formGrid}>
                                    <input type="text" placeholder="Название" value={sessionForm.title} onChange={e => setSessionForm({...sessionForm, title: e.target.value})} required />
                                    <input type="datetime-local" value={sessionForm.heldAt} onChange={e => setSessionForm({...sessionForm, heldAt: e.target.value})} required />
                                    <input type="text" placeholder="Место" value={sessionForm.location} onChange={e => setSessionForm({...sessionForm, location: e.target.value})} />
                                    <input type="text" placeholder="ID Комиссии" value={sessionForm.committeeId} onChange={e => setSessionForm({...sessionForm, committeeId: e.target.value})} required />
                                </div>
                                <button type="submit" className={styles.primaryBtn} disabled={createSessionMutation.isPending}>
                                    {createSessionMutation.isPending ? 'Создание...' : 'Создать заседание'}
                                </button>
                            </form>
                        </section>
                    )}

                    {/* Утверждённые */}
                    {activeTab === 'Initiatives' && (
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

                    {/* Новости */}
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