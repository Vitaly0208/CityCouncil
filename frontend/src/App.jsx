import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from "./components/Auth/login/LoginPage.jsx";
import RegisterPage from "./components/Auth/Register/RegisterPage.jsx";
import { tokenService} from "../api/tokenService.js";
import DashboardPage from "./components/Home/DashboardPage.jsx";
import ProfilePage from "./components/Profile/ProfilePage.jsx";
import CommitteesPage from "./components/Committees/CommitteesPage/CommitteesPage.jsx";
import AdminPage from "./components/Admin/AdminPage.jsx";
import InitiativesPage from "./components/InitiativesPage/InitiativesPage.jsx";
import CommitteeDetailsPage from "./components/Committees/CommitteeDetail/CommitteeDetailPage.jsx";
import SessionDetailPage from "./components/Sessions/SessionDetailPage/SessionDetailPage.jsx";
import SessionsPage from "./components/Sessions/SessionsPage/SessionsPage.jsx";
import DeputiesPage from "./components/Deputies/DeputiesPage.jsx";
import PartiesPage from "./components/Parties/PartiesPage/PartiesPage.jsx";
import PartyDetailsPage from "./components/Parties/PartyDetailsPage/PartyDetailsPage.jsx";
import SessionProtocolPage from "./components/Sessions/SessionProtocolPage/SessionProtocolPage.jsx";
import Footer from "./components/Footer/Footer.jsx";

// Оставляем вашу логику защиты
const ProtectedRoute = ({ children }) =>
    tokenService.isAuthenticated() ? children : <Navigate to="/login" replace />;

function App() {
    return (
        <BrowserRouter>
            <Routes>

                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />

                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/initiatives" element={<InitiativesPage />} />
                <Route path="/sessions" element={<SessionsPage />} />
                <Route path="/sessions/:id" element={<SessionDetailPage />} />
                <Route path="/sessions/:id/protocol" element={<SessionProtocolPage />} />
                <Route path="/committees" element={<CommitteesPage />} />
                <Route path="/committees/:id" element={<CommitteeDetailsPage />} />
                <Route path="/parties" element={<PartiesPage />} />
                <Route path="/parties/:id" element={<PartyDetailsPage />} />

                <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
                <Route path="/profile/:userId" element={<ProfilePage />} />
                <Route path="/deputies" element={<DeputiesPage />} />
                <Route path="/admin" element={<ProtectedRoute requiredRole="Admin"><AdminPage /></ProtectedRoute>} />

                <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>

            <Footer />
        </BrowserRouter>
    );
}

export default App;