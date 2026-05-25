import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

import { Vote, Shield, BarChart3, Users, Clock, Search, ChevronRight, Menu, X, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { fadeUp, fadeLeft, fadeRight, scaleUp, bounceIn, elasticPop, wave, staggerContainer } from '../lib/animations';

interface Election {
  id: string;
  title: string;
  description: string;
  status: 'active' | 'upcoming' | 'completed';
  end_date: string;
  category: string;
}

const LandingPage = () => {
  const [elections, setElections] = useState<Election[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchElections = async () => {
      const { data, error } = await supabase
        .from('elections')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (!error && data) {
        setElections(data as Election[]);
      }
      setLoading(false);
    };

    fetchElections();
  }, []);


  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-deep text-main overflow-x-hidden">
      {/* Navbar */}
      <nav className="glass sticky top-0 z-50 py-4">
        <div className="container d-flex align-items-center justify-content-between">
          <Link to="/" className="d-flex align-items-center">
            <span className="h4 font-display fw-bold text-primary m-0">SecureVote</span>
          </Link>
          
          {/* Desktop Nav */}
          <div className="d-none d-lg-flex align-items-center gap-8">
            <div className="d-flex gap-6">
              <Link to="/elections" className="text-muted hover:text-main small fw-medium transition-all">Browse</Link>
              <Link to="/about" className="text-muted hover:text-main small fw-medium transition-all">Audit</Link>
            </div>
            <div className="d-flex gap-4">
              <Link to="/login" className="glass py-2 px-5 rounded-full small fw-bold hover:bg-white/5 transition-all">Sign In</Link>
              <Link to="/signup" className="btn-primary px-6 py-2 rounded-full small fw-bold shadow-lg shadow-primary/20">Register</Link>
            </div>
          </div>

          {/* Mobile Toggle */}
          <button 
            className="d-lg-none glass p-2 rounded-xl"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Nav Dropdown */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="d-lg-none border-top border-white/5 bg-deep/80 backdrop-blur-xl overflow-hidden"
            >
              <div className="container py-8 d-flex flex-column gap-6">
                <div className="d-flex flex-column gap-4">
                  <Link to="/elections" className="h4 m-0 font-display" onClick={() => setIsMenuOpen(false)}>Browse Elections</Link>
                  <Link to="/about" className="h4 m-0 font-display" onClick={() => setIsMenuOpen(false)}>System Audit</Link>
                </div>
                <div className="d-flex flex-column gap-3 pt-6 border-top border-white/5">
                  <Link to="/login" className="btn-primary w-full py-4 rounded-2xl justify-content-center" onClick={() => setIsMenuOpen(false)}>Sign In</Link>
                  <Link to="/signup" className="glass w-full py-4 rounded-2xl justify-content-center" onClick={() => setIsMenuOpen(false)}>Create Account</Link>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Hero Section */}
      <section className="py-24 relative overflow-hidden">
        <motion.div 
          className="neon-blob neon-blob-primary top-0 left-0"
          animate={{ scale: [1, 1.2, 1], x: [0, 50, 0], y: [0, -30, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div 
          className="neon-blob neon-blob-secondary bottom-0 right-0"
          animate={{ scale: [1, 1.3, 1], x: [0, -40, 0], y: [0, 40, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div 
          className="neon-blob neon-blob-success top-1/2 left-1/2"
          animate={{ scale: [1, 1.1, 1], rotate: [0, 180, 360] }}
          transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
        />
        <div className="container relative z-10">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            className="text-center max-w-4xl mx-auto"
          >
            <motion.span 
              className="glass py-2 px-4 rounded-full text-xs fw-bold text-primary mb-6 d-inline-block border-primary/20"
              variants={elasticPop}
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
            >
              <Sparkles size={12} className="d-inline-block mr-2" />
              V 2.0 IS NOW LIVE • SECURE & ANONYMOUS
            </motion.span>
            <motion.h1 
              className="h1 h1-md display-1-lg fw-bold mb-6 font-display reveal-anim"
              variants={fadeUp}
            >
              Democracy, <br />
              <motion.span 
                className="text-gradient glow-text"
                animate={{ backgroundPosition: ['0%', '100%', '0%'] }}
                transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
                style={{ backgroundSize: '200% 200%' }}
              >
                Reimagined Digitally.
              </motion.span>
            </motion.h1>
            <motion.p 
              className="h5 text-muted mb-10 fw-normal lh-base max-w-2xl mx-auto"
              variants={fadeUp}
            >
              The world's most advanced voting infrastructure. Powered by cryptographic integrity and user-centric design.
            </motion.p>
            <motion.div 
              className="d-flex flex-column flex-md-row justify-content-center gap-4 px-6 px-md-0"
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
            >
              <motion.div variants={bounceIn} whileHover={{ y: -4 }} whileTap={{ scale: 0.95 }} transition={{ duration: 0.2 }}>
                <Link to="/signup" className="btn-primary px-10 py-4 h5 rounded-2xl shadow-xl shadow-primary/20">
                  Launch Election <ChevronRight size={20} />
                </Link>
              </motion.div>
              <motion.div variants={bounceIn} whileHover={{ y: -4 }} whileTap={{ scale: 0.95 }} transition={{ duration: 0.2 }}>
                <Link to="/about" className="glass-deep px-10 py-4 rounded-2xl h5 hover:bg-white/10 transition-all border-white/5">
                  View Audit Log
                </Link>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Bento Stats Section */}
      <section className="py-20">
        <div className="container">
          <motion.div 
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="bento-grid"
          >
            <motion.div 
              variants={fadeLeft} 
              className="bento-item wide glass-deep p-10 rounded-[2rem] relative overflow-hidden"
              whileHover={{ y: -8 }}
              transition={{ duration: 0.3 }}
            >
              <motion.div 
                className="absolute top-0 right-0 w-64 h-64 bg-primary/10 blur-3xl -z-10"
                animate={{ x: [0, 20, 0], y: [0, -20, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              />
              <div className="relative z-10">
                <motion.div
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                >
                  <Shield size={40} className="text-primary mb-6" />
                </motion.div>
                <h3 className="h2 font-display mb-4">Unrivaled Security</h3>
                <p className="text-muted lead mb-0">Every vote is cryptographically hashed and verified against our tamper-proof ledger, ensuring total immutability.</p>
              </div>
            </motion.div>

            <motion.div 
              variants={fadeUp} 
              className="bento-item glass-deep p-10 rounded-[2rem] d-flex flex-column justify-content-between"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.3 }}
            >
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              >
                <Users size={32} className="text-secondary" />
              </motion.div>
              <div>
                <h4 className="h3 font-display mb-2">Anonymous</h4>
                <p className="text-muted small m-0">Zero-knowledge proof systems ensure your identity remains yours alone.</p>
              </div>
            </motion.div>

            <motion.div 
              variants={fadeUp} 
              className="bento-item glass-deep p-10 rounded-[2rem] d-flex flex-column justify-content-between"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.3 }}
            >
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
              >
                <BarChart3 size={32} className="text-success" />
              </motion.div>
              <div>
                <h4 className="h3 font-display mb-2">Live Insights</h4>
                <p className="text-muted small m-0">Real-time data visualization for engagement and turnout metrics.</p>
              </div>
            </motion.div>

            <motion.div 
              variants={fadeUp} 
              className="bento-item glass-deep p-10 rounded-[2rem] d-flex flex-column justify-content-between bg-gradient-to-br from-primary/10 to-transparent"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.3 }}
            >
              <motion.div
                animate={{ rotate: [-10, 10, -10] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              >
                <Clock size={32} className="text-warning" />
              </motion.div>
              <div>
                <h4 className="h3 font-display mb-2">Automated</h4>
                <p className="text-muted small m-0">Smart scheduling for polling periods and automatic results generation.</p>
              </div>
            </motion.div>

            <motion.div 
              variants={fadeRight} 
              className="bento-item wide glass-deep p-10 rounded-[2rem] d-flex align-items-center justify-content-between"
              whileHover={{ y: -8 }}
              transition={{ duration: 0.3 }}
            >
              <div>
                <h3 className="h2 font-display mb-2">Ready to contribute?</h3>
                <p className="text-muted m-0">Join 5,000+ organizations already using SecureVote.</p>
              </div>
              <motion.div whileHover={{ scale: 1.1, rotate: 90 }} transition={{ duration: 0.3 }}>
                <Link to="/signup" className="btn-primary p-4 rounded-2xl">
                  <ChevronRight size={32} />
                </Link>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Featured Elections */}
      <section className="py-24 relative">
        <div className="container">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="d-flex flex-column flex-md-row align-items-md-center justify-content-between mb-16 gap-6"
          >
            <motion.div variants={fadeLeft}>
              <h2 className="display-5 font-display mb-2">Featured Elections</h2>
              <p className="text-muted h5 fw-normal">Discover active democratic processes happening right now.</p>
            </motion.div>
            <motion.div 
              variants={fadeRight}
              className="glass-deep d-flex align-items-center gap-3 px-6 py-3 rounded-2xl border-white/5"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.3 }}
            >
              <motion.div
                animate={{ x: [0, 5, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              >
                <Search size={20} className="text-muted" />
              </motion.div>
              <input type="text" placeholder="Find an election..." className="bg-transparent border-none text-main outline-none h6 m-0" />
            </motion.div>
          </motion.div>

          <motion.div 
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="row g-6"
          >
            {loading ? (
              [1, 2, 3].map((i) => (
                <motion.div key={i} className="col-md-4" variants={scaleUp}>
                  <div className="glass-card h-80 animate-pulse"></div>
                </motion.div>
              ))
            ) : elections.length > 0 ? (
              elections.slice(0, 6).map((election, index) => (
                <motion.div 
                  key={election.id} 
                  className="col-md-6 col-lg-4"
                  variants={wave}
                  custom={index}
                  whileHover={{ y: -8 }}
              transition={{ duration: 0.3 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="glass-deep p-8 rounded-[2rem] h-full d-flex flex-column border-white/5 relative overflow-hidden">
                    <motion.div 
                      className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-2xl -z-10"
                      animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0] }}
                      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    />
                    <div className="d-flex justify-content-between align-items-center mb-6">
                      <motion.span 
                        className={`px-4 py-1.5 rounded-full text-[10px] fw-bold tracking-widest d-inline-flex align-items-center gap-2 ${
                          election.status === 'active' ? 'bg-success/20 text-success' : 
                          election.status === 'upcoming' ? 'bg-primary/20 text-primary' : 
                          'bg-white/5 text-muted'
                        }`}
                        whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.3 }}
                      >
                        {election.status === 'active' && <span className="pulse-beacon"></span>}
                        {election.status.toUpperCase()}
                      </motion.span>
                      <span className="text-muted text-xs font-display">{election.category}</span>
                    </div>
                    <h3 className="h4 font-display mb-4 line-clamp-1">{election.title}</h3>
                    <p className="text-muted small line-clamp-3 mb-8 flex-grow">
                      {election.description}
                    </p>
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} transition={{ duration: 0.2 }}>
                      <Link to={`/election/${election.id}`} className="btn-primary w-full py-4 rounded-2xl justify-content-center h6 m-0">
                        Explore Election
                      </Link>
                    </motion.div>
                  </div>
                </motion.div>
              ))
            ) : (
              <motion.div className="col-12" variants={fadeUp}>
                <div className="glass-deep p-20 rounded-[3rem] text-center border-dashed border-white/10">
                  <motion.div
                    animate={{ y: [0, -20, 0], rotate: [0, 10, 0] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  >
                    <Vote size={64} className="mx-auto mb-6 opacity-10" />
                  </motion.div>
                  <h3 className="h4 text-muted">No active elections at the moment.</h3>
                </div>
              </motion.div>
            )}
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 border-top border-white/5 bg-black/20">
        <div className="container">
          <div className="row g-10 align-items-center">
            <div className="col-md-6 text-center text-md-start">
              <Link to="/" className="d-flex align-items-center justify-content-center justify-content-md-start mb-6">
                <span className="h4 font-display fw-bold text-primary m-0">SecureVote</span>
              </Link>
              <p className="text-muted small max-w-sm">The decentralized, end-to-end verifiable voting platform for the next generation of organizations.</p>
            </div>
            <div className="col-md-6">
              <div className="d-flex justify-content-center justify-content-md-end gap-8">
                <a href="#" className="text-muted hover:text-primary transition-all small fw-bold">Twitter</a>
                <a href="#" className="text-muted hover:text-primary transition-all small fw-bold">Github</a>
                <a href="#" className="text-muted hover:text-primary transition-all small fw-bold">Docs</a>
              </div>
            </div>
          </div>
          <div className="mt-16 pt-8 border-top border-white/5 text-center">
            <p className="text-muted text-[10px] tracking-widest uppercase m-0">© 2026 SecureVote infrastructure • Premium Semester Project</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
