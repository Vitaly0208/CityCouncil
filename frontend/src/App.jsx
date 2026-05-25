import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from "./components/Auth/login/LoginPage.jsx";
import RegisterPage from "./components/Auth/Register/RegisterPage.jsx";
import { tokenService} from "../api/tokenService.js";
import DashboardPage from "./components/Home/DashboardPage.jsx";
import ProfilePage from "./components/Profile/ProfilePage.jsx";
import CommitteesPage from "./components/CommitteesPage/CommitteesPage.jsx";
import AdminPage from "./components/Admin/AdminPage.jsx";
import InitiativesPage from "./components/InitiativesPage/InitiativesPage.jsx";
import CommitteeDetailsPage from "./components/CommitteeDetail/CommitteeDetailPage.jsx";
import SessionDetailPage from "./components/Sessions/SessionDetailPage/SessionDetailPage.jsx";
import SessionsPage from "./components/Sessions/SessionsPage/SessionsPage.jsx";
import DeputiesPage from "./components/Deputies/DeputiesPage.jsx";

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
                <Route path="/parties" element={<ProtectedRoute><div>Страница партий</div></ProtectedRoute>} />
                <Route path="/deputies" element={<ProtectedRoute><DeputiesPage /></ProtectedRoute>} />
                <Route path="/elections" element={<ProtectedRoute><div>Страница выборов</div></ProtectedRoute>} />
                <Route path="*" element={<Navigate to="/login" replace />} />
                <Route path="/initiatives" element={<ProtectedRoute><InitiativesPage /></ProtectedRoute>} />
                <Route path="/admin" element={
                    <ProtectedRoute requiredRole="Admin"><AdminPage /></ProtectedRoute>
                } />
                <Route path="/committees" element={
                    <ProtectedRoute><CommitteesPage /></ProtectedRoute>
                } />
                <Route path="/committees/:id" element={
                    <ProtectedRoute><CommitteeDetailsPage /></ProtectedRoute>
                } />
                <Route path="/sessions" element={<ProtectedRoute><SessionsPage /></ProtectedRoute>} />
                <Route path="/sessions/:id" element={<ProtectedRoute><SessionDetailPage /></ProtectedRoute>} />

            </Routes>
        </BrowserRouter>
    );
}

export default App;