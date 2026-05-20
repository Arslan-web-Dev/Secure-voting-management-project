import React from 'react';
import { Outlet } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function AuthLayout() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#09090b] flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden font-sans">
      
      {/* Animated Mesh Gradient Background */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-primary/20 dark:bg-primary/10 blur-[100px] animate-blob mix-blend-multiply dark:mix-blend-screen opacity-70"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-blue-400/20 dark:bg-blue-600/10 blur-[100px] animate-blob animation-delay-2000 mix-blend-multiply dark:mix-blend-screen opacity-70"></div>
        <div className="absolute top-[30%] left-[30%] w-[40%] h-[40%] rounded-full bg-indigo-400/20 dark:bg-indigo-600/10 blur-[100px] animate-blob animation-delay-4000 mix-blend-multiply dark:mix-blend-screen opacity-70"></div>
        <div className="absolute inset-0 bg-grid-pattern opacity-30 dark:opacity-20"></div>
      </div>

      <div className="relative z-10 sm:mx-auto sm:w-full sm:max-w-md">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="text-center"
        >
          <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-gradient-to-br from-primary to-blue-600 text-white shadow-lg shadow-primary/30 mb-6">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </div>
          <h2 className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            SecureVote
          </h2>
          <p className="mt-3 text-lg text-slate-600 dark:text-slate-400 font-medium">
            Enterprise-grade voting management
          </p>
        </motion.div>
      </div>

      <div className="relative z-10 mt-10 sm:mx-auto sm:w-full sm:max-w-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
          className="glass-card py-10 px-6 sm:rounded-3xl sm:px-12 relative"
        >
          {/* Subtle top border highlight for premium feel */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-blue-500 to-indigo-500 rounded-t-3xl opacity-80"></div>
          
          <Outlet />
        </motion.div>
      </div>
    </div>
  );
}
