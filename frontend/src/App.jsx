import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from "./Pages/Auth/login/LoginPage.jsx";
import RegisterPage from "./Pages/Auth/Register/RegisterPage.jsx";
import { tokenService} from "../api/tokenService.js";
import DashboardPage from "./Pages/Home/DashboardPage.jsx";
import ProfilePage from "./Pages/Profile/ProfilePage.jsx";
import CommitteesPage from "./Pages/Committees/CommitteesPage/CommitteesPage.jsx";
import AdminPage from "./Pages/Admin/AdminPage.jsx";
import InitiativesPage from "./Pages/InitiativesPage/InitiativesPage.jsx";
import CommitteeDetailsPage from "./Pages/Committees/CommitteeDetail/CommitteeDetailPage.jsx";
import SessionDetailPage from "./Pages/Sessions/SessionDetailPage/SessionDetailPage.jsx";
import SessionsPage from "./Pages/Sessions/SessionsPage/SessionsPage.jsx";
import DeputiesPage from "./Pages/Deputies/DeputiesPage.jsx";
import PartiesPage from "./Pages/Parties/PartiesPage/PartiesPage.jsx";
import PartyDetailsPage from "./Pages/Parties/PartyDetailsPage/PartyDetailsPage.jsx";
import SessionProtocolPage from "./Pages/Sessions/SessionProtocolPage/SessionProtocolPage.jsx";
import Footer from "./components/Footer/Footer.jsx";

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