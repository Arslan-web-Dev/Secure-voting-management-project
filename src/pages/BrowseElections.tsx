import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, Vote, ArrowLeft, Calendar, Users, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { fadeUp, staggerContainer, wave } from '../lib/animations';

interface Election {
  id: string;
  title: string;
  description: string;
  status: 'active' | 'upcoming' | 'completed' | 'draft' | 'published' | 'cancelled';
  end_date: string;
  start_date: string;
  category: string;
  max_voters: number;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  active:    { label: 'Live',      color: 'var(--success)', bg: 'rgba(0,245,160,0.12)' },
  published: { label: 'Open',      color: 'var(--success)', bg: 'rgba(0,245,160,0.12)' },
  upcoming:  { label: 'Upcoming',  color: 'var(--warning)', bg: 'rgba(255,184,0,0.12)' },
  draft:     { label: 'Draft',     color: 'var(--text-muted)', bg: 'rgba(255,255,255,0.07)' },
  completed: { label: 'Ended',     color: '#8b5cf6', bg: 'rgba(139,92,246,0.12)' },
  cancelled: { label: 'Cancelled', color: 'var(--error)', bg: 'rgba(255,51,102,0.12)' },
};

const BrowseElections = () => {
  const [elections, setElections] = useState<Election[]>([]);
  const [filtered, setFiltered] = useState<Election[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');

  useEffect(() => {
    const fetchElections = async () => {
      const { data, error } = await supabase
        .from('elections')
        .select('*')
        .neq('status', 'draft')
        .order('created_at', { ascending: false });
      if (!error && data) {
        setElections(data as Election[]);
        setFiltered(data as Election[]);
      }
      setLoading(false);
    };
    fetchElections();
  }, []);

  useEffect(() => {
    let result = [...elections];
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(e =>
        e.title.toLowerCase().includes(q) ||
        e.description?.toLowerCase().includes(q) ||
        e.category?.toLowerCase().includes(q)
      );
    }
    if (statusFilter !== 'all') result = result.filter(e => e.status === statusFilter);
    if (categoryFilter !== 'all') result = result.filter(e => e.category === categoryFilter);
    setFiltered(result);
  }, [search, statusFilter, categoryFilter, elections]);

  const categories = ['all', ...Array.from(new Set(elections.map(e => e.category).filter(Boolean)))];

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  return (
    <div className="min-h-screen bg-deep text-main">
      {/* Navbar */}
      <nav className="glass sticky top-0 z-50 py-4">
        <div className="container d-flex align-items-center justify-content-between">
          <Link to="/" className="d-flex align-items-center gap-3 text-muted hover:text-main small">
            <ArrowLeft size={16} />
            <span className="h4 font-display fw-bold text-primary m-0">SecureVote</span>
          </Link>
          <div className="d-flex gap-4">
            <Link to="/login" className="glass py-2 px-5 rounded-full small fw-bold hover:bg-white/5 transition-all">Sign In</Link>
            <Link to="/signup" className="btn-primary px-6 py-2 rounded-full small fw-bold">Register</Link>
          </div>
        </div>
      </nav>

      <div className="container py-16">
        {/* Header */}
        <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="mb-12">
          <motion.div variants={fadeUp} className="text-center mb-10">
            <div className="d-inline-flex align-items-center gap-2 px-4 py-2 rounded-full mb-5"
              style={{ background: 'rgba(139,92,246,0.12)', border: '1px solid rgba(139,92,246,0.3)' }}>
              <Vote size={14} className="text-primary" />
              <span className="text-primary small fw-bold">All Elections</span>
            </div>
            <h1 className="display-4 font-display fw-bold mb-4">Browse Elections</h1>
            <p className="text-muted" style={{ maxWidth: 540, margin: '0 auto' }}>
              Explore all active, upcoming, and completed elections. Register to cast your vote securely.
            </p>
          </motion.div>

          {/* Search & Filters */}
          <motion.div variants={fadeUp} className="glass-card p-5 d-flex flex-column flex-md-row align-items-stretch align-items-md-center gap-4">
            <div className="glass d-flex align-items-center gap-3 px-4 py-3 rounded-xl flex-grow-1">
              <Search size={18} className="text-muted flex-shrink-0" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search by title, description or category..."
                className="bg-transparent border-none text-main outline-none w-100 small"
              />
            </div>
            <div className="d-flex gap-3">
              <div className="glass d-flex align-items-center gap-2 px-3 py-3 rounded-xl">
                <Filter size={16} className="text-muted" />
                <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
                  className="bg-transparent border-none text-main outline-none small" style={{ minWidth: 110 }}>
                  <option value="all">All Status</option>
                  <option value="active">Live</option>
                  <option value="published">Open</option>
                  <option value="upcoming">Upcoming</option>
                  <option value="completed">Ended</option>
                </select>
              </div>
              <div className="glass d-flex align-items-center gap-2 px-3 py-3 rounded-xl">
                <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}
                  className="bg-transparent border-none text-main outline-none small" style={{ minWidth: 110 }}>
                  {categories.map(c => (
                    <option key={c} value={c}>{c === 'all' ? 'All Categories' : c}</option>
                  ))}
                </select>
              </div>
            </div>
          </motion.div>

          {/* Count */}
          <motion.p variants={fadeUp} className="text-muted small mt-4">
            Showing <strong className="text-main">{filtered.length}</strong> election{filtered.length !== 1 ? 's' : ''}
            {search && <> for "<strong className="text-primary">{search}</strong>"</>}
          </motion.p>
        </motion.div>

        {/* Elections Grid */}
        {loading ? (
          <div className="d-flex justify-content-center py-20">
            <div className="spinner" style={{ width: 40, height: 40 }} />
          </div>
        ) : filtered.length === 0 ? (
          <motion.div variants={fadeUp} initial="hidden" animate="visible"
            className="glass-card text-center py-20">
            <Vote size={64} className="mx-auto mb-4 opacity-10" />
            <h3 className="h4 font-heading mb-2">No elections found</h3>
            <p className="text-muted small">Try adjusting your search or filters.</p>
          </motion.div>
        ) : (
          <motion.div className="row g-4" variants={staggerContainer} initial="hidden" animate="visible">
            {filtered.map((election, i) => {
              const cfg = STATUS_CONFIG[election.status] ?? STATUS_CONFIG.draft;
              const isActive = election.status === 'active' || election.status === 'published';
              const isCompleted = election.status === 'completed';
              return (
                <motion.div key={election.id} className="col-12 col-md-6 col-lg-4"
                  variants={wave} custom={i}>
                  <div className="glass-card h-100 d-flex flex-column" style={{ padding: '1.5rem' }}>
                    {/* Status + Category */}
                    <div className="d-flex align-items-center justify-content-between mb-4">
                      <span className="px-3 py-1 rounded-full text-xs fw-bold"
                        style={{ background: cfg.bg, color: cfg.color }}>
                        {isActive && <span className="me-1">●</span>}{cfg.label}
                      </span>
                      {election.category && (
                        <span className="px-3 py-1 rounded-full text-xs"
                          style={{ background: 'rgba(255,255,255,0.07)', color: 'var(--text-muted)' }}>
                          {election.category}
                        </span>
                      )}
                    </div>

                    {/* Title */}
                    <h3 className="h5 font-heading mb-2" style={{ lineHeight: 1.3 }}>{election.title}</h3>
                    <p className="text-muted small mb-4 flex-grow-1"
                      style={{ display: '-webkit-box', WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {election.description || 'No description provided.'}
                    </p>

                    {/* Meta */}
                    <div className="d-flex flex-column gap-2 mb-5">
                      <div className="d-flex align-items-center gap-2 text-muted" style={{ fontSize: 12 }}>
                        <Calendar size={13} />
                        <span>
                          {isCompleted
                            ? `Ended ${formatDate(election.end_date)}`
                            : `Ends ${formatDate(election.end_date)}`}
                        </span>
                      </div>
                      <div className="d-flex align-items-center gap-2 text-muted" style={{ fontSize: 12 }}>
                        <Users size={13} />
                        <span>Max {election.max_voters?.toLocaleString()} voters</span>
                      </div>
                    </div>

                    {/* CTA */}
                    <Link to={`/election/${election.id}`}
                      className="glass py-3 px-4 rounded-xl small fw-bold d-flex align-items-center justify-content-between hover:bg-white/5 transition-all mt-auto"
                      style={{ border: isActive ? '1px solid rgba(139,92,246,0.35)' : undefined }}>
                      <span style={{ color: isActive ? 'var(--primary)' : 'var(--text-muted)' }}>
                        {isCompleted ? 'View Results' : isActive ? 'Vote Now' : 'View Details'}
                      </span>
                      <ChevronRight size={16} className="text-muted" />
                    </Link>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default BrowseElections;
