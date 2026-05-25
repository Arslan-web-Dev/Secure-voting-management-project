import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import LandingPage from './pages/LandingPage.tsx';
import Login from './pages/Login.tsx';
import Signup from './pages/Signup.tsx';
import ForgotPassword from './pages/ForgotPassword.tsx';
import ResetPassword from './pages/ResetPassword.tsx';
import BrowseElections from './pages/BrowseElections.tsx';
import About from './pages/About.tsx';
import NotFound from './pages/NotFound.tsx';
import DashboardLayout from './layouts/DashboardLayout.tsx';
import AdminDashboard from './pages/admin/AdminDashboard.tsx';
import CreatorDashboard from './pages/creator/CreatorDashboard.tsx';
import VoterDashboard from './pages/voter/VoterDashboard.tsx';
import ElectionCreation from './pages/creator/ElectionCreation.tsx';
import ElectionEdit from './pages/creator/ElectionEdit.tsx';
import ElectionDetails from './pages/ElectionDetails.tsx';
import VotingPage from './pages/VotingPage.tsx';
import ResultsDashboard from './pages/ResultsDashboard.tsx';
import AuditLogs from './pages/AuditLogs.tsx';
import Settings from './pages/Settings.tsx';
import CustomCursor from './components/CustomCursor.tsx';
import { Toaster } from 'sonner';

function App() {
  const { user, loading, role } = useAuth();

  if (loading) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center bg-deep">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <Router>
      <Toaster position="top-center" richColors />
      <CustomCursor />
      <Routes>
        {/* Public pages */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/elections" element={<BrowseElections />} />
        <Route path="/about" element={<About />} />
        <Route path="/election/:id" element={<ElectionDetails />} />
        <Route path="/election/:id/vote" element={<VotingPage />} />
        <Route path="/election/:id/results" element={<ResultsDashboard />} />

        {/* Auth pages - redirect if already logged in */}
        <Route path="/login" element={!user ? <Login /> : <Navigate to="/dashboard" />} />
        <Route path="/signup" element={!user ? <Signup /> : <Navigate to="/dashboard" />} />
        <Route path="/forgot-password" element={!user ? <ForgotPassword /> : <Navigate to="/dashboard" />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* Legacy admin redirect */}
        <Route path="/admin/*" element={<Navigate to={user ? '/dashboard' : '/login'} replace />} />

        {/* Protected Dashboard */}
        <Route path="/dashboard" element={user ? <DashboardLayout /> : <Navigate to="/login" />}>
          <Route index element={
            role === 'super_admin' ? <AdminDashboard /> :
            role === 'election_creator' ? <CreatorDashboard /> :
            <VoterDashboard />
          } />
          <Route path="elections" element={
            role === 'super_admin' ? <AdminDashboard /> :
            role === 'election_creator' ? <CreatorDashboard /> :
            <VoterDashboard />
          } />
          <Route path="elections/create" element={<ElectionCreation />} />
          <Route path="elections/:id/edit" element={<ElectionEdit />} />
          <Route path="audit" element={<AuditLogs />} />
          <Route path="settings" element={<Settings />} />
        </Route>

        {/* 404 - catch all */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default App;
