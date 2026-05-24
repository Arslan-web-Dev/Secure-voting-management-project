import { useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';

import { useAuth } from '../hooks/useAuth';
import { 
  LayoutDashboard, 
  Vote, 
  LogOut, 
  Bell, 
  Settings,
  ChevronRight,
  ShieldCheck,
  Menu
} from 'lucide-react';

const DashboardLayout = () => {
  const { user, role, signOut } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const menuItems = [
    { icon: <LayoutDashboard size={20} />, label: 'Overview', path: '/dashboard' },
    { icon: <Vote size={20} />, label: role === 'election_creator' ? 'My Elections' : 'My Votes', path: '/dashboard/elections' },
    { icon: <ShieldCheck size={20} />, label: 'Audit Logs', path: '/dashboard/audit' },
    { icon: <Settings size={20} />, label: 'Settings', path: '/dashboard/settings' },
  ];

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
        <Link to="/" className="d-flex align-items-center mb-12">
          <span className="h4 font-display fw-bold text-primary m-0">SecureVote</span>
        </Link>

        <nav className="d-flex flex-column gap-2 flex-grow">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
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
              <h1 className="h4 h2-md font-display m-0">
                {location.pathname === '/dashboard' ? 'Overview' : 
                 location.pathname.split('/').pop()?.replace(/^\w/, (c) => c.toUpperCase())}
              </h1>
              <p className="text-muted small d-none d-md-block">Welcome back to your secure dashboard.</p>
            </div>
          </div>
          <div className="d-flex align-items-center gap-3">
            <button className="glass p-3 rounded-xl hover:bg-white/5 relative">
              <Bell size={20} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full"></span>
            </button>
            <div className="glass p-1 rounded-xl d-flex align-items-center gap-2 pr-3">
              <div className="w-8 h-8 rounded-lg bg-primary d-flex align-items-center justify-content-center small fw-bold">
                {user?.email?.[0].toUpperCase()}
              </div>
              <span className="small fw-medium d-none d-lg-block">{user?.email?.split('@')[0]}</span>
            </div>
          </div>
        </header>

        <Outlet />
      </main>
    </div>
  );
};

export default DashboardLayout;
