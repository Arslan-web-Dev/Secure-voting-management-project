import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Link } from 'react-router-dom';
import { useAuthStore } from '@/store/useAuthStore';
import {
  Vote, Clock, Calendar, Search, LogIn,
  ShieldCheck, Users, BarChart3, Lock, CheckCircle2,
  Globe, Zap, Eye, Award, Fingerprint, KeyRound
} from 'lucide-react';
import { motion } from 'framer-motion';
import { ThemeToggle } from '@/components/ThemeToggle';

interface Election {
  id: string;
  title: string;
  description: string;
  status: string;
  start_date: string;
  end_date: string;
  max_voters: number;
}

// Floating icon component
const FloatingIcon = ({
  icon: Icon,
  className,
  delay = 0,
  duration = 4,
  x = [0, 10, -10, 0],
  y = [0, -15, -5, 0],
}: {
  icon: React.ElementType;
  className?: string;
  delay?: number;
  duration?: number;
  x?: number[];
  y?: number[];
}) => (
  <motion.div
    className={`absolute pointer-events-none ${className}`}
    animate={{ x, y }}
    transition={{ repeat: Infinity, duration, delay, ease: 'easeInOut' }}
  >
    <div className="p-3 rounded-2xl glass-card shadow-xl border-primary/10">
      <Icon className="h-6 w-6 text-primary" />
    </div>
  </motion.div>
);

const features = [
  {
    icon: ShieldCheck,
    title: 'Cryptographically Secure',
    desc: 'Every vote is protected with military-grade encryption and anonymous secret IDs.',
    color: 'from-violet-500 to-primary',
  },
  {
    icon: Eye,
    title: 'Fully Transparent',
    desc: 'Live real-time results and public audit trails ensure complete election integrity.',
    color: 'from-blue-500 to-cyan-500',
  },
  {
    icon: Zap,
    title: 'Instant Results',
    desc: 'Real-time vote tallying powered by Supabase Realtime — watch results update live.',
    color: 'from-amber-500 to-orange-500',
  },
  {
    icon: Users,
    title: 'Scalable',
    desc: 'Host elections for 10 or 100,000 voters with the same seamless experience.',
    color: 'from-green-500 to-emerald-500',
  },
  {
    icon: Fingerprint,
    title: 'Anonymous Voting',
    desc: 'Secret ID system ensures votes cannot be traced back to any individual.',
    color: 'from-rose-500 to-pink-500',
  },
  {
    icon: KeyRound,
    title: 'Role-Based Access',
    desc: 'Distinct dashboards for Admins, Election Creators, and Voters.',
    color: 'from-indigo-500 to-purple-500',
  },
];

const stats = [
  { value: '100%', label: 'Anonymous Voting', icon: Lock },
  { value: 'Real-time', label: 'Live Results', icon: BarChart3 },
  { value: '∞', label: 'Scalable Elections', icon: Globe },
  { value: 'Secure', label: 'Secret ID System', icon: Award },
];

