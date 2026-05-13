import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from "./components/Auth/login/LoginPage.jsx";
import RegisterPage from "./components/Auth/Register/RegisterPage.jsx";
import { tokenService} from "../api/tokenService.js";
import DashboardPage from "./components/Home/DashboardPage.jsx";
import ProfilePage from "./components/Profile/ProfilePage.jsx";
import CommitteesPage from "./components/CommitteesPage/CommitteesPage.jsx";

const ProtectedRoute = ({ children }) =>
    tokenService.isAuthenticated() ? children : <Navigate to="/login" replace />;

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/dashboard" element={
                    <ProtectedRoute>
                        <DashboardPage />
                    </ProtectedRoute>
                } />
                <Route path="/profile" element={
                    <ProtectedRoute>
                        <ProfilePage />
                    </ProtectedRoute>
                } />
                <Route path="/committees" element={
                    <ProtectedRoute><CommitteesPage /></ProtectedRoute>
                } />
                <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;