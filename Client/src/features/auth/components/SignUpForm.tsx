import React, { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useNavigate, Link } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

export default function SignUpForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    role: 'voter' // Default
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const { data, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            name: formData.name,
            phone: formData.phone,
            role: formData.role, // Custom trigger will use this to populate profiles table
          }
        }
      });

      if (authError) throw authError;

      if (data.user) {
        setSuccess('Registration successful! Please check your email to verify your account.');
        setTimeout(() => navigate('/auth/login'), 5000);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to sign up');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form className="space-y-4" onSubmit={handleSignUp}>
      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded dark:bg-red-900/30">
          <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
        </div>
      )}
      {success && (
        <div className="bg-green-50 border-l-4 border-green-400 p-4 rounded dark:bg-green-900/30">
          <p className="text-sm text-green-700 dark:text-green-400">{success}</p>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Full Name</label>
        <input
          type="text"
          name="name"
          required
          value={formData.name}
          onChange={handleChange}
          className="mt-1 block w-full px-4 py-3 border border-slate-300 dark:border-white/10 rounded-xl shadow-sm focus:ring-2 focus:ring-primary focus:border-transparent sm:text-sm bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm dark:text-white transition-all"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Email address</label>
        <input
          type="email"
          name="email"
          required
          value={formData.email}
          onChange={handleChange}
          className="mt-1 block w-full px-4 py-3 border border-slate-300 dark:border-white/10 rounded-xl shadow-sm focus:ring-2 focus:ring-primary focus:border-transparent sm:text-sm bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm dark:text-white transition-all"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Phone (Optional)</label>
        <input
          type="tel"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          className="mt-1 block w-full px-4 py-3 border border-slate-300 dark:border-white/10 rounded-xl shadow-sm focus:ring-2 focus:ring-primary focus:border-transparent sm:text-sm bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm dark:text-white transition-all"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Password</label>
        <input
          type="password"
          name="password"
          required
          minLength={6}
          value={formData.password}
          onChange={handleChange}
          className="mt-1 block w-full px-4 py-3 border border-slate-300 dark:border-white/10 rounded-xl shadow-sm focus:ring-2 focus:ring-primary focus:border-transparent sm:text-sm bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm dark:text-white transition-all"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">I am registering as:</label>
        <select
          name="role"
          value={formData.role}
          onChange={handleChange}
          className="mt-1 block w-full px-4 py-3 border border-slate-300 dark:border-white/10 rounded-xl shadow-sm focus:ring-2 focus:ring-primary focus:border-transparent sm:text-sm bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm dark:text-white transition-all"
        >
          <option value="voter">Voter (Participate in elections)</option>
          <option value="election_creator">Election Creator (Host elections)</option>
        </select>
      </div>

      <div>
        <button
          type="submit"
          disabled={isLoading || !!success}
          className="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-xl shadow-lg shadow-primary/20 text-sm font-bold text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 transition-all transform hover:-translate-y-0.5"
        >
          {isLoading ? <Loader2 className="animate-spin h-5 w-5" /> : 'Sign up'}
        </button>
      </div>
      
      <div className="mt-4 text-center text-sm">
        <span className="text-slate-600 dark:text-slate-400">Already have an account? </span>
        <Link to="/auth/login" className="font-medium text-primary hover:text-primary/80">
          Sign in
        </Link>
      </div>
    </form>
  );
}
