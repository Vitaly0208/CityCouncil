import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from './App.jsx';
import './index.css';

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 5 * 60 * 1000, // Данные считаются "свежими" 5 минут
            retry: 1,                 // Повторять запрос 1 раз при ошибке
            refetchOnWindowFocus: false, // Не перезапрашивать данные при возврате на вкладку
        },
    },
});

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <QueryClientProvider client={queryClient}>
                <App />
        </QueryClientProvider>
    </React.StrictMode>
);