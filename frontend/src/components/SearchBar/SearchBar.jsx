import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSearch } from '../../hooks/useSearch';
import styles from './SearchBar.module.css';

const SearchBar = ({ className = '' }) => {
    const [query, setQuery] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const [activeIndex, setActiveIndex] = useState(-1);

    const navigate = useNavigate();
    const { results, isLoading, error, clearResults } = useSearch(query);
    const containerRef = useRef(null);
    const inputRef = useRef(null);

    const allResults = [...results.deputies, ...results.initiatives];

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (containerRef.current && !containerRef.current.contains(e.target)) {
                setIsOpen(false);
                setActiveIndex(-1);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        if (query.trim().length >= 2) {
            setIsOpen(true);
        } else {
            setIsOpen(false);
            clearResults();
        }
        setActiveIndex(-1);
    }, [query, clearResults]);

    const handleKeyDown = (e) => {
        if (!isOpen) return;

        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setActiveIndex(prev => Math.min(prev + 1, allResults.length - 1));
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setActiveIndex(prev => Math.max(prev - 1, 0));
        } else if (e.key === 'Enter' && activeIndex >= 0) {
            e.preventDefault();
            handleResultClick(allResults[activeIndex]);
        } else if (e.key === 'Escape') {
            setIsOpen(false);
            setActiveIndex(-1);
        }
    };

    const handleResultClick = (item) => {
        const path = item.type === 'deputy'
            ? `/profile/${item.id}`
            : `/initiatives/${item.id}`;
        navigate(path);
        setQuery('');
        setIsOpen(false);
        clearResults();
        inputRef.current?.blur();
    };

    const handleChange = (e) => {
        setQuery(e.target.value);
    };

    const handleClear = () => {
        setQuery('');
        clearResults();
        setIsOpen(false);
        inputRef.current?.focus();
    };

    return (
        <div className={`${styles.container} ${className}`} ref={containerRef}>
            <div className={styles.inputWrapper}>
                <svg className={styles.searchIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <circle cx="11" cy="11" r="8" strokeWidth="2"/>
                    <path d="M21 21l-4.35-4.35" strokeWidth="2" strokeLinecap="round"/>
                </svg>

                <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={handleChange}
                    onKeyDown={handleKeyDown}
                    onFocus={() => query.trim().length >= 2 && setIsOpen(true)}
                    placeholder="Поиск депутатов, инициатив..."
                    className={styles.input}
                    aria-label="Поиск"
                    aria-expanded={isOpen}
                    aria-controls="search-results"
                />

                {query && (
                    <button
                        type="button"
                        onClick={handleClear}
                        className={styles.clearBtn}
                        aria-label="Очистить поиск"
                    >
                        ×
                    </button>
                )}

                {isLoading && <div className={styles.loadingSpinner}></div>}
            </div>

            {isOpen && (
                <div
                    id="search-results"
                    className={styles.dropdown}
                    role="listbox"
                    aria-label="Результаты поиска"
                >
                    {error ? (
                        <div className={styles.error}>Ошибка загрузки: {error}</div>
                    ) : allResults.length === 0 && query.trim().length >= 2 ? (
                        <div className={styles.empty}>Ничего не найдено</div>
                    ) : (
                        <>
                            {results.deputies.length > 0 && (
                                <div className={styles.section}>
                                    <div className={styles.sectionTitle}>Депутаты</div>
                                    {results.deputies.map((deputy, idx) => (
                                        <button
                                            key={`deputy-${deputy.id}`}
                                            className={`${styles.resultItem} ${activeIndex === results.deputies.indexOf(deputy) ? styles.active : ''}`}
                                            onClick={() => handleResultClick({ ...deputy, type: 'deputy' })}
                                            role="option"
                                            aria-selected={activeIndex === results.deputies.indexOf(deputy)}
                                        >
                                            <span className={styles.resultName}>
                                                {deputy.lastName} {deputy.firstName} {deputy.middleName}
                                            </span>
                                            <span className={styles.resultMeta}>{deputy.roleName}</span>
                                        </button>
                                    ))}
                                </div>
                            )}

                            {results.initiatives.length > 0 && (
                                <div className={styles.section}>
                                    <div className={styles.sectionTitle}>Инициативы</div>
                                    {results.initiatives.map((init, idx) => {
                                        const globalIdx = results.deputies.length + idx;
                                        return (
                                            <button
                                                key={`init-${init.id}`}
                                                className={`${styles.resultItem} ${activeIndex === globalIdx ? styles.active : ''}`}
                                                onClick={() => handleResultClick({ ...init, type: 'initiative' })}
                                                role="option"
                                                aria-selected={activeIndex === globalIdx}
                                            >
                                                <span className={styles.resultName}>{init.title}</span>
                                                <span className={styles.resultMeta}>
                                                    {init.authorName}
                                                </span>
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                        </>
                    )}
                </div>
            )}
        </div>
    );
};

export default SearchBar;