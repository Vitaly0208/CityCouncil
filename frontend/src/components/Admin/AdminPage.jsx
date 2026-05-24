import { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { tokenService } from '../../../api/tokenService';
import { useInitiatives, useReviewInitiative } from "../../hooks/useInitiatives.js";
import { useCreateSessionWithQueue } from "../../hooks/useSessions.js";
import { useCommittees, useCreateCommittee, useDeleteCommittee } from "../../hooks/useCommittees.js";
import styles from './AdminPage.module.css';
import Navbar from "../Layout/NaVbar/NavBar.jsx";

const AdminPage = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('moderation');

    // 📜 Новости
    const [news, setNews] = useState(() => {
        try { return JSON.parse(localStorage.getItem('admin_news')) || []; }
        catch { return []; }
    });
    const [newsForm, setNewsForm] = useState({ title: '', content: '' });

    // 🔍 Инициативы
    const [initSearch, setInitSearch] = useState('');

    // 🏛️ Заседания
    const [sessionForm, setSessionForm] = useState({ title: '', heldAt: '', location: '', committeeId: '' });

    // ➕ Новая комиссия
    const [committeeForm, setCommitteeForm] = useState({ name: '', specialization: '', description: '' });

    // 🪝 Хуки данных
    const { initiatives: pendingInitiatives, isLoading: loadPending } = useInitiatives({ status: 'PendingReview' });
    const { initiatives: approvedInitiatives, isLoading: loadApproved } = useInitiatives({ status: 'Accepted' });
    const { committees, isLoading: loadCommittees, refetch: refetchCommittees } = useCommittees();

    const reviewMutation = useReviewInitiative();
    const createSessionMutation = useCreateSessionWithQueue();
    const createCommitteeMutation = useCreateCommittee();
    const deleteCommitteeMutation = useDeleteCommittee();

    // 💾 Новости в localStorage
    useEffect(() => {
        localStorage.setItem('admin_news', JSON.stringify(news));
    }, [news]);


    // 🔎 Фильтрация утверждённых инициатив
    const filteredApproved = useMemo(() => {
        if (!initSearch) return approvedInitiatives || [];
        const q = initSearch.toLowerCase();
        return (approvedInitiatives || []).filter(i =>
            i.title?.toLowerCase().includes(q) ||
            i.authorName?.toLowerCase().includes(q) ||
            i.description?.toLowerCase().includes(q)
        );
    }, [approvedInitiatives, initSearch]);

    // 🛠️ Хэндлеры
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

    // 🗂️ Вкладки
    const tabs = [
        { id: 'moderation', label: `Модерация (${pendingInitiatives?.length || 0})` },
        { id: 'sessions', label: 'Заседания' },
        { id: 'committees', label: 'Комиссии' },
        { id: 'deputies', label: 'Депутаты' },
        { id: 'approved', label: 'Утверждённые' },
        { id: 'news', label: 'Новости' },
    ];

    // 🎨 Утилиты
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
                    {/* Навигация */}
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

                    {/* 📝 Модерация */}
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
                                                <button className={styles.approveBtn} onClick={() => handleReview(init.id, true)}>✅ Одобрить</button>
                                                <button className={styles.rejectBtn} onClick={() => handleReview(init.id, false)}>❌ Отклонить</button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            }
                        </section>
                    )}

                    {/* 🏛️ Комиссии — с созданием и удалением */}
                    {activeTab === 'committees' && (
                        <section className={styles.section}>
                            <h2 className={styles.sectionTitle}>Управление комиссиями</h2>

                            {/* Форма создания */}
                            <form onSubmit={handleCreateCommittee} className={styles.committeeForm}>
                                <h3>➕ Новая комиссия</h3>
                                <div className={styles.formGrid}>
                                    <input
                                        type="text"
                                        placeholder="Название комиссии"
                                        value={committeeForm.name}
                                        onChange={e => setCommitteeForm({...committeeForm, name: e.target.value})}
                                        required
                                    />
                                    <input
                                        type="text"
                                        placeholder="Специализация"
                                        value={committeeForm.specialization}
                                        onChange={e => setCommitteeForm({...committeeForm, specialization: e.target.value})}
                                        required
                                    />
                                </div>
                                <textarea
                                    placeholder="Описание"
                                    value={committeeForm.description}
                                    onChange={e => setCommitteeForm({...committeeForm, description: e.target.value})}
                                    rows={2}
                                />
                                <button type="submit" className={styles.primaryBtn} disabled={createCommitteeMutation.isPending}>
                                    {createCommitteeMutation.isPending ? 'Создание...' : 'Создать комиссию'}
                                </button>
                            </form>

                            {/* Список комиссий */}
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
                                                <button
                                                    className={styles.deleteBtn}
                                                    onClick={() => handleDeleteCommittee(c.id, c.name)}
                                                    disabled={deleteCommitteeMutation.isPending}
                                                >
                                                    🗑️ Удалить
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            }
                        </section>
                    )}

                    {/* 👥 Депутаты — теперь из API */}
                    {/*{activeTab === 'deputies' && (*/}
                    {/*    <section className={styles.section}>*/}
                    {/*        <h2 className={styles.sectionTitle}>Депутаты городского совета</h2>*/}

                    {/*        /!* Фильтры *!/*/}
                    {/*        <div className={styles.filters}>*/}
                    {/*            <input*/}
                    {/*                type="text"*/}
                    {/*                placeholder="🔍 Поиск по имени или email..."*/}
                    {/*                value={deputyFilter.search}*/}
                    {/*                onChange={e => setDeputyFilter({...deputyFilter, search: e.target.value})}*/}
                    {/*                className={styles.searchInput}*/}
                    {/*            />*/}
                    {/*            <select*/}
                    {/*                value={deputyFilter.party}*/}
                    {/*                onChange={e => setDeputyFilter({...deputyFilter, party: e.target.value})}*/}
                    {/*            >*/}
                    {/*                <option value="">Все партии</option>*/}
                    {/*                {[...new Set(users.map(u => u.partyName).filter(Boolean))].map(party =>*/}
                    {/*                    <option key={party} value={party}>{party}</option>*/}
                    {/*                )}*/}
                    {/*            </select>*/}
                    {/*        </div>*/}

                    {/*        /!* Список *!/*/}
                    {/*        {loadUsers ? <div className={styles.loading}>Загрузка...</div> :*/}
                    {/*            filteredDeputies.length === 0 ? <div className={styles.empty}>Депутаты не найдены</div> :*/}
                    {/*                <div className={styles.deputiesGrid}>*/}
                    {/*                    {filteredDeputies.map(u => (*/}
                    {/*                        <div key={u.id} className={styles.deputyCard}>*/}
                    {/*                            <div className={styles.deputyHeader}>*/}
                    {/*                                <h4>{u.fullName || u.email}</h4>*/}
                    {/*                                {u.partyName && <span className={styles.partyBadge}>{u.partyName}</span>}*/}
                    {/*                            </div>*/}
                    {/*                            <dl className={styles.deputyDetails}>*/}
                    {/*                                <dt>Email</dt><dd>{u.email}</dd>*/}
                    {/*                                {u.commissionName && <><dt>Комиссия</dt><dd>{u.commissionName}</dd></>}*/}
                    {/*                                {u.role && <><dt>Роль</dt><dd>{u.role}</dd></>}*/}
                    {/*                            </dl>*/}
                    {/*                        </div>*/}
                    {/*                    ))}*/}
                    {/*                </div>*/}
                    {/*        }*/}
                    {/*    </section>*/}
                    {/*)}*/}

                    {/* 🗓️ Создание заседания */}
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
                                    {createSessionMutation.isPending ? 'Создание...' : '🚀 Создать заседание'}
                                </button>
                            </form>
                        </section>
                    )}

                    {/* ✅ Утверждённые инициативы */}
                    {activeTab === 'approved' && (
                        <section className={styles.section}>
                            <h2 className={styles.sectionTitle}>Утверждённые инициативы</h2>
                            <input type="text" placeholder="🔍 Поиск..." value={initSearch} onChange={e => setInitSearch(e.target.value)} className={styles.searchInput} />
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

                    {/* 📢 Новости */}
                    {activeTab === 'news' && (
                        <section className={styles.section}>
                            <h2 className={styles.sectionTitle}>Управление новостями</h2>
                            <form onSubmit={handleAddNews} className={styles.newsForm}>
                                <input type="text" placeholder="Заголовок" value={newsForm.title} onChange={e => setNewsForm({...newsForm, title: e.target.value})} required />
                                <textarea placeholder="Содержание" value={newsForm.content} onChange={e => setNewsForm({...newsForm, content: e.target.value})} rows={3} required />
                                <button type="submit" className={styles.primaryBtn}>📢 Опубликовать</button>
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
                                            <button className={styles.deleteBtn} onClick={() => handleDeleteNews(item.id)}>🗑️</button>
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