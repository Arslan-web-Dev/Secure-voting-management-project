import React from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/useAuthStore';
import { LogOut, Home, Settings, User } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';

export default function DashboardLayout({ title, links }: { title: string, links: { name: string, path: string, icon: React.ReactNode }[] }) {
  const { profile, signOut } = useAuthStore();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth/login');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#09090b] flex overflow-hidden font-sans selection:bg-primary/30">
      
      {/* Background Mesh (Subtle for Dashboard) */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none opacity-40 dark:opacity-20">
        <div className="absolute top-[-20%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/20 blur-[120px] animate-blob mix-blend-multiply dark:mix-blend-screen"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[40%] h-[40%] rounded-full bg-blue-400/20 blur-[120px] animate-blob animation-delay-2000 mix-blend-multiply dark:mix-blend-screen"></div>
      </div>

      {/* Sidebar */}
      <aside className="relative z-10 w-72 m-4 mr-0 rounded-3xl glass-card flex flex-col shadow-2xl">
        <div className="h-24 flex items-center px-8 border-b border-slate-200/50 dark:border-white/5">
          <div className="p-2 rounded-xl bg-gradient-to-br from-primary to-blue-600 text-white shadow-lg shadow-primary/30 mr-3">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </div>
          <h1 className="text-xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-400 tracking-tight">{title}</h1>
        </div>
        
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {links.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              className="flex items-center px-4 py-3.5 text-sm font-bold text-slate-600 dark:text-slate-300 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-primary dark:hover:text-primary transition-all group"
            >
              <span className="mr-3 text-slate-400 group-hover:text-primary transition-colors">{link.icon}</span>
              {link.name}
            </Link>
          ))}
        </nav>

        <div className="p-6 border-t border-slate-200/50 dark:border-white/5 bg-slate-50/50 dark:bg-black/10 rounded-b-3xl">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-primary to-blue-500 flex items-center justify-center text-white font-bold shadow-md">
                {profile?.name?.charAt(0).toUpperCase() || <User className="h-5 w-5" />}
              </div>
              <div className="ml-3">
                <p className="text-sm font-bold text-slate-900 dark:text-white truncate max-w-[120px]">{profile?.name}</p>
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400 capitalize">{profile?.role.replace('_', ' ')}</p>
              </div>
            </div>
            <ThemeToggle />
          </div>
          <button
            onClick={handleSignOut}
            className="flex items-center justify-center w-full px-4 py-3 text-sm font-bold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10 rounded-xl hover:bg-red-100 dark:hover:bg-red-500/20 transition-colors"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Sign out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="relative z-10 flex-1 overflow-y-auto m-4 bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl rounded-3xl shadow-xl border border-slate-200/50 dark:border-white/5">
        <div className="p-8 lg:p-12">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
