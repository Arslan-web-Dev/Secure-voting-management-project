import { useState, useEffect, useRef } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabaseClient';
import { 
  LayoutDashboard, Vote, LogOut, Bell, Settings,
  ChevronRight, ShieldCheck, Menu, X, Clock
} from 'lucide-react';

interface NotifLog {
  id: string;
  action: string;
  timestamp: string;
}

const ACTION_LABELS: Record<string, string> = {
  VOTER_APPROVED:    '✅ Your voter registration was approved',
  VOTER_REJECTED:    '❌ Your voter registration was rejected',
  CREATOR_APPROVED:  '✅ Your creator application was approved',
  CREATOR_REJECTED:  '❌ Your creator application was rejected',
  ELECTION_APPROVED: '✅ Your election was approved',
  ELECTION_REJECTED: '❌ Your election was rejected',
  VOTE_CAST:         '🗳️ A vote was cast in your election',
};

const PAGE_TITLES: Record<string, string> = {
  '/dashboard':                  'Overview',
  '/dashboard/elections':        'Elections',
  '/dashboard/elections/create': 'Create Election',
  '/dashboard/audit':            'Audit Logs',
  '/dashboard/settings':         'Settings',
};

const DashboardLayout = () => {
  const { user, role, signOut } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showNotifs, setShowNotifs] = useState(false);
  const [notifs, setNotifs] = useState<NotifLog[]>([]);
  const notifRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Fetch recent audit logs as notifications
  useEffect(() => {
    if (!user) return;
    const fetch = async () => {
      const { data } = await supabase
        .from('audit_logs')
        .select('id, action, timestamp')
        .in('action', Object.keys(ACTION_LABELS))
        .order('timestamp', { ascending: false })
        .limit(6);
      if (data) setNotifs(data as NotifLog[]);
    };
    fetch();
  }, [user]);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifs(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const menuItems = [
    { icon: <LayoutDashboard size={20} />, label: 'Overview',    path: '/dashboard' },
    { icon: <Vote size={20} />,           label: role === 'election_creator' ? 'My Elections' : 'My Votes', path: '/dashboard/elections' },
    { icon: <ShieldCheck size={20} />,    label: 'Audit Logs',   path: '/dashboard/audit' },
    { icon: <Settings size={20} />,       label: 'Settings',     path: '/dashboard/settings' },
  ];

  // Resolve page title — handles dynamic routes like /dashboard/elections/:id/edit
  const getPageTitle = () => {
    const path = location.pathname;
    if (PAGE_TITLES[path]) return PAGE_TITLES[path];
    if (/\/dashboard\/elections\/.+\/edit/.test(path)) return 'Edit Election';
    if (/\/dashboard\/elections\/.+/.test(path)) return 'Election';
    return path.split('/').pop()?.replace(/^\w/, c => c.toUpperCase()) ?? 'Dashboard';
  };

  return (
    <div className="min-vh-100 bg-deep d-flex overflow-hidden">
      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] d-lg-none"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 w-64 border-right border-white/5 p-6 d-flex flex-column glass z-[101] transition-transform duration-300 lg:static lg:translate-x-0 ${
        isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="d-flex align-items-center justify-content-between mb-12">
          <Link to="/" className="d-flex align-items-center">
            <span className="h4 font-display fw-bold text-primary m-0">SecureVote</span>
          </Link>
          <button
            className="glass p-1.5 rounded-lg d-lg-none text-muted"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <X size={16} />
          </button>
        </div>

        <nav className="d-flex flex-column gap-2 flex-grow">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path ||
              (item.path === '/dashboard/elections' && location.pathname.startsWith('/dashboard/elections'));
            return (
              <Link 
                key={item.path}
                to={item.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`d-flex align-items-center justify-content-between p-3 rounded-xl transition-all ${
                  isActive ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-muted hover:bg-white/5'
                }`}
              >
                <div className="d-flex align-items-center gap-3">
                  {item.icon}
                  <span className="small fw-medium">{item.label}</span>
                </div>
                {isActive && <ChevronRight size={16} />}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto pt-6 border-top border-white/5 d-flex flex-column gap-4">
          <div className="d-flex align-items-center gap-3 px-2">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary d-flex align-items-center justify-content-center fw-bold">
              {user?.email?.[0].toUpperCase()}
            </div>
            <div className="overflow-hidden">
              <p className="small fw-bold m-0 text-truncate">{user?.user_metadata?.full_name || 'User'}</p>
              <p className="text-xs text-muted m-0 text-truncate capitalize">{role?.replace('_', ' ')}</p>
            </div>
          </div>
          <button 
            onClick={handleSignOut}
            className="d-flex align-items-center gap-3 p-3 rounded-xl text-error hover:bg-error/10 transition-all w-full"
          >
            <LogOut size={20} />
            <span className="small fw-medium">Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-grow min-w-0 h-screen overflow-y-auto p-4 p-md-10">
        <header className="d-flex justify-content-between align-items-center mb-10 gap-4">
          <div className="d-flex align-items-center gap-4">
            <button 
              onClick={() => setIsMobileMenuOpen(true)}
              className="glass p-2 rounded-lg d-lg-none"
            >
              <Menu size={20} />
            </button>
            <div>
              <h1 className="h4 h2-md font-display m-0">{getPageTitle()}</h1>
              <p className="text-muted small d-none d-md-block">Welcome back to your secure dashboard.</p>
            </div>
          </div>

          <div className="d-flex align-items-center gap-3">
            {/* Notification Bell */}
            <div className="position-relative" ref={notifRef}>
              <button
                onClick={() => setShowNotifs(!showNotifs)}
                className="glass p-3 rounded-xl hover:bg-white/5 position-relative transition-all"
                title="Notifications"
              >
                <Bell size={20} />
                {notifs.length > 0 && (
                  <span className="position-absolute top-0 end-0 translate-middle badge rounded-pill"
                    style={{ background: 'var(--primary)', fontSize: 9, padding: '3px 5px', transform: 'translate(30%, -30%)' }}>
                    {notifs.length}
                  </span>
                )}
              </button>

              {/* Dropdown */}
              {showNotifs && (
                <div
                  className="position-absolute end-0 mt-2 glass-card p-0 overflow-hidden"
                  style={{ width: 320, zIndex: 200, top: '100%', boxShadow: '0 20px 60px rgba(0,0,0,0.5)' }}
                >
                  <div className="d-flex align-items-center justify-content-between px-5 py-4 border-bottom border-white/5">
                    <span className="small fw-bold">Notifications</span>
                    <Link to="/dashboard/audit" onClick={() => setShowNotifs(false)}
                      className="text-primary" style={{ fontSize: 11 }}>
                      View All Logs
                    </Link>
                  </div>
                  {notifs.length === 0 ? (
                    <div className="px-5 py-8 text-center text-muted small">
                      No notifications yet.
                    </div>
                  ) : (
                    <div className="d-flex flex-column">
                      {notifs.map(n => (
                        <div key={n.id} className="px-5 py-4 border-bottom border-white/5 hover:bg-white/5 transition-all">
                          <p className="small m-0 mb-1">
                            {ACTION_LABELS[n.action] ?? n.action}
                          </p>
                          <div className="d-flex align-items-center gap-1 text-muted" style={{ fontSize: 11 }}>
                            <Clock size={11} />
                            {new Date(n.timestamp).toLocaleString()}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* User Avatar */}
            <Link to="/dashboard/settings" className="glass p-1 rounded-xl d-flex align-items-center gap-2 pr-3 hover:bg-white/5 transition-all">
              <div className="w-8 h-8 rounded-lg bg-primary d-flex align-items-center justify-content-center small fw-bold">
                {user?.email?.[0].toUpperCase()}
              </div>
              <span className="small fw-medium d-none d-lg-block">{user?.email?.split('@')[0]}</span>
            </Link>
          </div>
        </header>

        <Outlet />
      </main>
    </div>
  );
};

export default DashboardLayout;
