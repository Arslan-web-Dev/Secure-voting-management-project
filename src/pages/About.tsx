import { motion } from 'framer-motion';
import { Shield, Lock, Eye, FileText, Users, Key, Database } from 'lucide-react';
import { Link } from 'react-router-dom';
import { fadeUp, staggerContainer, wave } from '../lib/animations';

const FEATURES = [
  {
    icon: <Lock size={28} />,
    title: 'End-to-End Encrypted Votes',
    desc: 'Every vote is encrypted before being stored. Not even system administrators can see individual votes — only aggregated results are visible after the election ends.',
  },
  {
    icon: <Eye size={28} />,
    title: 'Immutable Audit Logs',
    desc: 'Every action in the system — login, registration approval, vote cast — is permanently recorded in an immutable audit log that anyone can inspect.',
  },
  {
    icon: <Key size={28} />,
    title: 'Secret ID Verification',
    desc: 'Each approved voter receives a unique Secret ID. Votes are linked to hashed IDs, making it impossible to vote twice while keeping your identity private.',
  },
  {
    icon: <Users size={28} />,
    title: 'Role-Based Access Control',
    desc: 'Three roles — Super Admin, Election Creator, and Voter — each with strictly defined permissions. No role can access data outside its scope.',
  },
  {
    icon: <Database size={28} />,
    title: 'Row-Level Security (RLS)',
    desc: 'Database-level security policies ensure users can only read and write their own data. Even if the application layer were bypassed, data remains protected.',
  },
  {
    icon: <FileText size={28} />,
    title: 'Transparent Election Process',
    desc: 'Election creation, candidate registration, voter approvals, and result tallying are all publicly auditable. No black boxes in the process.',
  },
];

const HOW_IT_WORKS = [
  { step: '01', title: 'Election Creator applies', desc: 'An organization submits an application with their election purpose and details. Admin reviews and approves.' },
  { step: '02', title: 'Election is created', desc: 'The approved creator sets up the election — title, dates, candidates, and maximum voter slots.' },
  { step: '03', title: 'Voters register', desc: 'Eligible voters register for the election. The creator reviews and approves each registration.' },
  { step: '04', title: 'Secret IDs issued', desc: 'Approved voters receive a unique Secret ID via email — this is used to anonymously verify their identity at voting time.' },
  { step: '05', title: 'Secure voting', desc: 'During the election period, voters use their Secret ID to cast exactly one vote. The system prevents double voting without linking votes to identities.' },
  { step: '06', title: 'Results published', desc: 'After the election closes, results are computed from anonymized vote data and made publicly visible.' },
];

