import { useState, useEffect } from 'react';
import { ratingService} from "../../api/apiService.js";

export const useLeaderboard = () => {
    const [leaderboard, setLeaderboard] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {

        const fetchLeaderboard = async () => {
            try {
                setIsLoading(true);
                const data = await ratingService.getLeaderboard(1000);

                if (!data) {
                    setLeaderboard([]);
                } else if (!Array.isArray(data)) {
                    setLeaderboard([]);
                } else {
                    setLeaderboard(data);
                }
            } catch (err) {
                setError(err);
                setLeaderboard([]);
            } finally {
                setIsLoading(false);
                console.log("[useLeaderboard] Загрузка завершена. isLoading = false");
            }
        };

        fetchLeaderboard();
    }, []);

    return { leaderboard, isLoading, error };
};