export default function PublicLandingPage() {
  const { user } = useAuthStore();
  const [elections, setElections] = useState<Election[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchElections();
  }, []);

  const fetchElections = async () => {
    try {
      const { data, error } = await supabase
        .from('elections')
        .select('*')
        .neq('status', 'draft')
        .order('start_date', { ascending: true });
      if (error) throw error;
      setElections(data as Election[]);
    } catch (err) {
      console.error('Failed to load elections', err);
    }
  };

  const filteredElections = elections.filter(e => {
    if (filter !== 'all' && e.status !== filter) return false;
    if (searchTerm && !e.title.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#09090b] relative overflow-x-hidden font-sans selection:bg-primary/30">

      {/* Animated Background Mesh */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[40%] -left-[10%] w-[70%] h-[70%] rounded-full bg-primary/20 dark:bg-primary/10 blur-[120px] animate-blob mix-blend-multiply dark:mix-blend-screen opacity-70"></div>
        <div className="absolute top-[20%] -right-[10%] w-[60%] h-[60%] rounded-full bg-blue-400/20 dark:bg-blue-600/10 blur-[120px] animate-blob animation-delay-2000 mix-blend-multiply dark:mix-blend-screen opacity-70"></div>
        <div className="absolute -bottom-[20%] left-[20%] w-[60%] h-[60%] rounded-full bg-indigo-400/20 dark:bg-indigo-600/10 blur-[120px] animate-blob animation-delay-4000 mix-blend-multiply dark:mix-blend-screen opacity-70"></div>
        <div className="absolute inset-0 bg-grid-pattern opacity-30 dark:opacity-20"></div>
      </div>

      <div className="relative z-10">
        {/* Navbar */}
        <nav className="glass-card sticky top-0 z-50 border-x-0 border-t-0 border-b border-slate-200 dark:border-white/10 bg-white/70 dark:bg-[#09090b]/70">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-20">
              <div className="flex items-center">
                <div className="p-2 rounded-xl bg-gradient-to-br from-primary to-blue-600 text-white shadow-lg shadow-primary/30 mr-3">
                  <Vote className="h-6 w-6" />
                </div>
                <span className="text-2xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-400">
                  SecureVote
                </span>
              </div>
              <div className="flex items-center space-x-6">
                <a href="#features" className="hidden sm:block text-sm font-semibold text-slate-600 dark:text-slate-400 hover:text-primary transition-colors">Features</a>
                <a href="#elections" className="hidden sm:block text-sm font-semibold text-slate-600 dark:text-slate-400 hover:text-primary transition-colors">Elections</a>
                <ThemeToggle />
                {user ? (
                  <Link to="/dashboard" className="text-sm font-semibold text-slate-700 dark:text-slate-200 hover:text-primary transition-colors">
                    Dashboard &rarr;
                  </Link>
                ) : (
                  <Link to="/auth/login" className="inline-flex items-center px-6 py-2.5 rounded-full text-sm font-semibold text-white bg-slate-900 dark:bg-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5">
                    <LogIn className="mr-2 h-4 w-4" /> Sign In
                  </Link>
                )}
              </div>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <div className="relative pt-20 pb-8 sm:pt-28 overflow-hidden">
          {/* Floating Election-Related Icons */}
          <FloatingIcon icon={Vote}          className="top-16 left-[5%]   opacity-80 dark:opacity-60" delay={0}   duration={5} y={[0, -20, -5, 0]} />
          <FloatingIcon icon={ShieldCheck}   className="top-32 right-[6%]  opacity-80 dark:opacity-60" delay={1}   duration={4} y={[0, -12, -20, 0]} x={[0, 8, -8, 0]} />
          <FloatingIcon icon={CheckCircle2}  className="bottom-8 left-[12%] opacity-70 dark:opacity-50" delay={0.5} duration={6} y={[0, 10, -10, 0]} />
          <FloatingIcon icon={BarChart3}     className="top-10 right-[20%] opacity-70 dark:opacity-50" delay={2}   duration={5} y={[0, -8, 5, 0]}  x={[0, -12, 0, 0]} />
          <FloatingIcon icon={Lock}          className="bottom-20 right-[8%] opacity-80 dark:opacity-60" delay={1.5} duration={4.5} y={[0, 12, -8, 0]} />
          <FloatingIcon icon={Users}         className="top-24 left-[25%]  opacity-60 dark:opacity-40" delay={0.8} duration={7} y={[0, -6, 10, 0]} x={[0, 6, -6, 0]} />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, ease: 'easeOut' }}
              className="max-w-5xl mx-auto"
            >
              {/* Badge */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-semibold mb-8"
              >
                <span className="w-2 h-2 bg-primary rounded-full animate-pulse"></span>
                Trusted Election Platform
              </motion.div>

              <h1 className="text-5xl tracking-tight font-extrabold text-slate-900 dark:text-white sm:text-6xl md:text-7xl lg:text-8xl mb-8">
                <span className="block leading-tight">Democracy</span>
                <span className="block mt-1 bg-clip-text text-transparent bg-gradient-to-r from-primary via-indigo-500 to-blue-500 animate-gradient-x pb-4">
                  Reimagined
                </span>
              </h1>
              <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed mb-10">
                Run secure, anonymous, and transparent elections for any organization. Powered by cryptographic secret IDs and real-time results.
              </p>

              {!user && (
                <div className="flex flex-col sm:flex-row justify-center gap-4">
                  <Link to="/auth/signup" className="px-10 py-4 text-base font-bold rounded-full text-white bg-primary hover:bg-primary/90 shadow-xl shadow-primary/30 hover:shadow-primary/50 transition-all transform hover:-translate-y-1">
                    Start Free →
                  </Link>
                  <a href="#elections" className="px-10 py-4 text-base font-bold rounded-full text-slate-800 dark:text-white bg-white/60 dark:bg-white/10 border border-slate-200 dark:border-white/20 hover:bg-white dark:hover:bg-white/20 backdrop-blur-sm transition-all transform hover:-translate-y-1 shadow-lg">
                    View Elections
                  </a>
                </div>
              )}
            </motion.div>

            {/* Stats Bar */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.7 }}
              className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto"
            >
              {stats.map((stat, i) => (
                <motion.div
                  key={stat.label}
                  whileHover={{ scale: 1.05, y: -4 }}
                  className="glass-card rounded-2xl p-6 text-center group cursor-default"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 + i * 0.1 }}
                >
                  <stat.icon className="h-7 w-7 text-primary mx-auto mb-3 group-hover:scale-110 transition-transform" />
                  <p className="text-2xl font-extrabold text-slate-900 dark:text-white">{stat.value}</p>
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1">{stat.label}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>

        {/* Features Section */}
        <div id="features" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-4">
              Why SecureVote?
            </h2>
            <p className="text-lg text-slate-500 dark:text-slate-400 max-w-xl mx-auto">
              Built with the highest standards of security, transparency, and usability.
            </p>
          </motion.div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.6 }}
                whileHover={{ y: -8, scale: 1.02 }}
                className="glass-card rounded-3xl p-8 group cursor-default transition-all duration-300 hover:shadow-2xl hover:shadow-primary/10"
              >
                <div className={`inline-flex p-3.5 rounded-2xl bg-gradient-to-br ${feature.color} text-white shadow-lg mb-5 group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">{feature.title}</h3>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-sm">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* How it works banner */}
        <div className="py-16 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-blue-500/10 to-indigo-500/10 dark:from-primary/5 dark:via-blue-500/5 dark:to-indigo-500/5"></div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
            <div className="grid md:grid-cols-3 gap-8 text-center">
              {[
                { step: '01', title: 'Register', desc: 'Sign up and get approved to join or host elections on the platform.', icon: Users },
                { step: '02', title: 'Get Your Secret ID', desc: 'Receive a unique cryptographic secret ID to participate anonymously.', icon: KeyRound },
                { step: '03', title: 'Vote Securely', desc: 'Cast your vote. It\'s anonymous, recorded, and instantly counted.', icon: CheckCircle2 },
              ].map((step, i) => (
                <motion.div
                  key={step.step}
                  initial={{ opacity: 0, x: i === 0 ? -30 : i === 2 ? 30 : 0, y: i === 1 ? -20 : 0 }}
                  whileInView={{ opacity: 1, x: 0, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.2, duration: 0.7 }}
                  className="flex flex-col items-center"
                >
                  <div className="relative mb-4">
                    <div className="h-16 w-16 rounded-full bg-primary/10 dark:bg-primary/20 border-2 border-primary/30 flex items-center justify-center shadow-lg shadow-primary/10">
                      <step.icon className="h-7 w-7 text-primary" />
                    </div>
                    <span className="absolute -top-1 -right-1 h-6 w-6 rounded-full bg-primary text-white text-xs font-black flex items-center justify-center">{step.step}</span>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{step.title}</h3>
                  <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed max-w-xs">{step.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Elections Section */}
        <div id="elections" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="flex flex-col md:flex-row md:items-center md:justify-between mb-12 space-y-4 md:space-y-0"
          >
            <div>
              <h2 className="text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">Live Elections</h2>
              <p className="text-slate-500 dark:text-slate-400 mt-2">Browse and participate in ongoing public elections.</p>
            </div>

            <div className="flex space-x-3">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-slate-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="focus:ring-2 focus:ring-primary focus:border-primary block w-56 pl-11 py-2.5 sm:text-sm border-slate-200 dark:border-white/10 rounded-full bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm text-slate-900 dark:text-white transition-all shadow-sm"
                />
              </div>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="block pl-4 pr-10 py-2.5 text-sm border-slate-200 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-primary rounded-full bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm text-slate-900 dark:text-white shadow-sm transition-all"
              >
                <option value="all">All</option>
                <option value="active">Active</option>
                <option value="upcoming">Upcoming</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </motion.div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {filteredElections.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="col-span-full text-center py-24 glass-card rounded-3xl"
              >
                <Vote className="mx-auto h-12 w-12 text-slate-400 mb-4" />
                <p className="text-xl font-bold text-slate-500 dark:text-slate-400">No elections found.</p>
                <p className="text-slate-400 dark:text-slate-500 mt-2 text-sm">Check back later or adjust your search.</p>
              </motion.div>
            ) : (
              filteredElections.map((election, i) => (
                <motion.div
                  key={election.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1, duration: 0.5 }}
                  whileHover={{ y: -8, scale: 1.02 }}
                  className="glass-card rounded-3xl flex flex-col group transition-all duration-300 hover:shadow-2xl hover:shadow-primary/20"
                >
                  <div className="p-8 flex-1">
                    <div className="flex items-center justify-between mb-6">
                      <span className={`inline-flex items-center px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider
                        ${election.status === 'active'
                          ? 'bg-green-100 text-green-800 dark:bg-green-500/20 dark:text-green-300 border border-green-200 dark:border-green-500/30'
                          : election.status === 'completed'
                          ? 'bg-slate-100 text-slate-800 dark:bg-slate-500/20 dark:text-slate-300 border border-slate-200 dark:border-slate-500/30'
                          : 'bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-300 border border-blue-200 dark:border-blue-500/30'}`}>
                        {election.status === 'active' && <span className="w-2 h-2 mr-2 bg-green-500 rounded-full animate-pulse"></span>}
                        {election.status}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3 group-hover:text-primary transition-colors line-clamp-2">{election.title}</h3>
                    <p className="text-slate-600 dark:text-slate-400 mb-6 line-clamp-2 leading-relaxed text-sm">{election.description}</p>

                    <div className="space-y-2.5 p-4 rounded-2xl bg-slate-50/50 dark:bg-black/20 border border-slate-100 dark:border-white/5">
                      <div className="flex items-center text-sm text-slate-600 dark:text-slate-300 font-medium">
                        <Calendar className="flex-shrink-0 mr-3 h-4 w-4 text-primary" />
                        {new Date(election.start_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                      </div>
                      <div className="flex items-center text-sm text-slate-600 dark:text-slate-300 font-medium">
                        <Clock className="flex-shrink-0 mr-3 h-4 w-4 text-primary" />
                        {new Date(election.end_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                      </div>
                    </div>
                  </div>
                  <div className="p-6 pt-0">
                    <Link
                      to={user ? `/voter/polls/${election.id}` : '/auth/login'}
                      className="w-full flex items-center justify-center px-6 py-3.5 border border-transparent rounded-xl shadow-lg text-sm font-bold text-white bg-slate-900 dark:bg-primary hover:bg-slate-800 dark:hover:bg-primary/90 transition-all transform hover:-translate-y-0.5"
                    >
                      {election.status === 'active' ? '🗳️ Vote Now' : election.status === 'completed' ? '📊 View Results' : '📋 View Details'}
                    </Link>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>

        {/* Footer CTA */}
        {!user && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center"
          >
            <div className="glass-card rounded-3xl p-12 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-blue-500/5 to-transparent rounded-3xl"></div>
              <div className="relative z-10">
                <div className="inline-flex p-4 rounded-2xl bg-gradient-to-br from-primary to-blue-600 text-white shadow-2xl shadow-primary/30 mb-6">
                  <Vote className="h-8 w-8" />
                </div>
                <h2 className="text-4xl font-extrabold text-slate-900 dark:text-white mb-4">Ready to get started?</h2>
                <p className="text-slate-500 dark:text-slate-400 mb-8 text-lg max-w-xl mx-auto">
                  Join thousands of organizations running secure, democratic elections on SecureVote.
                </p>
                <Link to="/auth/signup" className="inline-flex items-center px-12 py-4 rounded-full text-lg font-bold text-white bg-primary hover:bg-primary/90 shadow-xl shadow-primary/30 hover:shadow-primary/50 transition-all transform hover:-translate-y-1">
                  Create Your Account
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
