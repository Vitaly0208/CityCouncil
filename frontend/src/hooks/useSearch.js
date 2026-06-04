import { useState, useEffect, useCallback } from 'react';
import axiosInstance from "../../api/axiosInstance.js";


export const useSearch = (query, debounceMs = 300) => {
    const [results, setResults] = useState({ deputies: [], initiatives: [] });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!query || query.trim().length < 2) {
            setResults({ deputies: [], initiatives: [] });
            return;
        }

        setIsLoading(true);
        setError(null);

        const timer = setTimeout(async () => {
            try {
                const [deputiesRes, initiativesRes] = await Promise.all([
                    axiosInstance.get('/api/users', {
                        params: { searchTerm: query, page: 1, pageSize: 5 }
                    }),
                    axiosInstance.get('/api/initiatives', {
                        params: {status: 'Accepted', searchTerm: query, page: 1, pageSize: 5 }
                    })
                ]);

                setResults({
                    deputies: deputiesRes.data || [],
                    initiatives: initiativesRes.data || []
                });
            } catch (err) {
                setError(err.message);
                setResults({ deputies: [], initiatives: [] });
            } finally {
                setIsLoading(false);
            }
        }, debounceMs);

        return () => clearTimeout(timer);
    }, [query, debounceMs]);

    const clearResults = useCallback(() => {
        setResults({ deputies: [], initiatives: [] });
        setError(null);
    }, []);

    return { results, isLoading, error, clearResults };
};