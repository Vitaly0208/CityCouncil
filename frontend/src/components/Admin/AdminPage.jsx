import { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { tokenService } from '../../../api/tokenService';
import { useInitiatives, useReviewInitiative } from "../../hooks/useInitiatives.js";
import { useCreateSessionWithQueue } from "../../hooks/useSessions.js";
import { useCommittees } from "../../hooks/useCommittees.js";
import styles from './AdminPage.module.css';

// 📋 Моковые данные депутатов (заменятся на API-хук при наличии бэка)
const MOCK_DEPUTIES = [
    { id: 'd1', name: 'Иванов И.И.', party: 'Партия Развития', commission: 'Транспорт', role: 'Председатель', joined: '2024-01-15' },
    { id: 'd2', name: 'Петрова А.С.', party: 'Гражданский Альянс', commission: 'Экология', role: 'Зам. председателя', joined: '2023-11-02' },
    { id: 'd3', name: 'Сидоров К.М.', party: 'Партия Развития', commission: 'Транспорт', role: 'Член', joined: '2025-03-10' },
    { id: 'd4', name: 'Козлова Е.В.', party: 'Независимые', commission: 'Культура', role: 'Член', joined: '2024-06-20' },
];

const AdminPage = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('moderation');

    // 📜 Новости (хранение в localStorage)
    const [news, setNews] = useState(() => {
        try {
            return JSON.parse(localStorage.getItem('admin_news')) || [];
        } catch { return []; }
    });
    const [newsForm, setNewsForm] = useState({ title: '', content: '' });

    // 🏛️ Депутаты
    const [deputyFilter, setDeputyFilter] = useState({ commission: '', party: '' });

    // 🔍 Утверждённые инициативы
    const [initSearch, setInitSearch] = useState('');

    const [sessionForm, setSessionForm] = useState({ title: '', heldAt: '', location: '', committeeId: '' });

    //  Хуки
    const { initiatives: pendingInitiatives, isLoading: loadPending } = useInitiatives({ status: 'PendingReview' });
    const { initiatives: approvedInitiatives, isLoading: loadApproved } = useInitiatives({ status: 'Accepted' });
    const { committees, isLoading: loadCommittees } = useCommittees();

    const reviewMutation = useReviewInitiative();
    const createSessionMutation = useCreateSessionWithQueue();

    // 💾 Синхронизация новостей с localStorage
    useEffect(() => {
        localStorage.setItem('admin_news', JSON.stringify(news));
    }, [news]);

    // 📋 Фильтрация депутатов
    const filteredDeputies = useMemo(() => {
        return MOCK_DEPUTIES.filter(d =>
            (!deputyFilter.commission || d.commission === deputyFilter.commission) &&
            (!deputyFilter.party || d.party === deputyFilter.party)
        );
    }, [deputyFilter]);

    // 🔎 Фильтрация утверждённых инициатив
    const filteredApproved = useMemo(() => {
        if (!initSearch) return approvedInitiatives;
        const q = initSearch.toLowerCase();
        return approvedInitiatives.filter(i =>
            i.title.toLowerCase().includes(q) ||
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
            alert('✅ Заседание создано! Топ-3 инициативы добавлены в повестку.');
        } catch (err) {
            console.error('Ошибка создания заседания:', err);
            alert('❌ Не удалось создать заседание. Проверьте данные.');
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

    // 🗂️ Список вкладок
    const tabs = [
        { id: 'moderation', label: `Модерация (${pendingInitiatives.length})` },
        { id: 'sessions', label: 'Создание заседания' },
        { id: 'news', label: 'Новости' },
        { id: 'deputies', label: 'Депутаты' },
        { id: 'approved', label: 'Утверждённые' },
        { id: 'committees', label: 'Комиссии' },
    ];

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <div className={styles.headerLeft}>
                    <Link to="/dashboard" className={styles.backBtn}>← На главную</Link>
                    <h1 className={styles.headerTitle}>Панель администратора</h1>
                </div>
                <button className={styles.logoutBtn} onClick={handleLogout}>Выйти</button>
            </header>

            <main className={styles.main}>
                {/* Навигация по вкладкам */}
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
                        {loadPending ? <div className={styles.loading}>Загрузка...</div> :
                            pendingInitiatives.length === 0 ? <div className={styles.empty}>Все инициативы обработаны</div> :
                                <div className={styles.list}>
                                    {pendingInitiatives.map(init => (
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

                {/*  Создание заседания */}
                {activeTab === 'sessions' && (
                    <section className={styles.section}>
                        <h2 className={styles.sectionTitle}>Новое заседание с очередью</h2>
                        <p className={styles.hint}>При создании автоматически добавятся 3 самые старые одобренные инициативы.</p>
                        <form onSubmit={handleCreateSession} className={styles.sessionForm}>
                            <div className={styles.formGrid}>
                                <input type="text" placeholder="Название заседания" value={sessionForm.title} onChange={e => setSessionForm({...sessionForm, title: e.target.value})} required />
                                <input type="datetime-local" value={sessionForm.heldAt} onChange={e => setSessionForm({...sessionForm, heldAt: e.target.value})} required />
                                <input type="text" placeholder="Место проведения" value={sessionForm.location} onChange={e => setSessionForm({...sessionForm, location: e.target.value})} />
                                <input type="text" placeholder="ID Комиссии (GUID)" value={sessionForm.committeeId} onChange={e => setSessionForm({...sessionForm, committeeId: e.target.value})} required />
                            </div>
                            <button type="submit" className={styles.primaryBtn} disabled={createSessionMutation.isPending}>
                                {createSessionMutation.isPending ? 'Создание...' : '🚀 Создать и добавить топ-3 из очереди'}
                            </button>
                        </form>
                    </section>
                )}

                {activeTab === 'news' && (
                    <section className={styles.section}>
                        <h2 className={styles.sectionTitle}>Управление новостями</h2>
                        <form onSubmit={handleAddNews} className={styles.newsForm}>
                            <input type="text" placeholder="Заголовок новости" value={newsForm.title} onChange={e => setNewsForm({...newsForm, title: e.target.value})} required />
                            <textarea placeholder="Содержание новости" value={newsForm.content} onChange={e => setNewsForm({...newsForm, content: e.target.value})} rows={3} required />
                            <button type="submit" className={styles.primaryBtn}>📢 Опубликовать</button>
                        </form>
                        <div className={styles.newsList}>
                            {news.length === 0 ? <div className={styles.empty}>Новостей пока нет</div> :
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

                {/*  Депутаты */}
                {activeTab === 'deputies' && (
                    <section className={styles.section}>
                        <h2 className={styles.sectionTitle}>Список депутатов</h2>
                        <div className={styles.filters}>
                            <select value={deputyFilter.commission} onChange={e => setDeputyFilter({...deputyFilter, commission: e.target.value})}>
                                <option value="">Все комиссии</option>
                                {[...new Set(MOCK_DEPUTIES.map(d => d.commission))].map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                            <select value={deputyFilter.party} onChange={e => setDeputyFilter({...deputyFilter, party: e.target.value})}>
                                <option value="">Все партии</option>
                                {[...new Set(MOCK_DEPUTIES.map(d => d.party))].map(p => <option key={p} value={p}>{p}</option>)}
                            </select>
                        </div>
                        <div className={styles.deputiesGrid}>
                            {filteredDeputies.map(d => (
                                <div key={d.id} className={styles.deputyCard}>
                                    <div className={styles.deputyHeader}>
                                        <h4>{d.name}</h4>
                                        <span className={styles.roleBadge}>{d.role}</span>
                                    </div>
                                    <dl className={styles.deputyDetails}>
                                        <dt>Партия</dt><dd>{d.party}</dd>
                                        <dt>Комиссия</dt><dd>{d.commission}</dd>
                                        <dt>С</dt><dd>{new Date(d.joined).toLocaleDateString('ru-RU')}</dd>
                                    </dl>
                                </div>
                            ))}
                            {filteredDeputies.length === 0 && <div className={styles.empty}>Депутаты не найдены</div>}
                        </div>
                    </section>
                )}

                {/* ✅ Утверждённые инициативы */}
                {activeTab === 'approved' && (
                    <section className={styles.section}>
                        <h2 className={styles.sectionTitle}>Утверждённые инициативы</h2>
                        <div className={styles.searchBar}>
                            <input type="text" placeholder="🔍 Поиск по названию, автору или описанию..." value={initSearch} onChange={e => setInitSearch(e.target.value)} />
                        </div>
                        {loadApproved ? <div className={styles.loading}>Загрузка...</div> :
                            filteredApproved.length === 0 ? <div className={styles.empty}>Инициативы не найдены</div> :
                                <div className={styles.initiativesList}>
                                    {filteredApproved.map(init => (
                                        <div key={init.id} className={styles.initiativeRow}>
                                            <div className={styles.initiativeInfo}>
                                                <h4>{init.title}</h4>
                                                <span className={styles.meta}>Автор: {init.authorName} • {new Date(init.createdAt).toLocaleDateString('ru-RU')}</span>
                                            </div>
                                            <span className={`${styles.badge} ${styles.badgeAccepted}`}>Принята</span>
                                        </div>
                                    ))}
                                </div>
                        }
                    </section>
                )}

                {/* 🏛️ Комиссии */}
                {activeTab === 'committees' && (
                    <section className={styles.section}>
                        <h2 className={styles.sectionTitle}>Комиссии городского совета</h2>
                        {loadCommittees ? <div className={styles.loading}>Загрузка...</div> :
                            committees.length === 0 ? <div className={styles.empty}>Комиссии не найдены</div> :
                                <div className={styles.committeesList}>
                                    {committees.map(c => (
                                        <Link key={c.id} to={`/committees/${c.id}`} className={styles.committeeRow}>
                                            <div className={styles.committeeInfo}>
                                                <h4>{c.name}</h4>
                                                <span className={styles.meta}>{c.specialization} • {c.memberCount ?? 0} членов</span>
                                            </div>
                                            <div className={styles.committeeStats}>
                                                {c.upcomingSessions?.length > 0 && <span>📅 {c.upcomingSessions.length} заседаний</span>}
                                                {c.initiatives?.length > 0 && <span>📝 {c.initiatives.length} инициатив</span>}
                                                <span className={styles.arrow}>→</span>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                        }
                    </section>
                )}
            </main>
        </div>
    );
};

export default AdminPage;