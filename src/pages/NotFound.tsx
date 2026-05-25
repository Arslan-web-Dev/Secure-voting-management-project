import { motion } from 'framer-motion';
import { Home, Search, ArrowLeft } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { bounceIn, fadeUp, staggerContainer } from '../lib/animations';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center bg-deep text-main overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <motion.div
          className="neon-blob neon-blob-primary"
          style={{ top: '10%', left: '10%' }}
          animate={{ scale: [1, 1.4, 1], rotate: [0, 180, 360] }}
          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
        />
        <motion.div
          className="neon-blob neon-blob-secondary"
          style={{ bottom: '10%', right: '10%' }}
          animate={{ scale: [1, 1.2, 1], rotate: [360, 180, 0] }}
          transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
        />
      </div>

      <motion.div
        className="text-center container"
        style={{ maxWidth: 520, position: 'relative', zIndex: 1 }}
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        {/* Big 404 */}
        <motion.div variants={bounceIn} className="mb-6">
          <h1
            className="font-display fw-bold"
            style={{
              fontSize: 'clamp(6rem, 20vw, 12rem)',
              lineHeight: 1,
              background: 'linear-gradient(135deg, #8b5cf6, #ec4899)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              letterSpacing: '-0.04em',
            }}
          >
            404
          </h1>
        </motion.div>

        <motion.h2 variants={fadeUp} className="h3 font-heading mb-4">
          Page Not Found
        </motion.h2>

        <motion.p variants={fadeUp} className="text-muted mb-10" style={{ lineHeight: 1.7 }}>
          The page you're looking for doesn't exist or has been moved.
          Let's get you back on track.
        </motion.p>

        <motion.div variants={fadeUp} className="d-flex flex-column flex-sm-row justify-content-center gap-4">
          <Link
            to="/"
            className="btn-primary px-6 py-3 rounded-xl small fw-bold d-flex align-items-center justify-content-center gap-2"
          >
            <Home size={16} /> Go Home
          </Link>
          <button
            onClick={() => navigate(-1)}
            className="glass px-6 py-3 rounded-xl small fw-bold d-flex align-items-center justify-content-center gap-2 hover:bg-white/5 transition-all"
          >
            <ArrowLeft size={16} /> Go Back
          </button>
          <Link
            to="/elections"
            className="glass px-6 py-3 rounded-xl small fw-bold d-flex align-items-center justify-content-center gap-2 hover:bg-white/5 transition-all"
          >
            <Search size={16} /> Browse Elections
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default NotFound;
