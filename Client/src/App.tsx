import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';
import { useAuthStore } from '@/store/useAuthStore';

import AuthLayout from '@/layouts/AuthLayout';
import DashboardLayout from '@/layouts/DashboardLayout';

// Pages
import LoginPage from '@/pages/auth/LoginPage';
import SignUpPage from '@/pages/auth/SignUpPage';

// Features
import ApprovalDashboard from '@/features/admin/components/ApprovalDashboard';
import AdminOverview from '@/features/admin/components/AdminOverview';
import RequestApprovalForm from '@/features/admin/components/RequestApprovalForm';
import CreateElectionForm from '@/features/elections/components/CreateElectionForm';
import CreatorElectionsList from '@/features/elections/components/CreatorElectionsList';
import EditElection from '@/features/elections/components/EditElection';
import ViewVoters from '@/features/elections/components/ViewVoters';
import ManageCandidates from '@/features/candidates/components/ManageCandidates';
import ElectionDetails from '@/features/voting/components/ElectionDetails';
import MyPolls from '@/features/voting/components/MyPolls';
import VoterDashboard from '@/features/voting/components/VoterDashboard';
import LiveResultsDashboard from '@/features/analytics/components/LiveResultsDashboard';
import PublicLandingPage from '@/pages/LandingPage';
import { Home, Users, Settings, Vote, FileText } from 'lucide-react';

// Placeholder Pages for now
const DashboardRedirect = () => {
  const { profile } = useAuthStore();
  if (!profile) return <div>Loading...</div>;
  if (profile.role === 'super_admin') return <Navigate to="/admin" />;
  if (profile.role === 'election_creator') return <Navigate to="/creator" />;
  return <Navigate to="/voter" />;
};

const AdminLayout = () => {
  return (
    <DashboardLayout 
      title="Admin Panel" 
      links={[
        { name: 'Dashboard', path: '/admin', icon: <Home className="h-4 w-4" /> },
        { name: 'Approvals', path: '/admin/approvals', icon: <Users className="h-4 w-4" /> },
        { name: 'Audit Logs', path: '/admin/logs', icon: <FileText className="h-4 w-4" /> },
      ]} 
    />
  );
};

const CreatorLayout = () => {
  return (
    <DashboardLayout 
      title="Creator Panel" 
      links={[
        { name: 'Dashboard', path: '/creator', icon: <Home className="h-4 w-4" /> },
        { name: 'My Elections', path: '/creator/elections', icon: <Vote className="h-4 w-4" /> },
      ]} 
    />
  );
};

const VoterLayout = () => {
  return (
    <DashboardLayout 
      title="Voter Portal" 
      links={[
        { name: 'Home', path: '/voter', icon: <Home className="h-4 w-4" /> },
        { name: 'My Polls', path: '/voter/polls', icon: <Vote className="h-4 w-4" /> },
      ]} 
    />
  );
};

// Route Guards
const ProtectedRoute = ({ children, allowedRoles }: { children: React.ReactNode, allowedRoles?: string[] }) => {
  const { user, profile, isLoading } = useAuthStore();
  
  if (isLoading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (!user) return <Navigate to="/auth/login" />;
  if (allowedRoles && profile && !allowedRoles.includes(profile.role)) {
    return <Navigate to="/dashboard" />; // Redirect to their actual dashboard
  }
  
  return <>{children}</>;
};

export default function App() {
  const { setUser, fetchProfile, isLoading } = useAuthStore();

  useEffect(() => {
    // Initial session check
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        useAuthStore.setState({ isLoading: false });
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        useAuthStore.setState({ isLoading: false });
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  if (isLoading) return <div className="min-h-screen flex items-center justify-center">Initializing App...</div>;

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<PublicLandingPage />} />
        
        {/* Auth Routes */}
        <Route path="/auth" element={<AuthLayout />}>
          <Route path="login" element={<LoginPage />} />
          <Route path="signup" element={<SignUpPage />} />
        </Route>

        {/* Dashboard Routing logic */}
        <Route path="/dashboard" element={<ProtectedRoute><DashboardRedirect /></ProtectedRoute>} />
        
        {/* Admin Routes */}
        <Route path="/admin" element={
          <ProtectedRoute allowedRoles={['super_admin']}>
            <AdminLayout />
          </ProtectedRoute>
        }>
          <Route index element={<AdminOverview />} />
          <Route path="approvals" element={<ApprovalDashboard />} />
        </Route>

        {/* Creator Routes */}
        <Route path="/creator" element={
          <ProtectedRoute allowedRoles={['election_creator', 'super_admin']}>
            <CreatorLayout />
          </ProtectedRoute>
        }>
          <Route index element={
            <div className="max-w-2xl">
              <h2 className="text-2xl font-bold mb-6">Creator Dashboard</h2>
              <RequestApprovalForm />
            </div>
          } />
          <Route path="elections" element={<CreatorElectionsList />} />
          <Route path="elections/new" element={<CreateElectionForm />} />
          <Route path="elections/:id/edit" element={<EditElection />} />
          <Route path="elections/:id/voters" element={<ViewVoters />} />
          <Route path="elections/:id" element={<ManageCandidates />} />
          <Route path="elections/:id/results" element={<LiveResultsDashboard />} />
        </Route>

        {/* Voter Routes */}
        <Route path="/voter" element={
          <ProtectedRoute allowedRoles={['voter']}>
            <VoterLayout />
          </ProtectedRoute>
        }>
          <Route index element={<VoterDashboard />} />
          <Route path="polls" element={<MyPolls />} />
          <Route path="polls/:id" element={<ElectionDetails />} />
          <Route path="polls/:id/results" element={<LiveResultsDashboard />} />
        </Route>

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}