const About = () => (
  <div className="min-h-screen bg-deep text-main">
    {/* Navbar */}
    <nav className="glass sticky top-0 z-50 py-4">
      <div className="container d-flex align-items-center justify-content-between">
        <Link to="/" className="d-flex align-items-center">
          <span className="h4 font-display fw-bold text-primary m-0">SecureVote</span>
        </Link>
        <div className="d-flex align-items-center gap-6">
          <Link to="/elections" className="text-muted hover:text-main small fw-medium transition-all">Browse</Link>
          <Link to="/login" className="glass py-2 px-5 rounded-full small fw-bold hover:bg-white/5 transition-all">Sign In</Link>
          <Link to="/signup" className="btn-primary px-6 py-2 rounded-full small fw-bold">Register</Link>
        </div>
      </div>
    </nav>

    {/* Hero */}
    <section className="py-24" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
      <div className="container">
        <motion.div className="text-center" variants={staggerContainer} initial="hidden" animate="visible">
          <motion.div variants={fadeUp} className="d-inline-flex align-items-center gap-2 px-4 py-2 rounded-full mb-6"
            style={{ background: 'rgba(139,92,246,0.12)', border: '1px solid rgba(139,92,246,0.3)' }}>
            <Shield size={14} className="text-primary" />
            <span className="text-primary small fw-bold">Audit & Transparency</span>
          </motion.div>
          <motion.h1 variants={fadeUp} className="display-3 font-display fw-bold mb-5">
            How SecureVote<br />
            <span style={{ color: 'var(--primary)' }}>Protects Democracy</span>
          </motion.h1>
          <motion.p variants={fadeUp} className="text-muted lead" style={{ maxWidth: 580, margin: '0 auto' }}>
            SecureVote is built on the principle that every vote matters and every voter deserves privacy.
            Here's exactly how we ensure that — with no hidden processes.
          </motion.p>
        </motion.div>
      </div>
    </section>

    {/* Security Features */}
    <section className="py-20">
      <div className="container">
        <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true }}>
          <motion.h2 variants={fadeUp} className="h2 font-heading text-center mb-12">Security Architecture</motion.h2>
          <div className="row g-4">
            {FEATURES.map((f, i) => (
              <motion.div key={i} className="col-12 col-md-6 col-lg-4" variants={wave} custom={i}>
                <div className="glass-card h-100" style={{ padding: '1.75rem' }}>
                  <div className="d-inline-flex align-items-center justify-content-center rounded-2xl mb-4"
                    style={{ width: 56, height: 56, background: 'rgba(139,92,246,0.12)', border: '1px solid rgba(139,92,246,0.2)', color: 'var(--primary)' }}>
                    {f.icon}
                  </div>
                  <h3 className="h5 font-heading mb-3">{f.title}</h3>
                  <p className="text-muted small" style={{ lineHeight: 1.7 }}>{f.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>

    {/* How it Works */}
    <section className="py-20" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
      <div className="container">
        <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true }}>
          <motion.h2 variants={fadeUp} className="h2 font-heading text-center mb-4">The Voting Process</motion.h2>
          <motion.p variants={fadeUp} className="text-muted small text-center mb-12" style={{ maxWidth: 480, margin: '0 auto 3rem' }}>
            From election setup to final results — every step is transparent and verifiable.
          </motion.p>
          <div className="row g-4">
            {HOW_IT_WORKS.map((step, i) => (
              <motion.div key={i} className="col-12 col-md-6" variants={wave} custom={i}>
                <div className="glass-card d-flex gap-5" style={{ padding: '1.5rem' }}>
                  <div className="font-display fw-bold flex-shrink-0"
                    style={{ fontSize: 36, color: 'rgba(139,92,246,0.35)', lineHeight: 1 }}>
                    {step.step}
                  </div>
                  <div>
                    <h4 className="h6 font-heading mb-2">{step.title}</h4>
                    <p className="text-muted small" style={{ lineHeight: 1.7 }}>{step.desc}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>

    {/* Trust Banner */}
    <section className="py-16" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
      <div className="container">
        <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true }}>
          <motion.div variants={fadeUp} className="glass-card text-center py-12"
            style={{ background: 'rgba(139,92,246,0.05)', border: '1px solid rgba(139,92,246,0.2)' }}>
            <Shield size={48} className="text-primary mx-auto mb-5 opacity-80" />
            <h2 className="h3 font-heading mb-4">Open. Transparent. Verifiable.</h2>
            <p className="text-muted mb-8" style={{ maxWidth: 500, margin: '0 auto 2rem' }}>
              Every election, every vote, every approval is logged. The audit trail is available for all
              participants to review. We have nothing to hide.
            </p>
            <div className="d-flex flex-wrap justify-content-center gap-3">
              <Link to="/elections" className="btn-primary px-6 py-3 rounded-xl small fw-bold">
                Browse Elections
              </Link>
              <Link to="/dashboard/audit" className="glass px-6 py-3 rounded-xl small fw-bold hover:bg-white/5">
                View Audit Logs
              </Link>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>

    {/* Footer */}
    <footer className="py-8" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
      <div className="container d-flex flex-column flex-md-row align-items-center justify-content-between gap-4">
        <span className="font-display fw-bold text-primary">SecureVote</span>
        <p className="text-muted small m-0">© {new Date().getFullYear()} SecureVote. Built for transparent democracy.</p>
        <div className="d-flex gap-5">
          <Link to="/" className="text-muted small hover:text-main transition-all">Home</Link>
          <Link to="/elections" className="text-muted small hover:text-main transition-all">Elections</Link>
          <Link to="/login" className="text-muted small hover:text-main transition-all">Login</Link>
        </div>
      </div>
    </footer>
  </div>
);

export default About;
